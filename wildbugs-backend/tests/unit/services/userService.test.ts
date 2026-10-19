import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { calculateObservationStreaks } from '../../../src/services/userService';

describe('UserService Streak Calculation Unit Tests', () => {
  it('returns 0 streaks and 7 empty days when user has no sightings', () => {
    const refDate = new Date('2026-10-19T10:00:00.000Z');
    const result = calculateObservationStreaks([], refDate);

    assert.equal(result.currentStreak, 0);
    assert.equal(result.longestStreak, 0);
    assert.equal(result.last7Days.length, 7);
    assert.equal(result.last7Days.every((d) => !d.hasSighting), true);
    assert.equal(result.last7Days[6].date, '2026-10-19');
    assert.equal(result.last7Days[0].date, '2026-10-13');
  });

  it('calculates current streak of 1 when user observed today', () => {
    const refDate = new Date('2026-10-19T10:00:00.000Z');
    const sightings = ['2026-10-19T05:30:00.000Z'];
    const result = calculateObservationStreaks(sightings, refDate);

    assert.equal(result.currentStreak, 1);
    assert.equal(result.longestStreak, 1);
    assert.equal(result.last7Days[6].hasSighting, true);
    assert.equal(result.last7Days[5].hasSighting, false);
  });

  it('maintains active streak when user observed yesterday but not yet today', () => {
    const refDate = new Date('2026-10-19T10:00:00.000Z');
    const sightings = ['2026-10-18T14:20:00.000Z', '2026-10-17T09:15:00.000Z'];
    const result = calculateObservationStreaks(sightings, refDate);

    assert.equal(result.currentStreak, 2);
    assert.equal(result.longestStreak, 2);
    assert.equal(result.last7Days[6].hasSighting, false); // Today
    assert.equal(result.last7Days[5].hasSighting, true);  // Yesterday
    assert.equal(result.last7Days[4].hasSighting, true);  // 2 days ago
  });

  it('calculates continuous 5-day streak including today', () => {
    const refDate = new Date('2026-10-19T10:00:00.000Z');
    const sightings = [
      '2026-10-19T08:00:00.000Z',
      '2026-10-18T10:00:00.000Z',
      '2026-10-17T11:00:00.000Z',
      '2026-10-16T12:00:00.000Z',
      '2026-10-15T13:00:00.000Z',
    ];
    const result = calculateObservationStreaks(sightings, refDate);

    assert.equal(result.currentStreak, 5);
    assert.equal(result.longestStreak, 5);
  });

  it('correctly reports broken streak when last sighting was 2 or more days ago', () => {
    const refDate = new Date('2026-10-19T10:00:00.000Z');
    const sightings = [
      '2026-10-17T10:00:00.000Z',
      '2026-10-16T10:00:00.000Z',
      '2026-10-15T10:00:00.000Z',
    ];
    const result = calculateObservationStreaks(sightings, refDate);

    assert.equal(result.currentStreak, 0); // Broken streak
    assert.equal(result.longestStreak, 3); // Historical longest maintained
  });

  it('deduplicates multiple sightings recorded on the same date', () => {
    const refDate = new Date('2026-10-19T10:00:00.000Z');
    const sightings = [
      '2026-10-19T06:00:00.000Z',
      '2026-10-19T08:30:00.000Z',
      '2026-10-19T12:45:00.000Z',
      '2026-10-18T09:00:00.000Z',
    ];
    const result = calculateObservationStreaks(sightings, refDate);

    assert.equal(result.currentStreak, 2);
    assert.equal(result.longestStreak, 2);
  });
});
