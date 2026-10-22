import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { Job } from 'bullmq';
import { processIdentificationJob } from '../../../src/jobs/identifyInsect.job';
import { IdentificationJobData } from '../../../src/jobs/queue';
import prisma from '../../../src/database/prisma';
import identificationService from '../../../src/services/identificationService';
import { SightingStatus } from '@prisma/client';

describe('IdentifyInsect Job Unit Tests', () => {
  it('returns matched: false when sighting record does not exist in database', async () => {
    const originalFindUnique = prisma.sighting.findUnique;
    // Mock sighting not found
    (prisma.sighting as any).findUnique = async () => null;

    try {
      const mockJob = {
        data: {
          sightingId: 'non-existent-id',
          imageUrl: 'https://example.com/insect.jpg',
        },
      } as Job<IdentificationJobData>;

      const result = await processIdentificationJob(mockJob);
      assert.equal(result.matched, false);
      assert.equal(result.sightingId, 'non-existent-id');
    } finally {
      prisma.sighting.findUnique = originalFindUnique;
    }
  });

  it('updates sighting status to UNIDENTIFIED when no species match is found', async () => {
    const originalFindUnique = prisma.sighting.findUnique;
    const originalUpdate = prisma.sighting.update;
    const originalAnnotate = identificationService.annotateImage;
    const originalMatch = identificationService.matchLabelsToSpecies;

    let updatedData: any = null;

    (prisma.sighting as any).findUnique = async () => ({
      id: 'test-sighting-1',
      userId: 'user-123',
      status: SightingStatus.PENDING,
    });

    (prisma.sighting as any).update = async (args: any) => {
      updatedData = args;
      return { id: 'test-sighting-1', ...args.data };
    };

    identificationService.annotateImage = async () => [
      { description: 'Random Object', score: 0.4 },
    ];
    identificationService.matchLabelsToSpecies = async () => null;

    try {
      const mockJob = {
        data: {
          sightingId: 'test-sighting-1',
          imageUrl: 'https://example.com/unidentified.jpg',
        },
      } as Job<IdentificationJobData>;

      const result = await processIdentificationJob(mockJob);
      assert.equal(result.matched, false);
      assert.equal(result.sightingId, 'test-sighting-1');
      assert.ok(updatedData !== null, 'Expected prisma.sighting.update to have been called');
      assert.equal(updatedData.where.id, 'test-sighting-1');
      assert.equal(updatedData.data.status, SightingStatus.UNIDENTIFIED);
    } finally {
      prisma.sighting.findUnique = originalFindUnique;
      prisma.sighting.update = originalUpdate;
      identificationService.annotateImage = originalAnnotate;
      identificationService.matchLabelsToSpecies = originalMatch;
    }
  });
});
