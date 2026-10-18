import { apiClient } from './client';
import type {
  SightingGeoJSONFeatureCollection,
  MapBounds,
  MapFilters,
  HeatmapResponse,
} from '../types/map';

export const mapApi = {
  /**
   * Fetches insect sightings within visible map bounds as a GeoJSON FeatureCollection.
   */
  async fetchSightingsGeoJSON(
    bounds?: MapBounds | null,
    filters?: Partial<MapFilters>,
    limit = 1000
  ): Promise<SightingGeoJSONFeatureCollection> {
    const params: Record<string, string | number> = {
      limit,
    };

    if (bounds) {
      params.minLat = bounds.minLat;
      params.maxLat = bounds.maxLat;
      params.minLng = bounds.minLng;
      params.maxLng = bounds.maxLng;
    }

    if (filters?.speciesId) {
      params.speciesId = filters.speciesId;
    }

    if (filters?.dateFrom) {
      params.dateFrom = filters.dateFrom;
    }

    if (filters?.dateTo) {
      params.dateTo = filters.dateTo;
    }

    const response = await apiClient.get<SightingGeoJSONFeatureCollection>('/map/sightings', {
      params,
    });

    return response.data;
  },

  /**
   * Fetches aggregated density points [latitude, longitude, intensity] for heatmap rendering.
   */
  async fetchHeatmapData(
    bounds?: MapBounds | null,
    filters?: Partial<MapFilters>,
    gridSize = 0.01
  ): Promise<[number, number, number][]> {
    const params: Record<string, string | number> = {
      gridSize,
    };

    if (bounds) {
      params.minLat = bounds.minLat;
      params.maxLat = bounds.maxLat;
      params.minLng = bounds.minLng;
      params.maxLng = bounds.maxLng;
    }

    if (filters?.speciesId) {
      params.speciesId = filters.speciesId;
    }

    if (filters?.dateFrom) {
      params.dateFrom = filters.dateFrom;
    }

    if (filters?.dateTo) {
      params.dateTo = filters.dateTo;
    }

    const response = await apiClient.get<HeatmapResponse>('/map/heatmap', {
      params,
    });

    return response.data.data || response.data.points || [];
  },
};

export default mapApi;
