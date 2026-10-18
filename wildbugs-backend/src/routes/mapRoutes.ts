import { Router } from 'express';
import mapController from '../controllers/mapController';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

/**
 * @route   GET /api/map/sightings
 * @desc    Retrieve insect sightings within bounding box as GeoJSON FeatureCollection
 * @access  Public
 * @query   minLat, maxLat, minLng, maxLng, speciesId, dateFrom, dateTo, limit
 */
router.get('/sightings', asyncHandler(mapController.getSightingsHandler));

/**
 * @route   GET /api/map/heatmap
 * @desc    Retrieve aggregated density points [latitude, longitude, intensity]
 * @access  Public
 * @query   minLat, maxLat, minLng, maxLng, speciesId, dateFrom, dateTo, gridSize
 */
router.get('/heatmap', asyncHandler(mapController.getHeatmapHandler));

export default router;
