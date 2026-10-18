import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { MapBounds, MapFilters } from '../types/map';

export interface MapViewport {
  center: [number, number]; // [lat, lng]
  zoom: number;
}

export interface MapState {
  viewport: MapViewport;
  bounds: MapBounds | null;
  filters: MapFilters;
  selectedSightingId: string | null;

  setViewport: (center: [number, number], zoom: number) => void;
  setBounds: (bounds: MapBounds | null) => void;
  setFilters: (newFilters: Partial<MapFilters>) => void;
  resetFilters: () => void;
  setViewMode: (mode: 'markers' | 'heatmap') => void;
  setSelectedSightingId: (id: string | null) => void;
}

const DEFAULT_VIEWPORT: MapViewport = {
  center: [28.6139, 77.2090], // Default center (Northern India / New Delhi region)
  zoom: 6,
};

const DEFAULT_FILTERS: MapFilters = {
  speciesId: undefined,
  dateFrom: undefined,
  dateTo: undefined,
  viewMode: 'markers',
};

export const useMapStore = create<MapState>()(
  persist(
    (set) => ({
      viewport: DEFAULT_VIEWPORT,
      bounds: null,
      filters: DEFAULT_FILTERS,
      selectedSightingId: null,

      setViewport: (center, zoom) =>
        set({
          viewport: { center, zoom },
        }),

      setBounds: (bounds) => set({ bounds }),

      setFilters: (newFilters) =>
        set((state) => ({
          filters: { ...state.filters, ...newFilters },
        })),

      resetFilters: () =>
        set({
          filters: DEFAULT_FILTERS,
        }),

      setViewMode: (mode) =>
        set((state) => ({
          filters: { ...state.filters, viewMode: mode },
        })),

      setSelectedSightingId: (selectedSightingId) => set({ selectedSightingId }),
    }),
    {
      name: 'wildbugs_map_state',
      partialize: (state) => ({
        viewport: state.viewport,
        filters: state.filters,
      }),
    }
  )
);

export default useMapStore;
