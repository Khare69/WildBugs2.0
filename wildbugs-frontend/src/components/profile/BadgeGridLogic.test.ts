import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateBadgeSummary,
  filterBadges,
  formatEarnedDate,
  getBadgeProgressHint,
} from './badgeUtils.ts';
import type { UserBadgeItem } from '../../types/user.ts';

describe('BadgeGrid Component Logic Unit Tests', () => {
  const sampleBadges: UserBadgeItem[] = [
    {
      id: 1,
      name: 'First Sighting',
      description: 'Record your first insect observation.',
      iconUrl: '🧭',
      criteria: { type: 'sightings_count', threshold: 1 },
      earned: true,
      earnedAt: '2026-10-15T12:00:00.000Z',
      progress: { current: 1, max: 1, percentage: 100 },
    },
    {
      id: 2,
      name: 'Biodiversity Explorer',
      description: 'Catalog 10 distinct species.',
      iconUrl: '🦋',
      criteria: { type: 'unique_species', threshold: 10 },
      earned: false,
      earnedAt: null,
      progress: { current: 4, max: 10, percentage: 40 },
    },
    {
      id: 3,
      name: 'Master Verifier',
      description: '5 verified records.',
      iconUrl: '🛡️',
      criteria: { type: 'verified_count', threshold: 5 },
      earned: false,
      earnedAt: null,
      progress: { current: 2, max: 5, percentage: 40 },
    },
    {
      id: 4,
      name: 'Night Owl',
      description: 'Observe at night.',
      iconUrl: '🦉',
      criteria: { type: 'time_window', startHour: 22, endHour: 5 },
      earned: true,
      earnedAt: '2026-10-18T23:30:00.000Z',
      progress: { current: 1, max: 1, percentage: 100 },
    },
  ];

  it('calculates badge summary metrics and percentage accurately', () => {
    const emptySummary = calculateBadgeSummary([]);
    assert.equal(emptySummary.total, 0);
    assert.equal(emptySummary.earned, 0);
    assert.equal(emptySummary.locked, 0);
    assert.equal(emptySummary.percentage, 0);

    const summary = calculateBadgeSummary(sampleBadges);
    assert.equal(summary.total, 4);
    assert.equal(summary.earned, 2);
    assert.equal(summary.locked, 2);
    assert.equal(summary.percentage, 50);
  });

  it('filters badges by all, unlocked, and locked criteria', () => {
    const all = filterBadges(sampleBadges, 'all');
    assert.equal(all.length, 4);

    const unlocked = filterBadges(sampleBadges, 'unlocked');
    assert.equal(unlocked.length, 2);
    assert.equal(unlocked.every((b) => b.earned), true);

    const locked = filterBadges(sampleBadges, 'locked');
    assert.equal(locked.length, 2);
    assert.equal(locked.every((b) => !b.earned), true);
  });

  it('formats earned dates safely and handles null/invalid strings', () => {
    assert.equal(formatEarnedDate(null), 'Locked');

    const formatted = formatEarnedDate('2026-10-15T12:00:00.000Z');
    assert.match(formatted, /2026/);

    assert.equal(formatEarnedDate('invalid-date-string'), 'Recently Earned');
  });

  it('generates readable progress hints across different criteria types', () => {
    // Completed badge
    assert.equal(getBadgeProgressHint(sampleBadges[0]), 'Completed');

    // Species count
    assert.equal(getBadgeProgressHint(sampleBadges[1]), '4 of 10 species found');

    // Verified count
    assert.equal(getBadgeProgressHint(sampleBadges[2]), '2 of 5 verified');

    // Streak criteria
    const streakBadge: UserBadgeItem = {
      id: 5,
      name: 'Week Warrior',
      description: '7-day streak',
      iconUrl: '🔥',
      criteria: { type: 'streak_days', threshold: 7 },
      earned: false,
      earnedAt: null,
      progress: { current: 3, max: 7, percentage: 43 },
    };
    assert.equal(getBadgeProgressHint(streakBadge), '3 of 7 days streak');

    // Time window
    const timeBadge: UserBadgeItem = {
      id: 6,
      name: 'Dawn Patrol',
      description: 'Morning',
      iconUrl: '🌅',
      criteria: { type: 'time_window', startHour: 5, endHour: 7 },
      earned: false,
      earnedAt: null,
      progress: { current: 0, max: 1, percentage: 0 },
    };
    assert.equal(getBadgeProgressHint(timeBadge), 'Observe between 5:00 and 7:00');
  });
});
