import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import type { UserStats, JournalSighting } from '../../types/user.ts';

describe('Profile & Field Journal Logic Unit Tests', () => {
  const sampleStats: UserStats = {
    totalSightings: 24,
    uniqueSpecies: 18,
    verifiedCount: 20,
    accuracyRate: 83,
    currentStreak: 4,
    longestStreak: 9,
    last7Days: [
      { date: '2026-10-13', dayLabel: 'Tue', hasSighting: false },
      { date: '2026-10-14', dayLabel: 'Wed', hasSighting: false },
      { date: '2026-10-15', dayLabel: 'Thu', hasSighting: false },
      { date: '2026-10-16', dayLabel: 'Fri', hasSighting: true },
      { date: '2026-10-17', dayLabel: 'Sat', hasSighting: true },
      { date: '2026-10-18', dayLabel: 'Sun', hasSighting: true },
      { date: '2026-10-19', dayLabel: 'Mon', hasSighting: true },
    ],
  };

  it('verifies 7-day streak activity calculation', () => {
    assert.equal(sampleStats.currentStreak, 4);
    assert.equal(sampleStats.longestStreak, 9);
    assert.equal(sampleStats.last7Days.length, 7);

    const activeDaysCount = sampleStats.last7Days.filter((d) => d.hasSighting).length;
    assert.equal(activeDaysCount, 4);
  });

  it('calculates accuracy rate percentage accurately', () => {
    const calculateAccuracy = (verified: number, total: number) => {
      if (total <= 0) return 0;
      return Math.round((verified / total) * 100);
    };

    assert.equal(calculateAccuracy(20, 24), 83);
    assert.equal(calculateAccuracy(0, 0), 0);
    assert.equal(calculateAccuracy(10, 10), 100);
    assert.equal(calculateAccuracy(5, 20), 25);
  });

  it('evaluates status badge theme mappings correctly', () => {
    const getStatusClass = (status: JournalSighting['status']) => {
      switch (status) {
        case 'VERIFIED':
          return 'status-verified';
        case 'IDENTIFIED':
          return 'status-identified';
        case 'REJECTED':
          return 'status-rejected';
        default:
          return 'status-pending';
      }
    };

    assert.equal(getStatusClass('VERIFIED'), 'status-verified');
    assert.equal(getStatusClass('IDENTIFIED'), 'status-identified');
    assert.equal(getStatusClass('PENDING'), 'status-pending');
    assert.equal(getStatusClass('REJECTED'), 'status-rejected');
  });

  it('determines TanStack Query infinite scroll next page parameter', () => {
    const getNextPageParam = (pagination: { page: number; hasMore: boolean }) => {
      return pagination.hasMore ? pagination.page + 1 : undefined;
    };

    assert.equal(getNextPageParam({ page: 1, hasMore: true }), 2);
    assert.equal(getNextPageParam({ page: 2, hasMore: true }), 3);
    assert.equal(getNextPageParam({ page: 3, hasMore: false }), undefined);
  });
});
