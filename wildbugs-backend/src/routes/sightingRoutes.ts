import { Router } from 'express';
import sightingController from '../controllers/sightingController';
import { authenticate } from '../middleware/authenticate';
import { uploadSinglePhoto } from '../middleware/upload';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

/**
 * @route   POST /api/sightings
 * @desc    Upload and record a new insect sighting observation
 * @access  Protected (Requires Bearer JWT token)
 */
router.post(
  '/',
  authenticate,
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
