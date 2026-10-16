export interface Species {
  id: number;
  commonName: string;
  scientificName: string;
  family: string;
  description: string;
  habitat: string;
  diet: string;
  lifecycle: string;
  imageUrl: string;
  conservationStatus: string;
  createdAt: string;
  _count?: {
    sightings: number;
    identifications: number;
  };
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface SpeciesListResponse {
  status: string;
  data: Species[];
  meta: PaginationMeta;
}

export interface SpeciesDetailResponse {
  status: string;
  data: Species;
}

export interface FamilyOption {
  family: string;
  count: number;
}

export interface FamilyListResponse {
  status: string;
  data: FamilyOption[];
}

export interface SpeciesFilterParams {
  search?: string;
  family?: string;
  conservationStatus?: string;
  page?: number;
  limit?: number;
}
