import { Router } from 'express';
import { Role } from '@prisma/client';
import sightingController from '../controllers/sightingController';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import { uploadSinglePhoto } from '../middleware/upload';
import { uploadLimiter } from '../middleware/rateLimiter';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

/**
 * @route   POST /api/sightings
 * @desc    Upload and record a new insect sighting observation (rate-limited: 20/hr/user)
 * @access  Protected (Requires Bearer JWT token)
 */
router.post(
  '/',
  authenticate,
  uploadLimiter,
  uploadSinglePhoto,
  asyncHandler(sightingController.createHandler)
);

/**
 * @route   GET /api/sightings/me
 * @desc    Retrieve sightings submitted by the authenticated observer
 * @access  Protected
 */
router.get(
  '/me',
  authenticate,
  asyncHandler(sightingController.getMySightingsHandler)
);

/**
 * @route   PUT /api/sightings/:id/verify
 * @desc    Verify sighting as an expert or administrator
 * @access  Protected (EXPERT or ADMIN role)
 */
router.put(
  '/:id/verify',
  authenticate,
  authorize(Role.EXPERT, Role.ADMIN),
  asyncHandler(sightingController.verifyHandler)
);

/**
 * @route   PUT /api/sightings/:id/reject
 * @desc    Reject sighting observation
 * @access  Protected (EXPERT or ADMIN role)
 */
router.put(
  '/:id/reject',
  authenticate,
  authorize(Role.EXPERT, Role.ADMIN),
  asyncHandler(sightingController.rejectHandler)
);

/**
 * @route   GET /api/sightings/:id
 * @desc    Get detailed information about a single sighting observation
 * @access  Public
 */
router.get(
  '/:id',
  asyncHandler(sightingController.getByIdHandler)
);

/**
 * @route   GET /api/sightings
 * @desc    Get recent observation sightings across the platform
 * @access  Public
 */
router.get(
  '/',
  asyncHandler(sightingController.getRecentHandler)
);

export default router;
