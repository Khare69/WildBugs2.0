import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  getChallengeStatus,
  calculateDaysRemaining,
  evaluateChallengeCriteria,
  getDefaultChallenges,
  ChallengeCriteria,
} from '../../../src/services/challengeService';

describe('ChallengeService Unit Tests', () => {
  it('determines challenge lifecycle status correctly (UPCOMING, ACTIVE, ENDED)', () => {
    const now = new Date('2026-10-20T10:00:00.000Z');

    const upcoming = getChallengeStatus(
      new Date('2026-10-22T00:00:00.000Z'),
      new Date('2026-10-30T00:00:00.000Z'),
      now
    );
    assert.equal(upcoming, 'UPCOMING');

    const active = getChallengeStatus(
      new Date('2026-10-18T00:00:00.000Z'),
      new Date('2026-10-25T00:00:00.000Z'),
      now
    );
    assert.equal(active, 'ACTIVE');

    const ended = getChallengeStatus(
      new Date('2026-10-01T00:00:00.000Z'),
      new Date('2026-10-15T00:00:00.000Z'),
      now
    );
    assert.equal(ended, 'ENDED');
  });

  it('calculates days remaining until deadline accurately', () => {
    const now = new Date('2026-10-20T10:00:00.000Z');

    const threeDays = calculateDaysRemaining(new Date('2026-10-23T10:00:00.000Z'), now);
    assert.equal(threeDays, 3);

    const expired = calculateDaysRemaining(new Date('2026-10-19T10:00:00.000Z'), now);
    assert.equal(expired, 0);
  });

  it('evaluates sightings_count challenge criteria correctly', () => {
    const criteria: ChallengeCriteria = {
      type: 'sightings_count',
      target: 5,
    };

    const incomplete = evaluateChallengeCriteria(criteria, [
      { id: '1' },
      { id: '2' },
    ]);
    assert.equal(incomplete.current, 2);
    assert.equal(incomplete.target, 5);
    assert.equal(incomplete.percentage, 40);
    assert.equal(incomplete.completed, false);

    const completed = evaluateChallengeCriteria(criteria, [
      { id: '1' },
      { id: '2' },
      { id: '3' },
      { id: '4' },
      { id: '5' },
      { id: '6' },
    ]);
    assert.equal(completed.current, 5); // Capped at target
    assert.equal(completed.percentage, 100);
    assert.equal(completed.completed, true);
  });

  it('evaluates unique_species challenge criteria deduplicating species IDs', () => {
    const criteria: ChallengeCriteria = {
      type: 'unique_species',
      target: 3,
    };

    const duplicateSpeciesSightings = [
      { id: '1', speciesId: 101 },
      { id: '2', speciesId: 101 },
      { id: '3', speciesId: 102 },
      { id: '4', speciesId: null },
    ];

    const result = evaluateChallengeCriteria(criteria, duplicateSpeciesSightings);
    assert.equal(result.current, 2); // 101 and 102
    assert.equal(result.target, 3);
    assert.equal(result.percentage, 67);
    assert.equal(result.completed, false);
  });

  it('evaluates family-specific challenge criteria matching taxonomy', () => {
    const criteria: ChallengeCriteria = {
      type: 'family',
      family: 'Nymphalidae',
      target: 2,
    };

    const sightings = [
      { id: '1', species: { family: 'Nymphalidae' } },
      { id: '2', species: { family: 'nymphalidae' } }, // Case-insensitive
      { id: '3', species: { family: 'Apidae' } },
    ];

    const result = evaluateChallengeCriteria(criteria, sightings);
    assert.equal(result.current, 2);
    assert.equal(result.target, 2);
    assert.equal(result.percentage, 100);
    assert.equal(result.completed, true);
  });

  it('evaluates verified_count challenge criteria checking VERIFIED status', () => {
    const criteria: ChallengeCriteria = {
      type: 'verified_count',
      target: 2,
    };

    const sightings = [
      { id: '1', status: 'VERIFIED' },
      { id: '2', status: 'PENDING' },
      { id: '3', status: 'IDENTIFIED' },
    ];

    const result = evaluateChallengeCriteria(criteria, sightings);
    assert.equal(result.current, 1);
    assert.equal(result.target, 2);
    assert.equal(result.percentage, 50);
    assert.equal(result.completed, false);
  });

  it('provides sensible default challenges', () => {
    const defaults = getDefaultChallenges();
    assert.ok(defaults.length >= 4);
    assert.ok(defaults.every((d) => d.title && d.criteria.target > 0));
    assert.ok(defaults.every((d) => d.startsAt < d.endsAt));
  });
});
