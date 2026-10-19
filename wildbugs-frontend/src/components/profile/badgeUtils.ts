import type { UserBadgeItem } from '../../types/user';

export type BadgeFilter = 'all' | 'unlocked' | 'locked';

export interface BadgeSummary {
  total: number;
  earned: number;
  locked: number;
  percentage: number;
}

/**
 * Pure calculation helper to derive achievement totals and completion rate.
 */
export function calculateBadgeSummary(badges: UserBadgeItem[] = []): BadgeSummary {
  const total = badges.length;
  const earned = badges.filter((b) => b.earned).length;
  const locked = total - earned;
  const percentage = total > 0 ? Math.round((earned / total) * 100) : 0;

  return { total, earned, locked, percentage };
}

/**
 * Pure filter helper for trophy tabs.
 */
export function filterBadges(
  badges: UserBadgeItem[] = [],
  filter: BadgeFilter
): UserBadgeItem[] {
  if (filter === 'unlocked') {
    return badges.filter((b) => b.earned);
  }
  if (filter === 'locked') {
    return badges.filter((b) => !b.earned);
  }
  return badges;
}

/**
 * Pure date formatter for badge unlocked timestamps.
 */
export function formatEarnedDate(isoString: string | null): string {
  if (!isoString) return 'Locked';
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return 'Recently Earned';
    return d.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return 'Earned';
  }
}

/**
 * Derives user-friendly progress explanation for locked badges.
 */
export function getBadgeProgressHint(badge: UserBadgeItem): string {
  if (badge.earned) {
    return 'Completed';
  }
  const { current, max } = badge.progress;
  if (!badge.criteria) {
    return `${current} / ${max}`;
  }

  switch (badge.criteria.type) {
    case 'sightings_count':
      return `${current} of ${max} observations`;
    case 'unique_species':
      return `${current} of ${max} species found`;
    case 'verified_count':
      return `${current} of ${max} verified`;
    case 'streak_days':
      return `${current} of ${max} days streak`;
    case 'time_window': {
      const s = badge.criteria.startHour ?? 0;
      const e = badge.criteria.endHour ?? 0;
      return `Observe between ${s}:00 and ${e}:00`;
    }
    default:
      return `${current} / ${max}`;
  }
}
