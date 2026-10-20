import prisma from '../database/prisma';
import cacheService from './cacheService';
import { NotFoundError, ValidationError } from '../utils/errors';

export type LeaderboardMetric = 'sightings' | 'species' | 'verified';

export interface StreakResult {
  currentStreak: number;
  longestStreak: number;
  last7Days: {
    date: string;
    dayLabel: string;
    hasSighting: boolean;
  }[];
}

export interface UserStats {
  totalSightings: number;
  uniqueSpecies: number;
  verifiedCount: number;
  accuracyRate: number;
  currentStreak: number;
  longestStreak: number;
  last7Days: StreakResult['last7Days'];
}

export interface UserProfileResponse {
  user: {
    id: string;
    displayName: string;
    avatarUrl: string | null;
    role: string;
    createdAt: Date;
    email?: string;
  };
  stats: UserStats;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  displayName: string;
  avatarUrl: string | null;
  role?: string;
  score: number;
  metric: LeaderboardMetric;
}

/**
 * Calculates consecutive-day observation streaks and 7-day activity window.
 */
export function calculateObservationStreaks(
  observedDates: (Date | string)[],
  referenceDate: Date = new Date()
): StreakResult {
  const dateSet = new Set<string>();
  for (const d of observedDates) {
    const dateObj = typeof d === 'string' ? new Date(d) : d;
    if (!isNaN(dateObj.getTime())) {
      dateSet.add(dateObj.toISOString().split('T')[0]);
    }
  }

  const sortedDates = Array.from(dateSet).sort();
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const last7Days: StreakResult['last7Days'] = [];

  for (let i = 6; i >= 0; i--) {
    const d = new Date(
      Date.UTC(
        referenceDate.getUTCFullYear(),
        referenceDate.getUTCMonth(),
        referenceDate.getUTCDate() - i
      )
    );
    const dateStr = d.toISOString().split('T')[0];
    const dayLabel = dayNames[d.getUTCDay()];
    last7Days.push({
      date: dateStr,
      dayLabel,
      hasSighting: dateSet.has(dateStr),
    });
  }

  if (sortedDates.length === 0) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      last7Days,
    };
  }

  // Calculate longest streak across entire observation history
  let longestStreak = 0;
  let currentRun = 0;
  let previousDate: Date | null = null;

  for (const dateStr of sortedDates) {
    const currentDate = new Date(`${dateStr}T00:00:00.000Z`);
    if (!previousDate) {
      currentRun = 1;
    } else {
      const diffMs = currentDate.getTime() - previousDate.getTime();
      const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        currentRun++;
      } else if (diffDays > 1) {
        currentRun = 1;
      }
    }
    if (currentRun > longestStreak) {
      longestStreak = currentRun;
    }
    previousDate = currentDate;
  }

  // Calculate current active streak ending today or yesterday
  const todayStr = new Date(
    Date.UTC(
      referenceDate.getUTCFullYear(),
      referenceDate.getUTCMonth(),
      referenceDate.getUTCDate()
    )
  )
    .toISOString()
    .split('T')[0];

  const yesterdayStr = new Date(
    Date.UTC(
      referenceDate.getUTCFullYear(),
      referenceDate.getUTCMonth(),
      referenceDate.getUTCDate() - 1
    )
  )
    .toISOString()
    .split('T')[0];

  let currentStreak = 0;
  let startOffset = 0;

  if (dateSet.has(todayStr)) {
    startOffset = 0;
  } else if (dateSet.has(yesterdayStr)) {
    startOffset = 1;
  } else {
    return {
      currentStreak: 0,
      longestStreak: Math.max(longestStreak, 0),
      last7Days,
    };
  }

  while (true) {
    const checkDate = new Date(
      Date.UTC(
        referenceDate.getUTCFullYear(),
        referenceDate.getUTCMonth(),
        referenceDate.getUTCDate() - (startOffset + currentStreak)
      )
    );
    const checkStr = checkDate.toISOString().split('T')[0];
    if (dateSet.has(checkStr)) {
      currentStreak++;
    } else {
      break;
    }
  }

  return {
    currentStreak,
    longestStreak: Math.max(longestStreak, currentStreak),
    last7Days,
  };
}

