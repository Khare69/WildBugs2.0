import { Router } from 'express';
import userController from '../controllers/userController';
import { authenticate } from '../middleware/authenticate';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

/**
 * @route   GET /api/users/me
 * @desc    Get authenticated user's profile and aggregated discovery statistics
 * @access  Protected
 */
router.get('/me', authenticate, asyncHandler(userController.getMyProfileHandler));

/**
 * @route   GET /api/users/leaderboard
 * @desc    Get top naturalists ranked by sightings, unique species, or verified records
 * @access  Public
 */
router.get('/leaderboard', asyncHandler(userController.getLeaderboardHandler));

/**
 * @route   GET /api/users/:id/journal
 * @desc    Get paginated chronological field journal observations for a user
 * @access  Public
 */
router.get('/:id/journal', asyncHandler(userController.getJournalHandler));

/**
 * @route   GET /api/users/:id/badges
 * @desc    Get all platform achievement badges annotated with user's progress and earned state
 * @access  Public
 */
router.get('/:id/badges', asyncHandler(userController.getBadgesHandler));

/**
 * @route   GET /api/users/:id
 * @desc    Get public profile and statistics for any user
 * @access  Public
 */
router.get('/:id', asyncHandler(userController.getPublicProfileHandler));

export default router;
