import { Job } from 'bullmq';
import { IdentificationJobData } from './queue';
import identificationService from '../services/identificationService';
import prisma from '../database/prisma';
import { IdentificationSource, SightingStatus } from '@prisma/client';

export interface IdentificationProcessResult {
  sightingId: string;
  matched: boolean;
  speciesId?: number;
  speciesName?: string;
  confidence?: number;
}

/**
 * BullMQ Worker processor that executes automated computer vision insect classification.
 *
 * 1. Reads sighting ID and image URL from job data.
 * 2. Fetches label annotations from Google Cloud Vision API.
 * 3. Matches candidate labels against catalog species.
 * 4. Records an Identification entry with source = AI.
 * 5. Transitions Sighting status to IDENTIFIED if confidence > 0.70.
 */
export const processIdentificationJob = async (
  job: Job<IdentificationJobData>
): Promise<IdentificationProcessResult> => {
  const { sightingId, imageUrl } = job.data;

  // 1. Fetch sighting to retrieve user identity and confirm record exists
  let sighting;
  try {
    sighting = await prisma.sighting.findUnique({
      where: { id: sightingId },
    });
  } catch (err) {
    console.warn(`[AI Worker] Database query failed for sighting ${sightingId}:`, err);
    return { sightingId, matched: false };
  }

  if (!sighting) {
    console.warn(`[AI Worker] Sighting ${sightingId} not found in database, skipping job.`);
    return { sightingId, matched: false };
  }

  // 2. Fetch label annotations from Google Cloud Vision API or fallback
  const labels = await identificationService.annotateImage(imageUrl);

  // 3. Match labels against biological taxonomy in database
  const match = await identificationService.matchLabelsToSpecies(labels);

  if (match) {
    const isHighConfidence = match.confidence > 0.7;

    try {
      // 4. Create Identification record with source = AI
      await prisma.identification.create({
        data: {
          sightingId,
          userId: sighting.userId,
          speciesId: match.species.id,
          source: IdentificationSource.AI,
          confidence: match.confidence,
          isAccepted: isHighConfidence,
        },
      });

      // 5. Update Sighting status and confidence
      await prisma.sighting.update({
        where: { id: sightingId },
        data: {
          speciesId: match.species.id,
          aiConfidence: match.confidence,
          status: isHighConfidence ? SightingStatus.IDENTIFIED : SightingStatus.PENDING,
        },
      });
    } catch (err) {
      console.warn(`[AI Worker] Failed to update sighting ${sightingId} in database:`, err);
    }

    return {
      sightingId,
      matched: true,
      speciesId: match.species.id,
      speciesName: match.species.commonName,
      confidence: match.confidence,
    };
  }

  return {
    sightingId,
    matched: false,
  };
};

export default processIdentificationJob;
