import { Challenge, ChallengeScope } from '@prisma/client';
import prisma from '../database/prisma';
import { NotFoundError, ValidationError } from '../utils/errors';

export interface ChallengeCriteria {
  type: 'sightings_count' | 'unique_species' | 'family' | 'verified_count';
  target: number;
  family?: string;
  icon?: string;
}

export interface DefaultChallengeDefinition {
  title: string;
  description: string;
  criteria: ChallengeCriteria;
  scope: ChallengeScope;
  startsAt: Date;
  endsAt: Date;
}

export interface ChallengeUserProgress {
  joined: boolean;
  progress: number;
  target: number;
  percentage: number;
  completed: boolean;
  completedAt: string | null;
  joinedAt?: string | null;
}

export interface ChallengeResponseItem {
  id: number;
  title: string;
  description: string;
  criteria: ChallengeCriteria;
  scope: ChallengeScope;
  startsAt: string;
  endsAt: string;
  createdAt: string;
  status: 'UPCOMING' | 'ACTIVE' | 'ENDED';
  daysLeft: number;
  participantCount: number;
  userProgress?: ChallengeUserProgress;
}

/**
 * Pure helper to calculate challenge status given window and current time.
 */
export function getChallengeStatus(
  startsAt: Date,
  endsAt: Date,
  now: Date = new Date()
): 'UPCOMING' | 'ACTIVE' | 'ENDED' {
  if (now < startsAt) return 'UPCOMING';
  if (now > endsAt) return 'ENDED';
  return 'ACTIVE';
}

/**
 * Pure helper to calculate days remaining until deadline.
 */
