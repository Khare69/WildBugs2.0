import type { Species } from './species';

export type SightingStatus = 'PENDING' | 'IDENTIFIED' | 'VERIFIED' | 'REJECTED' | 'UNIDENTIFIED';

export type IdentificationSource = 'AI' | 'USER' | 'EXPERT';

export interface SightingIdentification {
  id: string;
  sightingId: string;
  userId: string;
  speciesId: number;
  source: IdentificationSource;
  confidence: number;
  isAccepted: boolean;
  createdAt: string;
  species?: Species;
  user?: {
    id: string;
    displayName: string;
    avatarUrl?: string | null;
    role?: string;
  };
}

export interface Sighting {
  id: string;
  userId: string;
  speciesId: number | null;
  photoUrl: string;
  thumbnailUrl: string | null;
  latitude: number;
  longitude: number;
  aiConfidence: number | null;
  status: SightingStatus;
  observedAt: string;
  createdAt: string;
  user?: {
    id: string;
    displayName: string;
    avatarUrl?: string | null;
  };
  species?: Species | null;
  identifications?: SightingIdentification[];
}

export interface CreateSightingRequest {
  photo: File | Blob;
  latitude: number;
  longitude: number;
  speciesId?: number;
  observedAt?: string;
  notes?: string;
}

export interface SightingDetailResponse {
  status: string;
  data: {
    sighting: Sighting;
  };
}

export interface SightingListResponse {
  status: string;
  data: {
    sightings: Sighting[];
    total?: number;
    page?: number;
    limit?: number;
    totalPages?: number;
  };
}
