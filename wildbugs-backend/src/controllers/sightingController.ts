import { Request, Response } from 'express';
import { z } from 'zod';
import sightingService from '../services/sightingService';
import { ValidationError, UnauthorizedError } from '../utils/errors';

/**
 * Validation schema for sighting creation multipart payload.
 * Uses coercion to handle multipart/form-data string serialization.
 */
const createSightingSchema = z.object({
  latitude: z.coerce
    .number({ invalid_type_error: 'Latitude must be a valid number' })
    .min(-90, 'Latitude must be between -90 and 90 degrees')
    .max(90, 'Latitude must be between -90 and 90 degrees'),
  longitude: z.coerce
    .number({ invalid_type_error: 'Longitude must be a valid number' })
    .min(-180, 'Longitude must be between -180 and 180 degrees')
    .max(180, 'Longitude must be between -180 and 180 degrees'),
  speciesId: z.preprocess(
    (val) => (val === '' || val === null || val === undefined ? undefined : val),
    z.coerce.number().int().positive().optional()
  ),
  observedAt: z.string().optional(),
});

const verifySightingSchema = z.object({
  speciesId: z.preprocess(
    (val) => (val === '' || val === null || val === undefined ? undefined : val),
    z.coerce.number().int().positive().optional()
  ),
  notes: z.string().max(500, 'Verification notes cannot exceed 500 characters').optional(),
});

const rejectSightingSchema = z.object({
  reason: z.string().max(500, 'Rejection reason cannot exceed 500 characters').optional(),
});

export class SightingController {
  /**
   * POST /api/sightings
   * Ingests a new sighting observation with uploaded photo and GPS coordinates.
   */
  public createHandler = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?.userId || req.user?.id;
    if (!userId) {
      throw new UnauthorizedError('Authentication required to upload sightings');
    }

    if (!req.file) {
      throw new ValidationError(
        'An observation photo file is required under field name "photo" or "image"'
      );
    }

    const parsed = createSightingSchema.parse(req.body);

    const sighting = await sightingService.create(userId, {
      file: req.file,
      latitude: parsed.latitude,
      longitude: parsed.longitude,
      speciesId: parsed.speciesId,
      observedAt: parsed.observedAt,
    });

    res.status(201).json({
      status: 'success',
      data: { sighting },
    });
  };

  /**
   * GET /api/sightings/:id
   * Retrieves sighting details by unique identifier.
   */
  public getByIdHandler = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    if (!id || typeof id !== 'string' || id.trim().length === 0) {
      throw new ValidationError('A valid sighting ID is required');
    }

    const sighting = await sightingService.getById(id);

    res.status(200).json({
      status: 'success',
      data: { sighting },
    });
  };

  /**
   * GET /api/sightings/me
   * Retrieves the authenticated observer's sightings history.
   */
  public getMySightingsHandler = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?.userId || req.user?.id;
    if (!userId) {
      throw new UnauthorizedError('Authentication required');
    }

    const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string, 10) || 20));

    const result = await sightingService.getUserSightings(userId, page, limit);

    res.status(200).json({
      status: 'success',
      data: result,
    });
  };

  /**
   * GET /api/sightings
   * Lists the most recent sightings across the platform.
   */
  public getRecentHandler = async (req: Request, res: Response): Promise<void> => {
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string, 10) || 20));
    const sightings = await sightingService.getRecent(limit);

    res.status(200).json({
      status: 'success',
      data: { sightings },
    });
  };

  /**
   * PUT /api/sightings/:id/verify
   * Allows credentialed experts and administrators to verify an observation.
   */
  public verifyHandler = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    if (!id || typeof id !== 'string' || id.trim().length === 0) {
      throw new ValidationError('A valid sighting ID is required');
    }

    const expertUserId = req.user?.userId || req.user?.id;
    if (!expertUserId) {
      throw new UnauthorizedError('Authentication required');
    }

    const parsed = verifySightingSchema.parse(req.body);

    const sighting = await sightingService.verifySighting(
      id,
      expertUserId,
      parsed.speciesId,
      parsed.notes
    );

    res.status(200).json({
      status: 'success',
      data: { sighting },
    });
  };

  /**
   * PUT /api/sightings/:id/reject
   * Allows credentialed experts and administrators to reject an observation.
   */
  public rejectHandler = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    if (!id || typeof id !== 'string' || id.trim().length === 0) {
      throw new ValidationError('A valid sighting ID is required');
    }

    const expertUserId = req.user?.userId || req.user?.id;
    if (!expertUserId) {
      throw new UnauthorizedError('Authentication required');
    }

    const parsed = rejectSightingSchema.parse(req.body);

    const sighting = await sightingService.rejectSighting(id, expertUserId, parsed.reason);

    res.status(200).json({
      status: 'success',
      data: { sighting },
    });
  };
}

export const sightingController = new SightingController();
export default sightingController;
