import prisma from '../database/prisma';
import { NotFoundError } from '../utils/errors';
import { Species, Prisma } from '@prisma/client';

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
   * Retrieves a paginated and filtered list of species from the database.
   */
  public async getSpeciesList(query: SpeciesListQuery): Promise<PaginatedSpeciesResponse> {
    const page = Math.max(1, query.page || 1);
    const limit = Math.min(100, Math.max(1, query.limit || 20));
    const skip = (page - 1) * limit;

    const where: Prisma.SpeciesWhereInput = {};

    if (query.family) {
      where.family = {
        equals: query.family,
        mode: 'insensitive',
      };
    }

    if (query.conservationStatus) {
      where.conservationStatus = {
        equals: query.conservationStatus,
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

    return {
      species,
      total,
      page,
      limit,
      totalPages,
    };
  }

  /**
   * Retrieves a single species by its unique ID.
   */
  public async getSpeciesById(id: number): Promise<SpeciesDetail> {
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

    return species;
  }

  /**
   * Retrieves distinct taxonomic families present in the species catalog.
   */
  public async getFamilies(): Promise<{ family: string; count: number }[]> {
    const groups = await prisma.species.groupBy({
      by: ['family'],
      _count: {
        id: true,
      },
      orderBy: {
        family: 'asc',
      },
    });

    return groups.map((g) => ({
      family: g.family,
      count: g._count.id,
    }));
  }
}

export const speciesService = new SpeciesService();
export default speciesService;
