import { Prisma } from '@prisma/client';
import prisma from '../database/prisma';
import cacheService from './cacheService';

export interface GeoJSONPoint {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude] per RFC 7946
}

export interface SightingFeatureProperties {
  id: string;
  speciesId: number | null;
  speciesName: string;
  commonName: string;
  scientificName: string | null;
  family: string | null;
  thumbnailUrl: string | null;
  photoUrl: string;
  observedAt: string;
  status: string;
  aiConfidence: number | null;
  userId: string;
  observerName: string;
  latitude: number;
  longitude: number;
}

export interface GeoJSONFeature {
  type: 'Feature';
  id: string;
  geometry: GeoJSONPoint;
  properties: SightingFeatureProperties;
}

export interface GeoJSONFeatureCollection {
  type: 'FeatureCollection';
  features: GeoJSONFeature[];
  bbox?: [number, number, number, number]; // [minLng, minLat, maxLng, maxLat]
  status?: string;
  total?: number;
}

export interface MapSightingsFilter {
  minLat?: number;
  maxLat?: number;
  minLng?: number;
  maxLng?: number;
  speciesId?: number;
  dateFrom?: string | Date;
  dateTo?: string | Date;
  limit?: number;
}

export interface MapHeatmapFilter {
  minLat?: number;
  maxLat?: number;
  minLng?: number;
  maxLng?: number;
  speciesId?: number;
  dateFrom?: string | Date;
  dateTo?: string | Date;
  gridSize?: number; // In degrees, default 0.01 (~1.1 km)
}

/**
 * Array representation for Leaflet-heat: [latitude, longitude, intensity]
 */
export type HeatmapPoint = [number, number, number];

export class MapService {
  /**
   * Builds the Prisma where clause for geospatial bounding box and sighting filters.
   */
  public buildWhereClause(filters: MapSightingsFilter): Prisma.SightingWhereInput {
    const { minLat, maxLat, minLng, maxLng, speciesId, dateFrom, dateTo } = filters;
    const where: Prisma.SightingWhereInput = {};

    // 1. Latitude boundary filtering
    if (minLat !== undefined && maxLat !== undefined) {
      where.latitude = { gte: minLat, lte: maxLat };
    } else if (minLat !== undefined) {
      where.latitude = { gte: minLat };
    } else if (maxLat !== undefined) {
      where.latitude = { lte: maxLat };
    }

    // 2. Longitude boundary filtering (handling standard and antimeridian-spanning bounding boxes)
    if (minLng !== undefined && maxLng !== undefined) {
      if (minLng <= maxLng) {
        where.longitude = { gte: minLng, lte: maxLng };
      } else {
        // Crosses the 180th meridian (e.g., Pacific view minLng: 170, maxLng: -170)
        where.OR = [
          { longitude: { gte: minLng } },
          { longitude: { lte: maxLng } },
        ];
      }
    } else if (minLng !== undefined) {
      where.longitude = { gte: minLng };
    } else if (maxLng !== undefined) {
      where.longitude = { lte: maxLng };
    }

    // 3. Species ID filter
    if (speciesId !== undefined && speciesId !== null && !isNaN(speciesId)) {
      where.speciesId = speciesId;
    }

    // 4. Observation date range filter
    if (dateFrom || dateTo) {
      const dateFilter: Prisma.DateTimeFilter = {};
      if (dateFrom) {
        const from = new Date(dateFrom);
        if (!isNaN(from.getTime())) {
          dateFilter.gte = from;
        }
      }
      if (dateTo) {
        const to = new Date(dateTo);
        if (!isNaN(to.getTime())) {
          dateFilter.lte = to;
        }
      }
      if (dateFilter.gte || dateFilter.lte) {
        where.observedAt = dateFilter;
      }
    }

    return where;
  }

