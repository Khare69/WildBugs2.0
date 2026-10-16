import { Request, Response } from 'express';
import { z } from 'zod';
import speciesService from '../services/speciesService';
import { asyncHandler } from '../middleware/errorHandler';

export const speciesQuerySchema = z.object({
  search: z.string().optional(),
  family: z.string().optional(),
  conservationStatus: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export const speciesIdSchema = z.object({
  id: z.coerce.number().int().positive('Species ID must be a positive integer'),
});

/**
 * Controller to list species with optional search, family filter, and pagination.
 */
export const listSpeciesHandler = asyncHandler(async (req: Request, res: Response) => {
  const query = speciesQuerySchema.parse(req.query);
  const result = await speciesService.getSpeciesList(query);

  res.status(200).json({
    status: 'success',
    data: result.species,
    meta: {
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    },
  });
});

/**
 * Controller to retrieve a single species profile by ID.
 */
export const getSpeciesByIdHandler = asyncHandler(async (req: Request, res: Response) => {
  const { id } = speciesIdSchema.parse(req.params);
  const species = await speciesService.getSpeciesById(id);

  res.status(200).json({
    status: 'success',
    data: species,
  });
});

/**
 * Controller to fetch distinct families for catalog filtering.
 */
export const getFamiliesHandler = asyncHandler(async (_req: Request, res: Response) => {
  const families = await speciesService.getFamilies();

  res.status(200).json({
    status: 'success',
    data: families,
  });
});
