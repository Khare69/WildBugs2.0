import { Request, Response } from 'express';
import { z } from 'zod';
import mapService from '../services/mapService';

/**
 * Validation schema for GeoJSON bounding box queries.
 */
const getSightingsQuerySchema = z
  .object({
    minLat: z.coerce
      .number({ invalid_type_error: 'minLat must be a valid number' })
      .min(-90, 'minLat must be >= -90')
      .max(90, 'minLat must be <= 90')
      .optional(),
    maxLat: z.coerce
      .number({ invalid_type_error: 'maxLat must be a valid number' })
      .min(-90, 'maxLat must be >= -90')
      .max(90, 'maxLat must be <= 90')
      .optional(),
    minLng: z.coerce
      .number({ invalid_type_error: 'minLng must be a valid number' })
      .min(-180, 'minLng must be >= -180')
      .max(180, 'minLng must be <= 180')
      .optional(),
    maxLng: z.coerce
      .number({ invalid_type_error: 'maxLng must be a valid number' })
      .min(-180, 'maxLng must be >= -180')
      .max(180, 'maxLng must be <= 180')
      .optional(),
    speciesId: z.coerce
      .number()
      .int('speciesId must be an integer')
      .positive('speciesId must be positive')
      .optional(),
    dateFrom: z
      .string()
      .refine((val) => !isNaN(Date.parse(val)), {
        message: 'dateFrom must be a valid ISO date string',
      })
      .optional(),
    dateTo: z
      .string()
      .refine((val) => !isNaN(Date.parse(val)), {
        message: 'dateTo must be a valid ISO date string',
      })
      .optional(),
    limit: z.coerce
      .number()
      .int()
      .positive()
      .max(5000, 'Maximum limit is 5000')
      .optional()
      .default(1000),
  })
  .refine(
    (data) => {
      if (data.minLat !== undefined && data.maxLat !== undefined) {
        return data.minLat <= data.maxLat;
      }
      return true;
    },
    {
      message: 'minLat must be less than or equal to maxLat',
      path: ['minLat'],
    }
  )
  .refine(
    (data) => {
      if (data.dateFrom && data.dateTo) {
        return new Date(data.dateFrom) <= new Date(data.dateTo);
      }
      return true;
    },
    {
      message: 'dateFrom must be before or equal to dateTo',
      path: ['dateFrom'],
    }
  );

/**
 * Validation schema for heatmap density queries.
 */
const getHeatmapQuerySchema = z
  .object({
    minLat: z.coerce
      .number({ invalid_type_error: 'minLat must be a valid number' })
      .min(-90, 'minLat must be >= -90')
      .max(90, 'minLat must be <= 90')
      .optional(),
    maxLat: z.coerce
      .number({ invalid_type_error: 'maxLat must be a valid number' })
      .min(-90, 'maxLat must be >= -90')
      .max(90, 'maxLat must be <= 90')
      .optional(),
    minLng: z.coerce
      .number({ invalid_type_error: 'minLng must be a valid number' })
      .min(-180, 'minLng must be >= -180')
      .max(180, 'minLng must be <= 180')
      .optional(),
    maxLng: z.coerce
      .number({ invalid_type_error: 'maxLng must be a valid number' })
      .min(-180, 'maxLng must be >= -180')
      .max(180, 'maxLng must be <= 180')
      .optional(),
    speciesId: z.coerce
      .number()
      .int('speciesId must be an integer')
      .positive('speciesId must be positive')
      .optional(),
    dateFrom: z
      .string()
      .refine((val) => !isNaN(Date.parse(val)), {
        message: 'dateFrom must be a valid ISO date string',
      })
      .optional(),
    dateTo: z
      .string()
      .refine((val) => !isNaN(Date.parse(val)), {
        message: 'dateTo must be a valid ISO date string',
      })
      .optional(),
    gridSize: z.coerce
      .number()
      .min(0.001, 'Minimum grid size is 0.001 degrees')
      .max(1.0, 'Maximum grid size is 1.0 degrees')
      .optional()
      .default(0.01),
  })
  .refine(
    (data) => {
      if (data.minLat !== undefined && data.maxLat !== undefined) {
        return data.minLat <= data.maxLat;
      }
      return true;
    },
    {
      message: 'minLat must be less than or equal to maxLat',
      path: ['minLat'],
    }
  )
  .refine(
    (data) => {
      if (data.dateFrom && data.dateTo) {
        return new Date(data.dateFrom) <= new Date(data.dateTo);
      }
      return true;
    },
    {
      message: 'dateFrom must be before or equal to dateTo',
      path: ['dateFrom'],
    }
  );

export class MapController {
  /**
   * GET /api/map/sightings
   * Returns sightings within a bounding box formatted as a standard GeoJSON FeatureCollection.
   */
  public getSightingsHandler = async (req: Request, res: Response): Promise<void> => {
    const query = getSightingsQuerySchema.parse(req.query);
    const geoJson = await mapService.getSightingsGeoJSON(query);

    res.status(200).json(geoJson);
  };

  /**
   * GET /api/map/heatmap
   * Returns aggregated density points [latitude, longitude, intensity] for heatmap visualization.
   */
  public getHeatmapHandler = async (req: Request, res: Response): Promise<void> => {
    const query = getHeatmapQuerySchema.parse(req.query);
    const points = await mapService.getHeatmapData(query);

    res.status(200).json({
      status: 'success',
      data: points,
      points, // Backwards-compatible access for Leaflet-heat consumers
      count: points.length,
    });
  };
}

export const mapController = new MapController();
export default mapController;
