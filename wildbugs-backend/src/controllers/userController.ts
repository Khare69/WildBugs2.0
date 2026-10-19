import { Request, Response } from 'express';
import userService, { LeaderboardMetric } from '../services/userService';
import { UnauthorizedError, ValidationError } from '../utils/errors';

export class UserController {
  /**
   * GET /api/users/me
   * Retrieves profile details and aggregated statistics for the authenticated user.
   */
  public getMyProfileHandler = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?.userId || req.user?.id;
    if (!userId) {
      throw new UnauthorizedError('Authentication required to access profile');
    }

    const data = await userService.getUserProfile(userId, true);

    res.status(200).json({
      status: 'success',
      data,
    });
  };

  /**
   * GET /api/users/:id
   * Retrieves public profile details and statistics for any naturalist.
   */
  public getPublicProfileHandler = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    if (!id || typeof id !== 'string' || id.trim().length === 0) {
      throw new ValidationError('A valid user ID is required');
    }

    const data = await userService.getUserProfile(id.trim(), false);

    res.status(200).json({
      status: 'success',
      data,
    });
  };

  /**
   * GET /api/users/:id/journal
   * Retrieves paginated chronological field journal sightings for a user.
   */
  public getJournalHandler = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    if (!id || typeof id !== 'string' || id.trim().length === 0) {
      throw new ValidationError('A valid user ID is required');
    }

    const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string, 10) || 10));

    const data = await userService.getJournal(id.trim(), page, limit);

    res.status(200).json({
      status: 'success',
      data,
    });
  };

  /**
   * GET /api/users/leaderboard
   * Retrieves platform-wide rankings by sightings, unique species, or verified records.
   */
  public getLeaderboardHandler = async (req: Request, res: Response): Promise<void> => {
    const metricParam = (req.query.metric as string)?.toLowerCase() || 'sightings';
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string, 10) || 10));

    const validMetrics: LeaderboardMetric[] = ['sightings', 'species', 'verified'];
    if (!validMetrics.includes(metricParam as LeaderboardMetric)) {
      throw new ValidationError(
        `Invalid metric '${metricParam}'. Must be one of: ${validMetrics.join(', ')}`
      );
    }

    const data = await userService.getLeaderboard(metricParam as LeaderboardMetric, limit);

    res.status(200).json({
      status: 'success',
      data,
    });
  };
}

export const userController = new UserController();
export default userController;
