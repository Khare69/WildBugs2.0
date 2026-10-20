import prisma from '../database/prisma';
import { calculateObservationStreaks } from './userService';

export interface BadgeCriterion {
  type: 'sightings_count' | 'unique_species' | 'verified_count' | 'streak_days' | 'time_window';
  threshold?: number;
  startHour?: number; // 0 - 23
  endHour?: number;   // 0 - 23
}

export interface UserEvaluationContext {
  totalSightings: number;
  uniqueSpecies: number;
  verifiedCount: number;
  currentStreak: number;
  longestStreak: number;
  observedHours: number[]; // Hours of day (0-23) when user recorded sightings
}

export interface DefaultBadgeDefinition {
  name: string;
  description: string;
  iconUrl: string;
  criteria: BadgeCriterion;
}

export const DEFAULT_BADGES: DefaultBadgeDefinition[] = [
  {
    name: 'First Sighting',
    description: 'Recorded your first insect observation in the wild.',
    iconUrl: '🧭',
    criteria: { type: 'sightings_count', threshold: 1 },
  },
  {
    name: 'Biodiversity Explorer',
    description: 'Cataloged 10 distinct species in your field journal.',
    iconUrl: '🦋',
    criteria: { type: 'unique_species', threshold: 10 },
  },
  {
    name: 'Century Club',
    description: 'Logged 100 observations contributing to citizen science.',
    iconUrl: '💯',
    criteria: { type: 'sightings_count', threshold: 100 },
  },
  {
    name: 'Night Owl',
    description: 'Spotted nocturnal arthropods active after dark (10 PM – 5 AM).',
    iconUrl: '🦉',
    criteria: { type: 'time_window', startHour: 22, endHour: 5 },
  },
  {
    name: 'Early Bird',
    description: 'Observed morning insects during dawn patrol (5 AM – 7 AM).',
    iconUrl: '🌅',
    criteria: { type: 'time_window', startHour: 5, endHour: 7 },
  },
  {
    name: 'Week Warrior',
    description: 'Maintained a consecutive 7-day observation habit streak.',
    iconUrl: '🔥',
    criteria: { type: 'streak_days', threshold: 7 },
  },
  {
    name: 'Master Verifier',
    description: 'Achieved 5 or more community or expert-verified observations.',
    iconUrl: '🛡️',
    criteria: { type: 'verified_count', threshold: 5 },
  },
];

/**
 * Pure evaluation function that assesses whether a user satisfies a badge criterion.
 */
export function evaluateBadgeCriterion(
  criteria: BadgeCriterion,
  context: UserEvaluationContext
): { satisfied: boolean; current: number; max: number } {
  switch (criteria.type) {
    case 'sightings_count': {
      const target = criteria.threshold || 1;
      return {
        satisfied: context.totalSightings >= target,
        current: Math.min(context.totalSightings, target),
        max: target,
      };
    }
    case 'unique_species': {
      const target = criteria.threshold || 10;
      return {
        satisfied: context.uniqueSpecies >= target,
        current: Math.min(context.uniqueSpecies, target),
        max: target,
      };
    }
    case 'verified_count': {
      const target = criteria.threshold || 5;
      return {
        satisfied: context.verifiedCount >= target,
        current: Math.min(context.verifiedCount, target),
        max: target,
      };
    }
    case 'streak_days': {
      const target = criteria.threshold || 7;
      const maxStreak = Math.max(context.currentStreak, context.longestStreak);
      return {
        satisfied: maxStreak >= target,
        current: Math.min(maxStreak, target),
        max: target,
      };
    }
    case 'time_window': {
      const start = criteria.startHour ?? 22;
      const end = criteria.endHour ?? 5;

      const hasMatchingHour = context.observedHours.some((hour) => {
        if (start > end) {
          // Crosses midnight, e.g. 22:00 -> 05:00
          return hour >= start || hour < end;
        }
        // Within same day, e.g. 05:00 -> 07:00
        return hour >= start && hour < end;
      });

      return {
        satisfied: hasMatchingHour,
        current: hasMatchingHour ? 1 : 0,
        max: 1,
      };
    }
    default:
      return { satisfied: false, current: 0, max: 1 };
  }
}

export class BadgeService {
  /**
   * Seeds default platform achievement badges if they do not yet exist.
   */
  public async seedDefaultBadges(): Promise<void> {
    try {
      for (const badge of DEFAULT_BADGES) {
        await prisma.badge.upsert({
          where: { name: badge.name },
          update: {
            description: badge.description,
            iconUrl: badge.iconUrl,
            criteria: badge.criteria as any,
          },
          create: {
            name: badge.name,
            description: badge.description,
            iconUrl: badge.iconUrl,
            criteria: badge.criteria as any,
          },
        });
      }
    } catch (err) {
      console.warn('⚠️ [BadgeService] Failed to seed default badges:', err);
    }
  }

