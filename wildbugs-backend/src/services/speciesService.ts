import prisma from '../database/prisma';
import { NotFoundError } from '../utils/errors';
import { Species, Prisma } from '@prisma/client';
import cacheService from './cacheService';

export interface SpeciesListQuery {
  search?: string;
  family?: string;
  conservationStatus?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedSpeciesResponse {
  species: Species[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface SpeciesDetail extends Species {
  _count?: {
    sightings: number;
    identifications: number;
  };
}

export class SpeciesService {
  /**
   * Retrieves a paginated and filtered list of species from the database (cached 1hr).
   */
  public async getSpeciesList(query: SpeciesListQuery): Promise<PaginatedSpeciesResponse> {
    const cacheKey = `species:list:${JSON.stringify(query)}`;
    const cached = await cacheService.get<PaginatedSpeciesResponse>(cacheKey);
    if (cached) {
      return cached;
    }

    const page = Math.max(1, query.page || 1);
    const limit = Math.min(100, Math.max(1, query.limit || 20));
    const skip = (page - 1) * limit;

    const where: Prisma.SpeciesWhereInput = {};

    if (query.family && query.family.trim().length > 0) {
      where.family = {
        equals: query.family.trim(),
        mode: 'insensitive',
      };
    }

    if (query.conservationStatus && query.conservationStatus.trim().length > 0) {
      where.conservationStatus = {
        equals: query.conservationStatus.trim(),
        mode: 'insensitive',
      };
    }

    if (query.search && query.search.trim().length > 0) {
      const searchTerm = query.search.trim();
      where.OR = [
        { commonName: { contains: searchTerm, mode: 'insensitive' } },
        { scientificName: { contains: searchTerm, mode: 'insensitive' } },
        { family: { contains: searchTerm, mode: 'insensitive' } },
        { habitat: { contains: searchTerm, mode: 'insensitive' } },
      ];
    }

    const [total, species] = await Promise.all([
      prisma.species.count({ where }),
      prisma.species.findMany({
        where,
        skip,
        take: limit,
        orderBy: { commonName: 'asc' },
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    const result: PaginatedSpeciesResponse = {
      species,
      total,
      page,
      limit,
      totalPages,
    };

    // Cache in Redis for 1 hour (3600 seconds)
    await cacheService.set(cacheKey, result, 3600);

    return result;
  }

  /**
   * Retrieves a single species by its unique ID (cached 1hr).
   */
  public async getSpeciesById(id: number): Promise<SpeciesDetail> {
    const cacheKey = `species:detail:${id}`;
    const cached = await cacheService.get<SpeciesDetail>(cacheKey);
    if (cached) {
      return cached;
    }

    const species = await prisma.species.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            sightings: true,
            identifications: true,
          },
        },
      },
    });

    if (!species) {
      throw new NotFoundError(`Species with ID ${id} was not found`);
    }

    await cacheService.set(cacheKey, species, 3600);

    return species;
  }

  /**
   * Retrieves distinct taxonomic families present in the species catalog (cached 1hr).
   */
  public async getFamilies(): Promise<{ family: string; count: number }[]> {
    const cacheKey = 'species:families';
    const cached = await cacheService.get<{ family: string; count: number }[]>(cacheKey);
    if (cached) {
      return cached;
    }

    const groups = await prisma.species.groupBy({
      by: ['family'],
      _count: {
        id: true,
      },
      orderBy: {
        family: 'asc',
      },
    });

    const result = groups.map((g) => ({
      family: g.family,
      count: g._count.id,
    }));

    await cacheService.set(cacheKey, result, 3600);

    return result;
  }
}

export const speciesService = new SpeciesService();
export default speciesService;
