import { Router } from 'express';
import {
  listSpeciesHandler,
  getSpeciesByIdHandler,
  getFamiliesHandler,
} from '../controllers/speciesController';

const router = Router();

// Taxonomy metadata endpoint
router.get('/families', getFamiliesHandler);

// Catalog list with search and pagination
router.get('/', listSpeciesHandler);

// Single species detail by ID
router.get('/:id', getSpeciesByIdHandler);

export default router;
