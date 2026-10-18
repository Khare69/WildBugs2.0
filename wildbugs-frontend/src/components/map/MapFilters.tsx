import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import useMapStore from '../../store/mapStore';
import speciesApi from '../../api/speciesApi';
import { calculateDatePresetRange } from '../../utils/mapUtils';

export const MapFilters: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { filters, setFilters, resetFilters, setViewMode } = useMapStore();

  // Fetch species catalog for filter dropdown
  const { data: speciesData } = useQuery({
    queryKey: ['speciesCatalogMini'],
    queryFn: () => speciesApi.getSpecies({ limit: 100 }),
    staleTime: 5 * 60 * 1000,
  });

  const speciesList = speciesData?.data || [];

  const activeFiltersCount =
    (filters.speciesId ? 1 : 0) +
    (filters.dateFrom ? 1 : 0) +
    (filters.dateTo ? 1 : 0);

  const handleSpeciesChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setFilters({ speciesId: val ? parseInt(val, 10) : undefined });
  };

  const handleDateFromChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ dateFrom: e.target.value || undefined });
  };

  const handleDateToChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ dateTo: e.target.value || undefined });
  };

  const handleApplyPreset = (days: number) => {
    const range = calculateDatePresetRange(days);
    setFilters(range);
  };

  return (
    <aside
      aria-label="Map Visualizations and Filters"
      style={{
        position: 'absolute',
        top: '16px',
        right: '16px',
        zIndex: 1000,
        maxWidth: '340px',
        width: isOpen ? '340px' : 'auto',
      }}
    >
      {/* Toggle Drawer Trigger Button */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(15, 23, 42, 0.92)',
            backdropFilter: 'blur(12px)',
            color: '#f8fafc',
            border: '1px solid rgba(16, 185, 129, 0.4)',
            padding: '10px 16px',
            borderRadius: '24px',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.4)',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: 600,
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.borderColor = '#10b981';
            (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(16, 185, 129, 0.4)';
            (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)';
          }}
        >
          <span>⚙️ Layers & Filters</span>
          {activeFiltersCount > 0 && (
            <span
              style={{
                background: '#10b981',
                color: '#0f172a',
                fontSize: '11px',
                fontWeight: 800,
                padding: '2px 7px',
                borderRadius: '10px',
              }}
            >
              {activeFiltersCount}
            </span>
          )}
        </button>
      )}

      {/* Expanded Filter Panel */}
      {isOpen && (
        <div
          style={{
            background: 'rgba(15, 23, 42, 0.96)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '16px',
            padding: '18px',
            boxShadow: '0 12px 36px rgba(0, 0, 0, 0.6)',
            color: '#f8fafc',
            maxHeight: 'calc(100vh - 120px)',
            overflowY: 'auto',
          }}
        >
          {/* Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '16px',
              paddingBottom: '10px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '18px' }}>🗺️</span>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#f8fafc' }}>
                Map Layers & Filters
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              style={{
                background: 'none',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                fontSize: '16px',
                padding: '4px',
              }}
              title="Close Panel"
            >
              ✕
            </button>
          </div>

          {/* Layer Mode Toggle (Markers vs Heatmap) */}
          <div style={{ marginBottom: '18px' }}>
            <label
              style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: 600,
                color: '#94a3b8',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                marginBottom: '8px',
              }}
            >
              Visualization Mode
            </label>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '6px',
                background: 'rgba(0, 0, 0, 0.3)',
                padding: '4px',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.06)',
              }}
            >
              <button
                type="button"
                onClick={() => setViewMode('markers')}
                style={{
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: 'none',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  background:
                    filters.viewMode === 'markers'
                      ? 'linear-gradient(135deg, #059669, #10b981)'
                      : 'transparent',
                  color: filters.viewMode === 'markers' ? '#ffffff' : '#94a3b8',
                }}
              >
                📍 Pins / Cluster
              </button>
              <button
                type="button"
                onClick={() => setViewMode('heatmap')}
                style={{
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: 'none',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  background:
                    filters.viewMode === 'heatmap'
                      ? 'linear-gradient(135deg, #d97706, #f59e0b)'
                      : 'transparent',
                  color: filters.viewMode === 'heatmap' ? '#ffffff' : '#94a3b8',
                }}
              >
                🔥 Heatmap
              </button>
            </div>
          </div>

          {/* Species Selector Filter */}
          <div style={{ marginBottom: '18px' }}>
            <label
              htmlFor="map-species-select"
              style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: 600,
                color: '#94a3b8',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                marginBottom: '8px',
              }}
            >
              Filter By Species
            </label>
            <select
              id="map-species-select"
              value={filters.speciesId || ''}
              onChange={handleSpeciesChange}
              style={{
                width: '100%',
                padding: '8px 12px',
                background: 'rgba(30, 41, 59, 0.8)',
                color: '#f8fafc',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '8px',
                fontSize: '13px',
                outline: 'none',
              }}
            >
              <option value="">All Insect Species</option>
              {speciesList.map((sp) => (
                <option key={sp.id} value={sp.id}>
                  {sp.commonName} ({sp.scientificName})
                </option>
              ))}
            </select>
          </div>

          {/* Date Range Filters */}
          <div style={{ marginBottom: '18px' }}>
            <label
              style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: 600,
                color: '#94a3b8',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                marginBottom: '8px',
              }}
            >
              Observation Date Range
            </label>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
              <div>
                <span style={{ fontSize: '10px', color: '#64748b', display: 'block', marginBottom: '2px' }}>
                  From
                </span>
                <input
                  type="date"
                  value={filters.dateFrom || ''}
                  onChange={handleDateFromChange}
                  style={{
                    width: '100%',
                    padding: '6px 8px',
                    background: 'rgba(30, 41, 59, 0.8)',
                    color: '#f8fafc',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: '6px',
                    fontSize: '12px',
                    outline: 'none',
                  }}
                />
              </div>
              <div>
                <span style={{ fontSize: '10px', color: '#64748b', display: 'block', marginBottom: '2px' }}>
                  To
                </span>
                <input
                  type="date"
                  value={filters.dateTo || ''}
                  onChange={handleDateToChange}
                  style={{
                    width: '100%',
                    padding: '6px 8px',
                    background: 'rgba(30, 41, 59, 0.8)',
                    color: '#f8fafc',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: '6px',
                    fontSize: '12px',
                    outline: 'none',
                  }}
                />
              </div>
            </div>

            {/* Quick Date Presets */}
            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                type="button"
                onClick={() => handleApplyPreset(30)}
                style={{
                  fontSize: '11px',
                  padding: '3px 8px',
                  borderRadius: '4px',
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#94a3b8',
                  cursor: 'pointer',
                }}
              >
                Past 30 Days
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset(365)}
                style={{
                  fontSize: '11px',
                  padding: '3px 8px',
                  borderRadius: '4px',
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#94a3b8',
                  cursor: 'pointer',
                }}
              >
                Past Year
              </button>
            </div>
          </div>

          {/* Reset Filters Action */}
          {activeFiltersCount > 0 && (
            <button
              type="button"
              onClick={resetFilters}
              style={{
                width: '100%',
                padding: '8px 12px',
                background: 'rgba(239, 68, 68, 0.15)',
                color: '#f87171',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              Clear All Filters ({activeFiltersCount})
            </button>
          )}
        </div>
      )}
    </aside>
  );
};

export default MapFilters;
