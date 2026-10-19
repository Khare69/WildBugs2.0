import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  evaluateBadgeCriterion,
  UserEvaluationContext,
} from '../../../src/services/badgeService';

describe('BadgeService Criterion Evaluation Unit Tests', () => {
  const baseContext: UserEvaluationContext = {
    totalSightings: 0,
    uniqueSpecies: 0,
    verifiedCount: 0,
    currentStreak: 0,
    longestStreak: 0,
    observedHours: [],
  };

  it('evaluates sightings_count criteria correctly', () => {
    const criterion = { type: 'sightings_count' as const, threshold: 10 };

    const unsatisfied = evaluateBadgeCriterion(criterion, {
      ...baseContext,
      totalSightings: 5,
    });
    assert.equal(unsatisfied.satisfied, false);
    assert.equal(unsatisfied.current, 5);
    assert.equal(unsatisfied.max, 10);

    const satisfied = evaluateBadgeCriterion(criterion, {
      ...baseContext,
      totalSightings: 15,
    });
    assert.equal(satisfied.satisfied, true);
    assert.equal(satisfied.current, 10);
    assert.equal(satisfied.max, 10);
  });

  it('evaluates unique_species criteria correctly', () => {
    const criterion = { type: 'unique_species' as const, threshold: 5 };

    const unsatisfied = evaluateBadgeCriterion(criterion, {
      ...baseContext,
      uniqueSpecies: 2,
    });
    assert.equal(unsatisfied.satisfied, false);
    assert.equal(unsatisfied.current, 2);
    assert.equal(unsatisfied.max, 5);

    const satisfied = evaluateBadgeCriterion(criterion, {
      ...baseContext,
      uniqueSpecies: 5,
    });
    assert.equal(satisfied.satisfied, true);
    assert.equal(satisfied.current, 5);
    assert.equal(satisfied.max, 5);
  });

  it('evaluates verified_count criteria correctly', () => {
    const criterion = { type: 'verified_count' as const, threshold: 3 };

    const unsatisfied = evaluateBadgeCriterion(criterion, {
      ...baseContext,
      verifiedCount: 1,
    });
    assert.equal(unsatisfied.satisfied, false);
    assert.equal(unsatisfied.current, 1);
    assert.equal(unsatisfied.max, 3);

    const satisfied = evaluateBadgeCriterion(criterion, {
      ...baseContext,
      verifiedCount: 7,
    });
    assert.equal(satisfied.satisfied, true);
    assert.equal(satisfied.current, 3);
    assert.equal(satisfied.max, 3);
  });

  it('evaluates streak_days criteria considering current and historical longest streak', () => {
    const criterion = { type: 'streak_days' as const, threshold: 7 };

    // Current streak qualifies
    const currentPasses = evaluateBadgeCriterion(criterion, {
      ...baseContext,
      currentStreak: 7,
      longestStreak: 5,
    });
    assert.equal(currentPasses.satisfied, true);
    assert.equal(currentPasses.current, 7);

    // Broken current streak but historical longest qualifies
    const historicalPasses = evaluateBadgeCriterion(criterion, {
      ...baseContext,
      currentStreak: 1,
      longestStreak: 14,
    });
    assert.equal(historicalPasses.satisfied, true);
    assert.equal(historicalPasses.current, 7);

    // Neither qualifies
    const neither = evaluateBadgeCriterion(criterion, {
      ...baseContext,
      currentStreak: 4,
      longestStreak: 5,
    });
    assert.equal(neither.satisfied, false);
    assert.equal(neither.current, 5);
  });

  it('evaluates midnight-crossing time_window criteria (e.g. Night Owl: 22h - 5h)', () => {
    const criterion = {
      type: 'time_window' as const,
      startHour: 22,
      endHour: 5,
    };

    // Sightings during late night (23:00)
    const lateNight = evaluateBadgeCriterion(criterion, {
      ...baseContext,
      observedHours: [14, 18, 23],
    });
    assert.equal(lateNight.satisfied, true);
    assert.equal(lateNight.current, 1);
    assert.equal(lateNight.max, 1);

    // Sightings during wee hours before dawn (02:00)
    const weeHours = evaluateBadgeCriterion(criterion, {
      ...baseContext,
      observedHours: [2],
    });
    assert.equal(weeHours.satisfied, true);

    // Daytime only sightings (12:00, 16:00)
    const daytime = evaluateBadgeCriterion(criterion, {
      ...baseContext,
      observedHours: [12, 16],
    });
    assert.equal(daytime.satisfied, false);
    assert.equal(daytime.current, 0);
  });

  it('evaluates daytime time_window criteria (e.g. Early Bird: 5h - 7h)', () => {
    const criterion = {
      type: 'time_window' as const,
      startHour: 5,
      endHour: 7,
    };

    const earlyMorning = evaluateBadgeCriterion(criterion, {
      ...baseContext,
      observedHours: [6],
    });
    assert.equal(earlyMorning.satisfied, true);

    const outsideWindow = evaluateBadgeCriterion(criterion, {
      ...baseContext,
      observedHours: [4, 7, 10], // 7 is upper exclusive bound
    });
    assert.equal(outsideWindow.satisfied, false);
  });

  it('returns fallback for unknown criterion types', () => {
    const unknownCriterion = { type: 'non_existent_type' as any };
    const res = evaluateBadgeCriterion(unknownCriterion, baseContext);
    assert.equal(res.satisfied, false);
    assert.equal(res.current, 0);
    assert.equal(res.max, 1);
  });
});
