import { apiClient } from './client';
import type {
  CreateSightingRequest,
  SightingDetailResponse,
  SightingListResponse,
} from '../types/sighting';

export const sightingsApi = {
  /**
   * Upload an insect photo and record coordinates.
   */
  async createSighting(
    payload: CreateSightingRequest,
    onUploadProgress?: (progressEvent: { loaded: number; total?: number }) => void
  ): Promise<SightingDetailResponse> {
    const formData = new FormData();
    formData.append('photo', payload.photo);
    formData.append('latitude', payload.latitude.toString());
    formData.append('longitude', payload.longitude.toString());

    if (payload.speciesId !== undefined && payload.speciesId !== null) {
      formData.append('speciesId', payload.speciesId.toString());
    }

    if (payload.observedAt) {
      formData.append('observedAt', payload.observedAt);
    }

    const response = await apiClient.post<SightingDetailResponse>('/sightings', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress,
    });

    return response.data;
  },

  /**
   * Retrieve details for a single sighting including identifications.
   */
  async getSightingById(id: string): Promise<SightingDetailResponse> {
    const response = await apiClient.get<SightingDetailResponse>(`/sightings/${id}`);
    return response.data;
  },

  /**
   * Retrieve current user's observations.
   */
  async getMySightings(page = 1, limit = 20): Promise<SightingListResponse> {
    const response = await apiClient.get<SightingListResponse>('/sightings/me', {
      params: { page, limit },
    });
    return response.data;
  },

  /**
   * Retrieve recent public sightings.
   */
  async getRecentSightings(limit = 10): Promise<SightingListResponse> {
    const response = await apiClient.get<SightingListResponse>('/sightings', {
      params: { limit },
    });
    return response.data;
  },

  /**
   * Verify an observation as an expert or administrator.
   */
  async verifySighting(
    id: string,
    payload?: { speciesId?: number; notes?: string }
  ): Promise<SightingDetailResponse> {
    const response = await apiClient.put<SightingDetailResponse>(
      `/sightings/${id}/verify`,
      payload
    );
    return response.data;
  },

  /**
   * Reject an observation as an expert or administrator.
   */
  async rejectSighting(
    id: string,
    payload?: { reason?: string }
  ): Promise<SightingDetailResponse> {
    const response = await apiClient.put<SightingDetailResponse>(
      `/sightings/${id}/reject`,
      payload
    );
    return response.data;
  },
};

export default sightingsApi;