export class UserService {
  /**
   * Retrieves profile details and aggregated performance stats for a user.
   */
  public async getUserProfile(
    userId: string,
    isOwnProfile = false
  ): Promise<UserProfileResponse> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        displayName: true,
        avatarUrl: true,
        role: true,
        email: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new NotFoundError(`User with ID '${userId}' was not found`);
    }

    // 1. Total Sightings Count
    const totalSightings = await prisma.sighting.count({
      where: { userId },
    });

    // 2. Unique Species Found Count
    const distinctSpecies = await prisma.sighting.findMany({
      where: { userId, speciesId: { not: null } },
      distinct: ['speciesId'],
      select: { speciesId: true },
    });
    const uniqueSpecies = distinctSpecies.length;

    // 3. Verified Sightings Count
    const verifiedCount = await prisma.sighting.count({
      where: { userId, status: 'VERIFIED' },
    });

    // 4. Accuracy Rate (% verified of total)
    const accuracyRate =
      totalSightings > 0 ? Math.round((verifiedCount / totalSightings) * 100) : 0;

    // 5. Streaks and Activity Window
    const sightingsDates = await prisma.sighting.findMany({
      where: { userId },
      select: { observedAt: true },
      orderBy: { observedAt: 'desc' },
    });

    const streakData = calculateObservationStreaks(
      sightingsDates.map((s) => s.observedAt)
    );

    return {
      user: {
        id: user.id,
        displayName: user.displayName,
        avatarUrl: user.avatarUrl,
        role: user.role,
        createdAt: user.createdAt,
        ...(isOwnProfile ? { email: user.email } : {}),
      },
      stats: {
        totalSightings,
        uniqueSpecies,
        verifiedCount,
        accuracyRate,
        currentStreak: streakData.currentStreak,
        longestStreak: streakData.longestStreak,
        last7Days: streakData.last7Days,
      },
    };
  }

  /**
   * Retrieves paginated sightings chronological field journal for a user.
   */
  public async getJournal(userId: string, page = 1, limit = 10) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, displayName: true, avatarUrl: true },
    });

    if (!user) {
      throw new NotFoundError(`User with ID '${userId}' was not found`);
    }

    const safePage = Math.max(1, page);
    const safeLimit = Math.min(50, Math.max(1, limit));
    const skip = (safePage - 1) * safeLimit;

    const [sightings, total] = await Promise.all([
      prisma.sighting.findMany({
        where: { userId },
        skip,
        take: safeLimit,
        orderBy: { observedAt: 'desc' },
        include: {
          species: {
            select: {
              id: true,
              commonName: true,
              scientificName: true,
              family: true,
              imageUrl: true,
              conservationStatus: true,
            },
          },
          identifications: {
            select: {
              id: true,
              source: true,
              confidence: true,
              isAccepted: true,
              species: {
                select: {
                  id: true,
                  commonName: true,
                  scientificName: true,
                },
              },
            },
            orderBy: { createdAt: 'desc' },
            take: 3,
          },
        },
      }),
      prisma.sighting.count({ where: { userId } }),
    ]);

    return {
      user,
      sightings,
      pagination: {
        page: safePage,
        limit: safeLimit,
        total,
        totalPages: Math.ceil(total / safeLimit),
        hasMore: safePage * safeLimit < total,
      },
    };
  }

  /**
   * Computes or fetches cached leaderboard rankings with 15-minute Redis TTL.
   */
  public async getLeaderboard(
    metric: LeaderboardMetric = 'sightings',
    limit = 10
  ): Promise<{ metric: LeaderboardMetric; rankings: LeaderboardEntry[]; cached: boolean }> {
    const validMetrics: LeaderboardMetric[] = ['sightings', 'species', 'verified'];
    if (!validMetrics.includes(metric)) {
      throw new ValidationError(
        `Invalid leaderboard metric '${metric}'. Must be one of: sightings, species, verified`
      );
    }

    const safeLimit = Math.min(50, Math.max(1, limit));
    const cacheKey = `wildbugs:leaderboard:${metric}:${safeLimit}`;

    // 1. Try reading from cache
    const cachedRankings = await cacheService.get<LeaderboardEntry[]>(cacheKey);
    if (cachedRankings) {
      return {
        metric,
        rankings: cachedRankings,
        cached: true,
      };
    }

    // 2. Aggregate rankings from database
    let userScores: { userId: string; score: number }[] = [];

    if (metric === 'sightings') {
      const counts = await prisma.sighting.groupBy({
        by: ['userId'],
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take: safeLimit,
      });
      userScores = counts.map((c) => ({
        userId: c.userId,
        score: c._count.id,
      }));
    } else if (metric === 'verified') {
      const counts = await prisma.sighting.groupBy({
        by: ['userId'],
        where: { status: 'VERIFIED' },
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take: safeLimit,
      });
      userScores = counts.map((c) => ({
        userId: c.userId,
        score: c._count.id,
      }));
    } else if (metric === 'species') {
      // Distinct species per user
      const distinctPerUser = await prisma.sighting.findMany({
        where: { speciesId: { not: null } },
        distinct: ['userId', 'speciesId'],
        select: { userId: true, speciesId: true },
      });

      const userMap = new Map<string, number>();
      for (const item of distinctPerUser) {
        userMap.set(item.userId, (userMap.get(item.userId) || 0) + 1);
      }

      userScores = Array.from(userMap.entries())
        .map(([userId, score]) => ({ userId, score }))
        .sort((a, b) => b.score - a.score)
        .slice(0, safeLimit);
    }

    // 3. Attach user profile information
    const userIds = userScores.map((u) => u.userId);
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: {
        id: true,
        displayName: true,
        avatarUrl: true,
        role: true,
      },
    });

    const userLookup = new Map(users.map((u) => [u.id, u]));

    const rankings: LeaderboardEntry[] = userScores.map((item, index) => {
      const u = userLookup.get(item.userId);
      return {
        rank: index + 1,
        userId: item.userId,
        displayName: u?.displayName || 'Naturalist Observer',
        avatarUrl: u?.avatarUrl || null,
        role: u?.role || 'USER',
        score: item.score,
        metric,
      };
    });

    // 4. Save to cache with 15-minute TTL (900 seconds)
    await cacheService.set(cacheKey, rankings, 900);

    return {
      metric,
      rankings,
      cached: false,
    };
  }
}

export const userService = new UserService();
export default userService;
