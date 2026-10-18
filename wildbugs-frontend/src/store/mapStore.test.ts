import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { useMapStore } from './mapStore.ts';

describe('Map Store Unit Tests', () => {
  beforeEach(() => {
    useMapStore.setState({
      viewport: { center: [28.6139, 77.2090], zoom: 6 },
      bounds: null,
      filters: {
        speciesId: undefined,
        dateFrom: undefined,
        dateTo: undefined,
        viewMode: 'markers',
      },
      selectedSightingId: null,
    });
  });

  it('initializes with default viewport center and zoom', () => {
    const state = useMapStore.getState();
    assert.deepEqual(state.viewport.center, [28.6139, 77.2090]);
    assert.equal(state.viewport.zoom, 6);
    assert.equal(state.filters.viewMode, 'markers');
  });

  it('updates viewport coordinates and zoom level', () => {
    useMapStore.getState().setViewport([19.0760, 72.8777], 11);
    const state = useMapStore.getState();
    assert.deepEqual(state.viewport.center, [19.0760, 72.8777]);
    assert.equal(state.viewport.zoom, 11);
  });

  it('updates bounding box coordinates', () => {
    const testBounds = {
      minLat: 18.9,
      maxLat: 19.3,
      minLng: 72.7,
      maxLng: 73.1,
    };
    useMapStore.getState().setBounds(testBounds);
    const state = useMapStore.getState();
    assert.deepEqual(state.bounds, testBounds);
  });

  it('updates and merges filter parameters', () => {
    useMapStore.getState().setFilters({ speciesId: 14, dateFrom: '2026-05-01' });
    let state = useMapStore.getState();
    assert.equal(state.filters.speciesId, 14);
    assert.equal(state.filters.dateFrom, '2026-05-01');

    useMapStore.getState().setFilters({ dateTo: '2026-06-01' });
    state = useMapStore.getState();
    assert.equal(state.filters.speciesId, 14);
    assert.equal(state.filters.dateTo, '2026-06-01');
  });

  it('toggles view mode between markers and heatmap', () => {
    useMapStore.getState().setViewMode('heatmap');
    assert.equal(useMapStore.getState().filters.viewMode, 'heatmap');

    useMapStore.getState().setViewMode('markers');
    assert.equal(useMapStore.getState().filters.viewMode, 'markers');
  });

  it('resets filters back to default values', () => {
    useMapStore.getState().setFilters({ speciesId: 99, dateFrom: '2026-01-01', viewMode: 'heatmap' });
    useMapStore.getState().resetFilters();

    const state = useMapStore.getState();
    assert.equal(state.filters.speciesId, undefined);
    assert.equal(state.filters.dateFrom, undefined);
    assert.equal(state.filters.viewMode, 'markers');
  });

  it('tracks selected sighting ID', () => {
    useMapStore.getState().setSelectedSightingId('sighting-uuid-999');
    assert.equal(useMapStore.getState().selectedSightingId, 'sighting-uuid-999');

    useMapStore.getState().setSelectedSightingId(null);
    assert.equal(useMapStore.getState().selectedSightingId, null);
  });
});