  /**
   * Evaluates all badge criteria for a given user and awards newly earned badges.
   */
  public async evaluateBadges(userId: string) {
    // 1. Gather User's Activity Metrics
    const [totalSightings, verifiedCount, distinctSpecies, userSightings] = await Promise.all([
      prisma.sighting.count({ where: { userId } }),
      prisma.sighting.count({ where: { userId, status: 'VERIFIED' } }),
      prisma.sighting.findMany({
        where: { userId, speciesId: { not: null } },
        distinct: ['speciesId'],
        select: { speciesId: true },
      }),
      prisma.sighting.findMany({
        where: { userId },
        select: { observedAt: true },
        orderBy: { observedAt: 'desc' },
      }),
    ]);

    const streakData = calculateObservationStreaks(userSightings.map((s) => s.observedAt));

    // Extract both UTC and local observation hours
    const observedHours = userSightings.map((s) => new Date(s.observedAt).getUTCHours());

    const context: UserEvaluationContext = {
      totalSightings,
      uniqueSpecies: distinctSpecies.length,
      verifiedCount,
      currentStreak: streakData.currentStreak,
      longestStreak: streakData.longestStreak,
      observedHours,
    };

    // 2. Fetch all platform badges
    let allBadges = await prisma.badge.findMany();
    if (allBadges.length === 0) {
      await this.seedDefaultBadges();
      allBadges = await prisma.badge.findMany();
    }

    // 3. Fetch already earned badge IDs for this user
    const existingEarned = await prisma.userBadge.findMany({
      where: { userId },
      select: { badgeId: true },
    });
    const earnedBadgeIds = new Set(existingEarned.map((eb) => eb.badgeId));

    // 4. Check unearned badges against criteria
    const newlyEarnedBadges = [];

    for (const badge of allBadges) {
      if (earnedBadgeIds.has(badge.id)) {
        continue;
      }

      const criteria = badge.criteria as unknown as BadgeCriterion;
      if (!criteria) continue;

      const evalResult = evaluateBadgeCriterion(criteria, context);
      if (evalResult.satisfied) {
          try {
            const awarded = await prisma.userBadge.create({
              data: {
                userId,
                badgeId: badge.id,
              },
              include: { badge: true },
            });
            newlyEarnedBadges.push(awarded.badge);

            // Dispatch notification for earned badge
            try {
              await prisma.notification.create({
                data: {
                  userId,
                  type: 'BADGE_EARNED',
                  message: `🏆 Achievement Unlocked: You earned the "${badge.name}" badge!`,
                  data: {
                    badgeId: badge.id,
                    badgeName: badge.name,
                    iconUrl: badge.iconUrl,
                  },
                },
              });
            } catch {
              // Non-blocking notification error
            }
          } catch {
            // Ignore unique constraint race condition
          }
      }
    }

    return newlyEarnedBadges;
  }

  /**
   * Retrieves all badges annotated with user's earned status and criteria progress.
   */
  public async getUserBadges(userId: string) {
    let allBadges = await prisma.badge.findMany({
      orderBy: { id: 'asc' },
    });

    if (allBadges.length === 0) {
      await this.seedDefaultBadges();
      allBadges = await prisma.badge.findMany({
        orderBy: { id: 'asc' },
      });
    }

    const [earnedBadges, totalSightings, verifiedCount, distinctSpecies, userSightings] =
      await Promise.all([
        prisma.userBadge.findMany({
          where: { userId },
          include: { badge: true },
        }),
        prisma.sighting.count({ where: { userId } }),
        prisma.sighting.count({ where: { userId, status: 'VERIFIED' } }),
        prisma.sighting.findMany({
          where: { userId, speciesId: { not: null } },
          distinct: ['speciesId'],
          select: { speciesId: true },
        }),
        prisma.sighting.findMany({
          where: { userId },
          select: { observedAt: true },
        }),
      ]);

    const streakData = calculateObservationStreaks(userSightings.map((s) => s.observedAt));
    const observedHours = userSightings.map((s) => new Date(s.observedAt).getUTCHours());

    const context: UserEvaluationContext = {
      totalSightings,
      uniqueSpecies: distinctSpecies.length,
      verifiedCount,
      currentStreak: streakData.currentStreak,
      longestStreak: streakData.longestStreak,
      observedHours,
    };

    const earnedLookup = new Map(earnedBadges.map((eb) => [eb.badgeId, eb.earnedAt]));

    return allBadges.map((badge) => {
      const earnedAt = earnedLookup.get(badge.id);
      const isEarned = Boolean(earnedAt);
      const criteria = badge.criteria as unknown as BadgeCriterion;
      const progress = evaluateBadgeCriterion(criteria || { type: 'sightings_count', threshold: 1 }, context);

      return {
        id: badge.id,
        name: badge.name,
        description: badge.description,
        iconUrl: badge.iconUrl,
        criteria,
        earned: isEarned,
        earnedAt: earnedAt ? earnedAt.toISOString() : null,
        progress: {
          current: progress.current,
          max: progress.max,
          percentage: progress.max > 0 ? Math.min(100, Math.round((progress.current / progress.max) * 100)) : 0,
        },
      };
    });
  }
}

export const badgeService = new BadgeService();
export default badgeService;
