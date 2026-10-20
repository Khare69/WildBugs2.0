import { Job } from 'bullmq';
import { BadgeJobData } from './queue';
import badgeService from '../services/badgeService';
import challengeService from '../services/challengeService';

export interface BadgeProcessResult {
  userId: string;
  awardedBadges: string[];
  count: number;
}

/**
 * BullMQ Worker processor that executes milestone and badge eligibility verification.
 *
 * 1. Reads user ID from job data.
 * 2. Evaluates criteria across all platform badges against user activity metrics.
 * 3. Records UserBadge associations for any newly achieved achievements.
 * 4. Updates active seasonal challenge progress for the observer.
 */
export const processBadgeJob = async (
  job: Job<BadgeJobData>
): Promise<BadgeProcessResult> => {
  const { userId } = job.data;

  try {
    const [newlyAwarded] = await Promise.all([
      badgeService.evaluateBadges(userId),
      challengeService.updateUserChallengeProgress(userId),
    ]);
    const awardedNames = newlyAwarded.map((b) => b.name);

    if (awardedNames.length > 0) {
      console.log(
        `[Badge Worker] User ${userId} unlocked ${awardedNames.length} new badge(s): ${awardedNames.join(', ')}`
      );
    }

    return {
      userId,
      awardedBadges: awardedNames,
      count: awardedNames.length,
    };
  } catch (err) {
    console.warn(`[Badge Worker] Error evaluating badges for user ${userId}:`, err);
    return {
      userId,
      awardedBadges: [],
      count: 0,
    };
  }
};

export default processBadgeJob;