  /**
   * Retrieves sightings within a bounding box and formats them as a GeoJSON FeatureCollection.
   * RFC 7946 GeoJSON Standard: Coordinates are [longitude, latitude].
   */
  public async getSightingsGeoJSON(filters: MapSightingsFilter): Promise<GeoJSONFeatureCollection> {
    const cacheKey = `map:sightings:${JSON.stringify(filters)}`;
    const cached = await cacheService.get<GeoJSONFeatureCollection>(cacheKey);
    if (cached) {
      return cached;
    }

    const where = this.buildWhereClause(filters);
    const limit = Math.min(5000, Math.max(1, filters.limit || 1000));

    const sightings = await prisma.sighting.findMany({
      where,
      take: limit,
      orderBy: { observedAt: 'desc' },
      include: {
        species: {
          select: {
            id: true,
            commonName: true,
            scientificName: true,
            family: true,
            imageUrl: true,
          },
        },
        user: {
          select: {
            id: true,
            displayName: true,
            avatarUrl: true,
          },
        },
      },
    });

    const features: GeoJSONFeature[] = sightings.map((s) => ({
      type: 'Feature',
      id: s.id,
      geometry: {
        type: 'Point',
        // RFC 7946 Standard: [longitude, latitude]
        coordinates: [s.longitude, s.latitude],
      },
      properties: {
        id: s.id,
        speciesId: s.speciesId,
        speciesName: s.species?.commonName || 'Unknown Insect',
        commonName: s.species?.commonName || 'Unknown Insect',
        scientificName: s.species?.scientificName || null,
        family: s.species?.family || null,
        thumbnailUrl: s.thumbnailUrl || s.photoUrl,
        photoUrl: s.photoUrl,
        observedAt: s.observedAt.toISOString(),
        status: s.status,
        aiConfidence: s.aiConfidence,
        userId: s.userId,
        observerName: s.user?.displayName || 'WildBugs Explorer',
        latitude: s.latitude,
        longitude: s.longitude,
      },
    }));

    const result: GeoJSONFeatureCollection = {
      type: 'FeatureCollection',
      features,
      status: 'success',
      total: features.length,
    };

    if (
      filters.minLng !== undefined &&
      filters.minLat !== undefined &&
      filters.maxLng !== undefined &&
      filters.maxLat !== undefined
    ) {
      result.bbox = [filters.minLng, filters.minLat, filters.maxLng, filters.maxLat];
    }

    await cacheService.set(cacheKey, result, 300);

    return result;
  }

  /**
   * Aggregates raw geospatial coordinates into spatial grid cells of configurable degree size (~0.01 deg).
   * Generates clean [latitude, longitude, intensity] tuples for Leaflet-heat layer rendering.
   */
  public aggregateIntoGridCells(
    points: { latitude: number; longitude: number }[],
    gridSize = 0.01
  ): HeatmapPoint[] {
    if (!points || points.length === 0) {
      return [];
    }

    const safeGridSize = Math.max(0.001, gridSize || 0.01);
    const precisionMultiplier = 1 / safeGridSize;

    // Use a spatial bucket map to group counts
    const gridMap = new Map<string, { lat: number; lng: number; count: number }>();

    for (const point of points) {
      if (
        point.latitude === null ||
        point.latitude === undefined ||
        point.longitude === null ||
        point.longitude === undefined ||
        isNaN(point.latitude) ||
        isNaN(point.longitude)
      ) {
        continue;
      }

      // Snap coordinates to the center of the nearest grid cell
      const snappedLat =
        Math.round(point.latitude * precisionMultiplier) / precisionMultiplier;
      const snappedLng =
        Math.round(point.longitude * precisionMultiplier) / precisionMultiplier;

      // Clean floating-point precision artifacts (e.g., 28.610000000000003 -> 28.61)
      const cleanLat = Number(snappedLat.toFixed(5));
      const cleanLng = Number(snappedLng.toFixed(5));

      const cellKey = `${cleanLat}:${cleanLng}`;
      const existing = gridMap.get(cellKey);

      if (existing) {
        existing.count += 1;
      } else {
        gridMap.set(cellKey, {
          lat: cleanLat,
          lng: cleanLng,
          count: 1,
        });
      }
    }

    // Convert map to array of [lat, lng, intensity]
    return Array.from(gridMap.values()).map((cell) => [
      cell.lat,
      cell.lng,
      cell.count,
    ]);
  }

  /**
   * Retrieves density heatmap points within a bounding box or overall catalog (cached 300s).
   */
  public async getHeatmapData(filters: MapHeatmapFilter): Promise<HeatmapPoint[]> {
    const cacheKey = `map:heatmap:${JSON.stringify(filters)}`;
    const cached = await cacheService.get<HeatmapPoint[]>(cacheKey);
    if (cached) {
      return cached;
    }

    const where = this.buildWhereClause(filters);

    const sightings = await prisma.sighting.findMany({
      where,
      select: {
        latitude: true,
        longitude: true,
      },
      take: 10000,
    });

    const gridSize = filters.gridSize || 0.01;
    const points = this.aggregateIntoGridCells(sightings, gridSize);

    await cacheService.set(cacheKey, points, 300);

    return points;
  }
}

export const mapService = new MapService();
export default mapService;
