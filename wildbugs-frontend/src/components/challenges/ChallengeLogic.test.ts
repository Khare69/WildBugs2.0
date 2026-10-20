import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  formatDaysLeft,
  getCriteriaLabel,
  filterChallenges,
  calculateChallengeMetrics,
} from './challengeUtils.ts';
import type { ChallengeItem } from '../../types/challenge.ts';

describe('Seasonal Challenge Logic Unit Tests', () => {
  const sampleChallenges: ChallengeItem[] = [
    {
      id: 1,
      title: 'Spring Pollinator BioBlitz',
      description: 'Document 5 sightings',
      criteria: { type: 'sightings_count', target: 5, icon: '🐝' },
      scope: 'INDIVIDUAL',
      startsAt: '2026-10-18T00:00:00.000Z',
      endsAt: '2026-11-15T00:00:00.000Z',
      createdAt: '2026-10-18T00:00:00.000Z',
      status: 'ACTIVE',
      daysLeft: 26,
      participantCount: 12,
      userProgress: {
        joined: true,
        progress: 5,
        target: 5,
        percentage: 100,
        completed: true,
        completedAt: '2026-10-19T10:00:00.000Z',
      },
    },
    {
      id: 2,
      title: 'Biodiversity Cataloger Quest',
      description: 'Discover 3 unique species',
      criteria: { type: 'unique_species', target: 3, icon: '🦋' },
      scope: 'INDIVIDUAL',
      startsAt: '2026-10-15T00:00:00.000Z',
      endsAt: '2026-11-10T00:00:00.000Z',
      createdAt: '2026-10-15T00:00:00.000Z',
      status: 'ACTIVE',
      daysLeft: 21,
      participantCount: 8,
      userProgress: {
        joined: true,
        progress: 1,
        target: 3,
        percentage: 33,
        completed: false,
        completedAt: null,
      },
    },
    {
      id: 3,
      title: 'Lepidoptera Wingspan Search',
      description: 'Find 2 butterflies',
      criteria: { type: 'family', family: 'Nymphalidae', target: 2, icon: '🌺' },
      scope: 'INDIVIDUAL',
      startsAt: '2026-10-19T00:00:00.000Z',
      endsAt: '2026-11-02T00:00:00.000Z',
      createdAt: '2026-10-19T00:00:00.000Z',
      status: 'ACTIVE',
      daysLeft: 13,
      participantCount: 5,
      userProgress: {
        joined: false,
        progress: 0,
        target: 2,
        percentage: 0,
        completed: false,
        completedAt: null,
      },
    },
    {
      id: 4,
      title: 'Autumn Equinox BioBlitz',
      description: 'Past equinox quest',
      criteria: { type: 'verified_count', target: 4, icon: '🍂' },
      scope: 'TEAM',
      startsAt: '2026-09-01T00:00:00.000Z',
      endsAt: '2026-09-30T00:00:00.000Z',
      createdAt: '2026-09-01T00:00:00.000Z',
      status: 'ENDED',
      daysLeft: 0,
      participantCount: 30,
      userProgress: undefined,
    },
  ];

  it('formats remaining countdown days accurately across statuses', () => {
    assert.equal(formatDaysLeft(0, 'ENDED'), 'Challenge Concluded');
    assert.equal(formatDaysLeft(-5, 'ENDED'), 'Challenge Concluded');
    assert.equal(formatDaysLeft(10, 'UPCOMING'), 'Starts Soon');
    assert.equal(formatDaysLeft(1, 'ACTIVE'), 'Ends Tomorrow 🔥');
    assert.equal(formatDaysLeft(14, 'ACTIVE'), '14 days remaining');
  });

  it('generates readable criteria goal instructions', () => {
    assert.equal(
      getCriteriaLabel({ type: 'sightings_count', target: 5 }),
      'Record 5 field insect observations'
    );
    assert.equal(
      getCriteriaLabel({ type: 'unique_species', target: 3 }),
      'Catalog 3 distinct insect species'
    );
    assert.equal(
      getCriteriaLabel({ type: 'family', family: 'Nymphalidae', target: 2 }),
      'Spotted 2 Nymphalidae specimens'
    );
    assert.equal(
      getCriteriaLabel({ type: 'verified_count', target: 1 }),
      'Earn 1 verified observation'
    );
  });

  it('filters challenge list according to navigation tab selections', () => {
    const all = filterChallenges(sampleChallenges, 'all');
    assert.equal(all.length, 4);

    const active = filterChallenges(sampleChallenges, 'active');
    assert.equal(active.length, 3);
    assert.equal(active.every((c) => c.status === 'ACTIVE'), true);

    const joined = filterChallenges(sampleChallenges, 'joined');
    assert.equal(joined.length, 2);
    assert.equal(joined.every((c) => Boolean(c.userProgress?.joined)), true);

    const completed = filterChallenges(sampleChallenges, 'completed');
    assert.equal(completed.length, 1);
    assert.equal(completed[0].id, 1);
    assert.equal(completed[0].userProgress?.completed, true);
  });

  it('calculates aggregate challenge metrics for overview ribbons', () => {
    const metrics = calculateChallengeMetrics(sampleChallenges);
    assert.equal(metrics.total, 4);
    assert.equal(metrics.activeCount, 3);
    assert.equal(metrics.joinedCount, 2);
    assert.equal(metrics.completedCount, 1);
  });
});
