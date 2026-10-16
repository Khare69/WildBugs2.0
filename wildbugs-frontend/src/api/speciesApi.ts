import apiClient from './client';
import type {
  SpeciesListResponse,
  SpeciesDetailResponse,
  FamilyListResponse,
  SpeciesFilterParams,
  Species,
  FamilyOption,
} from '../types/species';

export const speciesApi = {
  /**
   * Fetches paginated species catalog with optional filtering.
   */
  getSpecies: async (params?: SpeciesFilterParams): Promise<SpeciesListResponse> => {
    const response = await apiClient.get<SpeciesListResponse>('/species', {
      params,
    });
    return response.data;
  },

  /**
   * Retrieves full profile information for a species by its ID.
   */
  getSpeciesById: async (id: number): Promise<Species> => {
    const response = await apiClient.get<SpeciesDetailResponse>(`/species/${id}`);
    return response.data.data;
  },

  /**
   * Retrieves list of taxonomic families present in the catalog.
   */
  getFamilies: async (): Promise<FamilyOption[]> => {
    const response = await apiClient.get<FamilyListResponse>('/species/families');
    return response.data.data;
  },
};

export default speciesApi;
