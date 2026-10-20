import type { ChallengeCriteria, ChallengeItem } from '../../types/challenge';

export type ChallengeFilter = 'all' | 'active' | 'joined' | 'completed';

export interface ChallengeMetrics {
  total: number;
  activeCount: number;
  joinedCount: number;
  completedCount: number;
}

/**
 * Returns a human-friendly countdown or status badge string.
 */
export function formatDaysLeft(daysLeft: number, status: string): string {
  if (status === 'ENDED' || daysLeft <= 0) {
    return 'Challenge Concluded';
  }
  if (status === 'UPCOMING') {
    return 'Starts Soon';
  }
  if (daysLeft === 1) {
    return 'Ends Tomorrow 🔥';
  }
  return `${daysLeft} days remaining`;
}

/**
 * Returns a user-friendly instruction for the challenge requirement.
 */
export function getCriteriaLabel(criteria: ChallengeCriteria): string {
  const target = criteria.target || 1;
  switch (criteria.type) {
    case 'sightings_count':
      return `Record ${target} field insect ${target === 1 ? 'observation' : 'observations'}`;
    case 'unique_species':
      return `Catalog ${target} distinct insect ${target === 1 ? 'species' : 'species'}`;
    case 'family':
      return `Spotted ${target} ${criteria.family || 'taxa'} specimens`;
    case 'verified_count':
      return `Earn ${target} verified ${target === 1 ? 'observation' : 'observations'}`;
    default:
      return `Achieve milestone target of ${target}`;
  }
}

/**
 * Filters challenge list according to selected navigation tab.
 */
export function filterChallenges(
  challenges: ChallengeItem[] = [],
  filter: ChallengeFilter
): ChallengeItem[] {
  switch (filter) {
    case 'active':
      return challenges.filter((c) => c.status === 'ACTIVE');
    case 'joined':
      return challenges.filter((c) => Boolean(c.userProgress?.joined));
    case 'completed':
      return challenges.filter((c) => Boolean(c.userProgress?.completed));
    case 'all':
    default:
      return challenges;
  }
}

/**
 * Derives statistical aggregation counts for challenge headers.
 */
export function calculateChallengeMetrics(challenges: ChallengeItem[] = []): ChallengeMetrics {
  const total = challenges.length;
  const activeCount = challenges.filter((c) => c.status === 'ACTIVE').length;
  const joinedCount = challenges.filter((c) => Boolean(c.userProgress?.joined)).length;
  const completedCount = challenges.filter((c) => Boolean(c.userProgress?.completed)).length;

  return {
    total,
    activeCount,
    joinedCount,
    completedCount,
  };
}
