import { Router } from 'express';
import challengeController from '../controllers/challengeController';
import { authenticate, optionalAuthenticate } from '../middleware/authenticate';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

/**
 * @route   GET /api/challenges
 * @desc    Get active seasonal challenges, with user progress if authenticated
 * @access  Public (Enhanced with Auth)
 */
router.get('/', optionalAuthenticate, asyncHandler(challengeController.getChallengesHandler));

/**
 * @route   GET /api/challenges/:id
 * @desc    Get details and progress for a single challenge
 * @access  Public (Enhanced with Auth)
 */
router.get('/:id', optionalAuthenticate, asyncHandler(challengeController.getChallengeDetailHandler));

/**
 * @route   POST /api/challenges/:id/join
 * @desc    Enroll the authenticated user into a seasonal challenge
 * @access  Protected
 */
router.post('/:id/join', authenticate, asyncHandler(challengeController.joinChallengeHandler));

/**
 * @route   GET /api/challenges/:id/progress
 * @desc    Get user's progress in a specific seasonal challenge
 * @access  Protected
 */
router.get('/:id/progress', authenticate, asyncHandler(challengeController.getChallengeProgressHandler));

export default router;
