import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import type { LeaderboardEntry, LeaderboardMetric } from '../../types/user.ts';

describe('Leaderboard Logic Unit Tests', () => {
  const sampleRankings: LeaderboardEntry[] = [
    {
      rank: 1,
      userId: 'user-champion-1',
      displayName: 'Dr. Evelyn Mantis',
      avatarUrl: 'https://images.unsplash.com/avatar-1.jpg',
      role: 'EXPERT',
      score: 184,
      metric: 'sightings',
    },
    {
      rank: 2,
      userId: 'user-silver-2',
      displayName: 'Arun Field Naturalist',
      avatarUrl: null,
      role: 'USER',
      score: 142,
      metric: 'sightings',
    },
    {
      rank: 3,
      userId: 'user-bronze-3',
      displayName: 'Maya Spider Scout',
      avatarUrl: null,
      role: 'USER',
      score: 98,
      metric: 'sightings',
    },
    {
      rank: 4,
      userId: 'user-fourth-4',
      displayName: 'Leo Coleoptera',
      avatarUrl: null,
      role: 'USER',
      score: 76,
      metric: 'sightings',
    },
  ];

  it('correctly maps medals to top 3 and numeric rank for fourth place onwards', () => {
    const getMedalOrRankText = (rank: number) => {
      switch (rank) {
        case 1:
          return '🥇';
        case 2:
          return '🥈';
        case 3:
          return '🥉';
        default:
          return `#${rank}`;
      }
    };

    assert.equal(getMedalOrRankText(1), '🥇');
    assert.equal(getMedalOrRankText(2), '🥈');
    assert.equal(getMedalOrRankText(3), '🥉');
    assert.equal(getMedalOrRankText(4), '#4');
    assert.equal(getMedalOrRankText(10), '#10');
  });

  it('resolves metric label and unit strings', () => {
    const getMetricLabel = (m: LeaderboardMetric) => {
      switch (m) {
        case 'sightings':
          return 'Field Sightings';
        case 'species':
          return 'Species Cataloged';
        case 'verified':
          return 'Verified Records';
      }
    };

    const getMetricUnit = (m: LeaderboardMetric) => {
      switch (m) {
        case 'sightings':
          return 'Sightings';
        case 'species':
          return 'Species';
        case 'verified':
          return 'Verified';
      }
    };

    assert.equal(getMetricLabel('sightings'), 'Field Sightings');
    assert.equal(getMetricLabel('species'), 'Species Cataloged');
    assert.equal(getMetricLabel('verified'), 'Verified Records');

    assert.equal(getMetricUnit('sightings'), 'Sightings');
    assert.equal(getMetricUnit('species'), 'Species');
    assert.equal(getMetricUnit('verified'), 'Verified');
  });

  it('correctly extracts top 3 podium participants', () => {
    const top1 = sampleRankings[0];
    const top2 = sampleRankings[1];
    const top3 = sampleRankings[2];

    assert.equal(top1.rank, 1);
    assert.equal(top1.displayName, 'Dr. Evelyn Mantis');
    assert.equal(top1.role, 'EXPERT');

    assert.equal(top2.rank, 2);
    assert.equal(top2.displayName, 'Arun Field Naturalist');

    assert.equal(top3.rank, 3);
    assert.equal(top3.displayName, 'Maya Spider Scout');
  });

  it('computes initial letters for avatar fallback accurately', () => {
    const getInitial = (name: string) => (name ? name.charAt(0).toUpperCase() : 'N');

    assert.equal(getInitial(sampleRankings[0].displayName), 'D');
    assert.equal(getInitial(sampleRankings[1].displayName), 'A');
    assert.equal(getInitial(''), 'N');
  });
});
