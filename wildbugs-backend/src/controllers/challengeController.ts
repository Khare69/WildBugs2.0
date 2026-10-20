import { Request, Response } from 'express';
import challengeService from '../services/challengeService';
import { UnauthorizedError, ValidationError } from '../utils/errors';

export class ChallengeController {
  /**
   * GET /api/challenges
   * Retrieves active seasonal bioblitz challenges, annotated with user progress if authenticated.
   */
  public getChallengesHandler = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?.userId || req.user?.id;
    const data = await challengeService.getActiveChallenges(userId);

    res.status(200).json({
      status: 'success',
      data,
    });
  };

  /**
   * GET /api/challenges/:id
   * Retrieves a specific seasonal challenge by ID.
   */
  public getChallengeDetailHandler = async (req: Request, res: Response): Promise<void> => {
    const challengeId = parseInt(req.params.id, 10);
    if (isNaN(challengeId) || challengeId <= 0) {
      throw new ValidationError('A valid numeric challenge ID is required');
    }

    const userId = req.user?.userId || req.user?.id;
    const data = await challengeService.getChallengeById(challengeId, userId);

    res.status(200).json({
      status: 'success',
      data,
    });
  };

  /**
   * POST /api/challenges/:id/join
   * Joins the authenticated naturalist into a seasonal challenge.
   */
  public joinChallengeHandler = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?.userId || req.user?.id;
    if (!userId) {
      throw new UnauthorizedError('Authentication required to join a seasonal challenge');
    }

    const challengeId = parseInt(req.params.id, 10);
    if (isNaN(challengeId) || challengeId <= 0) {
      throw new ValidationError('A valid numeric challenge ID is required');
    }

    const data = await challengeService.joinChallenge(challengeId, userId);

    res.status(200).json({
      status: 'success',
      message: 'Successfully enrolled in seasonal challenge',
      data,
    });
  };

  /**
   * GET /api/challenges/:id/progress
   * Retrieves user's progress in a specific seasonal challenge.
   */
  public getChallengeProgressHandler = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?.userId || req.user?.id;
    if (!userId) {
      throw new UnauthorizedError('Authentication required to inspect challenge progress');
    }

    const challengeId = parseInt(req.params.id, 10);
    if (isNaN(challengeId) || challengeId <= 0) {
      throw new ValidationError('A valid numeric challenge ID is required');
    }

    const challenge = await challengeService.getChallengeById(challengeId, userId);

    res.status(200).json({
      status: 'success',
      data: challenge.userProgress,
    });
  };
}

export const challengeController = new ChallengeController();
export default challengeController;
