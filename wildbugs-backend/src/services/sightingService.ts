import { Sighting } from '@prisma/client';
import prisma from '../database/prisma';
import imageService from './imageService';
import { addIdentificationJob, addBadgeCheckJob } from '../jobs/queue';
import { NotFoundError, ValidationError } from '../utils/errors';

export interface CreateSightingInput {
  file: Express.Multer.File;
  latitude: number;
  longitude: number;
  speciesId?: number;
  observedAt?: Date | string;
}

export class SightingService {
  /**
   * Creates a new insect sighting by uploading its photo to cloud storage
   * and recording GPS coordinates and observation metadata in the database.
   */
  public async create(userId: string, input: CreateSightingInput): Promise<Sighting> {
    if (!input.file || !input.file.buffer) {
      throw new ValidationError('A photo file is required to create a sighting observation.');
    }

    if (isNaN(input.latitude) || input.latitude < -90 || input.latitude > 90) {
      throw new ValidationError('Latitude must be a valid number between -90 and 90 degrees.');
    }

    if (isNaN(input.longitude) || input.longitude < -180 || input.longitude > 180) {
      throw new ValidationError('Longitude must be a valid number between -180 and 180 degrees.');
    }

    // 1. Upload photo to Cloudinary
    const uploadResult = await imageService.uploadImage(input.file.buffer, 'wildbugs/sightings');

    // 2. Validate speciesId if provided
    let speciesIdToLink: number | null = null;
    if (input.speciesId !== undefined && input.speciesId !== null && !isNaN(input.speciesId)) {
      const speciesExists = await prisma.species.findUnique({
        where: { id: input.speciesId },
        select: { id: true },
      });
      if (speciesExists) {
        speciesIdToLink = speciesExists.id;
      }
    }

    // 3. Parse observedAt date
    let observedAtDate = new Date();
    if (input.observedAt) {
      const parsed = new Date(input.observedAt);
      if (!isNaN(parsed.getTime())) {
        observedAtDate = parsed;
      }
    }

    // 4. Persist sighting in database
    const sighting = await prisma.sighting.create({
      data: {
        userId,
        photoUrl: uploadResult.url,
        thumbnailUrl: uploadResult.thumbnailUrl,
        latitude: input.latitude,
        longitude: input.longitude,
        speciesId: speciesIdToLink,
        observedAt: observedAtDate,
      },
      include: {
        user: {
          select: {
            id: true,
            displayName: true,
            avatarUrl: true,
            role: true,
          },
        },
        species: {
          select: {
            id: true,
            commonName: true,
            scientificName: true,
            family: true,
            imageUrl: true,
            conservationStatus: true,
          },
        },
      },
    });

    // 5. Enqueue background computer vision insect identification job
    await addIdentificationJob(sighting.id, sighting.photoUrl);

    // 6. Enqueue background badge check job for observer
    await addBadgeCheckJob(userId);

    return sighting;
  }

  /**
   * Retrieves a single sighting by ID with author and species relations.
   */
  public async getById(id: string) {
    const sighting = await prisma.sighting.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            displayName: true,
            avatarUrl: true,
            role: true,
          },
        },
        species: true,
        identifications: {
          include: {
            user: {
              select: {
                id: true,
                displayName: true,
                role: true,
              },
            },
            species: {
              select: {
                id: true,
                commonName: true,
                scientificName: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!sighting) {
      throw new NotFoundError(`Sighting observation with ID '${id}' was not found`);
    }

    return sighting;
  }

  /**
   * Lists sightings recorded by a specific user with pagination.
   */
  public async getUserSightings(userId: string, page = 1, limit = 20) {
    const skip = (Math.max(1, page) - 1) * limit;

    const [sightings, total] = await Promise.all([
      prisma.sighting.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          species: {
            select: {
              id: true,
              commonName: true,
              scientificName: true,
              family: true,
            },
          },
        },
      }),
      prisma.sighting.count({ where: { userId } }),
    ]);

    return {
      sightings,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Lists recent sightings across the entire platform.
   */
  public async getRecent(limit = 20) {
    return prisma.sighting.findMany({
      take: Math.min(50, limit),
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            displayName: true,
            role: true,
          },
        },
        species: {
          select: {
            id: true,
            commonName: true,
            scientificName: true,
          },
        },
      },
    });
  }
}

export const sightingService = new SightingService();
export default sightingService;