export function calculateDaysRemaining(endsAt: Date, now: Date = new Date()): number {
  const diffMs = endsAt.getTime() - now.getTime();
  if (diffMs <= 0) return 0;
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Pure evaluator for challenge criteria against a collection of sightings.
 */
export function evaluateChallengeCriteria(
  criteria: ChallengeCriteria,
  sightings: Array<{
    id?: string;
    speciesId?: number | null;
    status?: string;
    species?: { family?: string } | null;
  }>
): { current: number; target: number; percentage: number; completed: boolean } {
  const target = Math.max(1, criteria.target || 1);
  let current = 0;

  switch (criteria.type) {
    case 'sightings_count': {
      current = sightings.length;
      break;
    }
    case 'unique_species': {
      const distinct = new Set(
        sightings.filter((s) => s.speciesId !== null && s.speciesId !== undefined).map((s) => s.speciesId)
      );
      current = distinct.size;
      break;
    }
    case 'family': {
      const targetFamily = criteria.family?.toLowerCase();
      current = sightings.filter(
        (s) => s.species?.family && s.species.family.toLowerCase() === targetFamily
      ).length;
      break;
    }
    case 'verified_count': {
      current = sightings.filter((s) => s.status === 'VERIFIED').length;
      break;
    }
    default:
      current = 0;
  }

  const cappedCurrent = Math.min(current, target);
  const percentage = Math.min(100, Math.round((current / target) * 100));
  const completed = current >= target;

  return {
    current: cappedCurrent,
    target,
    percentage,
    completed,
  };
}

/**
 * Returns dynamic default challenge definitions anchored relative to current date.
 */
export function getDefaultChallenges(): DefaultChallengeDefinition[] {
  const now = new Date();
  const dayMs = 24 * 60 * 60 * 1000;

  return [
    {
      title: 'Spring Pollinator BioBlitz',
      description: 'Document 5 insect sightings to map early season floral visitors across urban and rural zones.',
      criteria: {
        type: 'sightings_count',
        target: 5,
        icon: '🐝',
      },
      scope: ChallengeScope.INDIVIDUAL,
      startsAt: new Date(now.getTime() - 2 * dayMs),
      endsAt: new Date(now.getTime() + 28 * dayMs),
    },
    {
      title: 'Biodiversity Cataloger Quest',
      description: 'Discover and log 3 unique insect species in your local ecosystem.',
      criteria: {
        type: 'unique_species',
        target: 3,
        icon: '🦋',
      },
      scope: ChallengeScope.INDIVIDUAL,
      startsAt: new Date(now.getTime() - 5 * dayMs),
      endsAt: new Date(now.getTime() + 25 * dayMs),
    },
    {
      title: 'Lepidoptera Wingspan Search',
      description: 'Find 2 distinct butterflies or moths belonging to the Lepidoptera family.',
      criteria: {
        type: 'family',
        family: 'Nymphalidae',
        target: 2,
        icon: '🌺',
      },
      scope: ChallengeScope.INDIVIDUAL,
      startsAt: new Date(now.getTime() - 1 * dayMs),
      endsAt: new Date(now.getTime() + 14 * dayMs),
    },
    {
      title: 'Community Verifier Sprint',
      description: 'Accumulate 2 community or expert-verified observations during this field cycle.',
      criteria: {
        type: 'verified_count',
        target: 2,
        icon: '🛡️',
      },
      scope: ChallengeScope.INDIVIDUAL,
      startsAt: new Date(now.getTime() - 3 * dayMs),
      endsAt: new Date(now.getTime() + 20 * dayMs),
    },
  ];
}

export class ChallengeService {
  /**
   * Seeds default seasonal bioblitz challenges if the database has none.
   */
  public async seedDefaultChallenges(): Promise<void> {
    try {
      const defaults = getDefaultChallenges();
      for (const def of defaults) {
        const existing = await prisma.challenge.findFirst({
          where: { title: def.title },
        });

        if (!existing) {
          await prisma.challenge.create({
            data: {
              title: def.title,
              description: def.description,
              criteria: def.criteria as any,
              scope: def.scope,
              startsAt: def.startsAt,
              endsAt: def.endsAt,
            },
          });
        }
      }
    } catch (err) {
      console.warn('⚠️ [ChallengeService] Failed to seed default challenges:', err);
    }
  }

  /**
   * Retrieves active and upcoming challenges annotated with participant counts and user progress.
   */
  public async getActiveChallenges(userId?: string): Promise<ChallengeResponseItem[]> {
    let challenges = await prisma.challenge.findMany({
      orderBy: { endsAt: 'asc' },
      include: {
        _count: {
          select: { progress: true },
        },
      },
    });

    if (challenges.length === 0) {
      await this.seedDefaultChallenges();
      challenges = await prisma.challenge.findMany({
        orderBy: { endsAt: 'asc' },
        include: {
          _count: {
            select: { progress: true },
          },
        },
      });
    }

    // If userId provided, fetch user's joined progress records
    let userProgressMap = new Map<number, any>();
    if (userId) {
      const userProgressRecords = await prisma.challengeProgress.findMany({
        where: { userId },
      });
      userProgressMap = new Map(userProgressRecords.map((up) => [up.challengeId, up]));
    }

    const now = new Date();

    return challenges.map((c) => {
      const criteria = c.criteria as unknown as ChallengeCriteria;
      const target = criteria.target || 1;
      const daysLeft = calculateDaysRemaining(c.endsAt, now);
      const status = getChallengeStatus(c.startsAt, c.endsAt, now);
      const participantCount = c._count.progress;

      let userProgress: ChallengeUserProgress | undefined;
      if (userId) {
        const record = userProgressMap.get(c.id);
        if (record) {
          const current = record.progress;
          const percentage = Math.min(100, Math.round((current / target) * 100));
          userProgress = {
            joined: true,
            progress: current,
            target,
            percentage,
            completed: record.completed,
            completedAt: record.completedAt ? record.completedAt.toISOString() : null,
            joinedAt: record.joinedAt.toISOString(),
          };
        } else {
          userProgress = {
            joined: false,
            progress: 0,
            target,
            percentage: 0,
            completed: false,
            completedAt: null,
          };
        }
      }

      return {
        id: c.id,
        title: c.title,
        description: c.description,
        criteria,
        scope: c.scope,
        startsAt: c.startsAt.toISOString(),
        endsAt: c.endsAt.toISOString(),
        createdAt: c.createdAt.toISOString(),
        status,
        daysLeft,
        participantCount,
        userProgress,
      };
    });
  }

  /**
   * Retrieves single challenge by ID with details and user status.
   */
  public async getChallengeById(challengeId: number, userId?: string): Promise<ChallengeResponseItem> {
    const challenge = await prisma.challenge.findUnique({
      where: { id: challengeId },
      include: {
        _count: {
          select: { progress: true },
        },
      },
    });

    if (!challenge) {
      throw new NotFoundError(`Challenge with ID ${challengeId} not found`);
    }

    const criteria = challenge.criteria as unknown as ChallengeCriteria;
    const target = criteria.target || 1;
    const now = new Date();
    const daysLeft = calculateDaysRemaining(challenge.endsAt, now);
    const status = getChallengeStatus(challenge.startsAt, challenge.endsAt, now);

    let userProgress: ChallengeUserProgress | undefined;
    if (userId) {
      const record = await prisma.challengeProgress.findUnique({
        where: {
          challengeId_userId: {
            challengeId,
            userId,
          },
        },
      });

      if (record) {
        const current = record.progress;
        const percentage = Math.min(100, Math.round((current / target) * 100));
        userProgress = {
          joined: true,
          progress: current,
          target,
          percentage,
          completed: record.completed,
          completedAt: record.completedAt ? record.completedAt.toISOString() : null,
          joinedAt: record.joinedAt.toISOString(),
        };
      } else {
        userProgress = {
          joined: false,
          progress: 0,
          target,
          percentage: 0,
          completed: false,
          completedAt: null,
        };
      }
    }

    return {
      id: challenge.id,
      title: challenge.title,
      description: challenge.description,
      criteria,
      scope: challenge.scope,
      startsAt: challenge.startsAt.toISOString(),
      endsAt: challenge.endsAt.toISOString(),
      createdAt: challenge.createdAt.toISOString(),
      status,
      daysLeft,
      participantCount: challenge._count.progress,
      userProgress,
    };
  }

  /**
   * Joins a user to a challenge and computes their initial progress based on existing eligible sightings.
   */
  public async joinChallenge(challengeId: number, userId: string): Promise<ChallengeUserProgress> {
    const challenge = await prisma.challenge.findUnique({
      where: { id: challengeId },
    });

    if (!challenge) {
      throw new NotFoundError(`Challenge with ID ${challengeId} not found`);
    }

    const now = new Date();
    if (now > challenge.endsAt) {
      throw new ValidationError('This seasonal challenge has already ended');
    }

    // Check existing progress record
    const existing = await prisma.challengeProgress.findUnique({
      where: {
        challengeId_userId: {
          challengeId,
          userId,
        },
      },
    });

    const criteria = challenge.criteria as unknown as ChallengeCriteria;
    const target = criteria.target || 1;

    if (existing) {
      const percentage = Math.min(100, Math.round((existing.progress / target) * 100));
      return {
        joined: true,
        progress: existing.progress,
        target,
        percentage,
        completed: existing.completed,
        completedAt: existing.completedAt ? existing.completedAt.toISOString() : null,
        joinedAt: existing.joinedAt.toISOString(),
      };
    }

    // Evaluate sightings recorded during the challenge window
    const eligibleSightings = await prisma.sighting.findMany({
      where: {
        userId,
        observedAt: {
          gte: challenge.startsAt,
          lte: challenge.endsAt,
        },
      },
      include: {
        species: {
          select: { family: true },
        },
      },
    });

    const evalResult = evaluateChallengeCriteria(criteria, eligibleSightings);

    const record = await prisma.challengeProgress.create({
      data: {
        challengeId,
        userId,
        progress: evalResult.current,
        completed: evalResult.completed,
        completedAt: evalResult.completed ? new Date() : null,
      },
    });

    return {
      joined: true,
      progress: record.progress,
      target,
      percentage: evalResult.percentage,
      completed: record.completed,
      completedAt: record.completedAt ? record.completedAt.toISOString() : null,
      joinedAt: record.joinedAt.toISOString(),
    };
  }

  /**
   * Recalculates challenge progress for a user across all active challenges they have joined.
   */
  public async updateUserChallengeProgress(userId: string): Promise<void> {
    try {
      const joinedRecords = await prisma.challengeProgress.findMany({
        where: {
          userId,
          completed: false, // only update incomplete ones
        },
        include: {
          challenge: true,
        },
      });

      const now = new Date();

      for (const item of joinedRecords) {
        const { challenge } = item;
        if (now > challenge.endsAt) continue;

        const criteria = challenge.criteria as unknown as ChallengeCriteria;
        const target = criteria.target || 1;

        const eligibleSightings = await prisma.sighting.findMany({
          where: {
            userId,
            observedAt: {
              gte: challenge.startsAt,
              lte: challenge.endsAt,
            },
          },
          include: {
            species: {
              select: { family: true },
            },
          },
        });

        const evalResult = evaluateChallengeCriteria(criteria, eligibleSightings);

        await prisma.challengeProgress.update({
          where: { id: item.id },
          data: {
            progress: evalResult.current,
            completed: evalResult.completed,
            completedAt: evalResult.completed ? (item.completedAt || new Date()) : null,
          },
        });
      }
    } catch (err) {
      console.warn(`⚠️ [ChallengeService] Failed to update challenges for user ${userId}:`, err);
    }
  }
}

export const challengeService = new ChallengeService();
export default challengeService;
