export interface GeoJSONPointGeometry {
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
  status: 'PENDING' | 'IDENTIFIED' | 'VERIFIED' | 'REJECTED';
  aiConfidence: number | null;
  userId: string;
  observerName: string;
  latitude: number;
  longitude: number;
}

export interface SightingGeoJSONFeature {
  type: 'Feature';
  id: string;
  geometry: GeoJSONPointGeometry;
  properties: SightingFeatureProperties;
}

export interface SightingGeoJSONFeatureCollection {
  type: 'FeatureCollection';
  features: SightingGeoJSONFeature[];
  bbox?: [number, number, number, number];
  status?: string;
  total?: number;
}

export interface MapBounds {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
}

export interface MapFilters {
  speciesId?: number;
  dateFrom?: string;
  dateTo?: string;
  viewMode: 'markers' | 'heatmap';
}

export interface HeatmapResponse {
  status: string;
  data: [number, number, number][]; // [latitude, longitude, intensity]
  points?: [number, number, number][];
  count: number;
}
