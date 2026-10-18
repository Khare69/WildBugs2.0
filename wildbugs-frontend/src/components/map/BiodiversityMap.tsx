import React, { useEffect, useCallback } from 'react';
import { MapContainer, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import { useQuery } from '@tanstack/react-query';
import useMapStore from '../../store/mapStore';
import mapApi from '../../api/mapApi';
import SightingMarker from './SightingMarker';
import type { MapBounds } from '../../types/map';

interface MapEventsHandlerProps {
  onBoundsChange: (bounds: MapBounds) => void;
  onViewportChange: (center: [number, number], zoom: number) => void;
}

/**
 * Helper component listening for Leaflet map movements and bounds changes.
 */
const MapEventsHandler: React.FC<MapEventsHandlerProps> = ({
  onBoundsChange,
  onViewportChange,
}) => {
  const map = useMapEvents({
    moveend: () => {
      const center = map.getCenter();
      const zoom = map.getZoom();
      const bounds = map.getBounds();

      onViewportChange([center.lat, center.lng], zoom);
      onBoundsChange({
        minLat: bounds.getSouth(),
        maxLat: bounds.getNorth(),
        minLng: bounds.getWest(),
        maxLng: bounds.getEast(),
      });
    },
  });

  // Extract initial bounds when component mounts
  useEffect(() => {
    const b = map.getBounds();
    onBoundsChange({
      minLat: b.getSouth(),
      maxLat: b.getNorth(),
      minLng: b.getWest(),
      maxLng: b.getEast(),
    });
  }, [map, onBoundsChange]);

  return null;
};

/**
 * Quick Geolocation Button to pan to user's current GPS location.
 */
const LocateControl: React.FC = () => {
  const map = useMap();

  const handleLocate = useCallback(() => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        map.flyTo([pos.coords.latitude, pos.coords.longitude], 12, {
          duration: 1.5,
        });
      },
      (err) => {
        console.warn('[Map Geolocation Error]:', err.message);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, [map]);

  return (
    <div
      style={{
        position: 'absolute',
        bottom: '24px',
        right: '24px',
        zIndex: 1000,
      }}
    >
      <button
        type="button"
        onClick={handleLocate}
        title="Find My Location"
        style={{
          width: '44px',
          height: '44px',
          borderRadius: '50%',
          background: 'rgba(15, 23, 42, 0.9)',
          color: '#10b981',
          border: '1px solid rgba(16, 185, 129, 0.4)',
          boxShadow: '0 4px 14px rgba(0, 0, 0, 0.4)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '18px',
          transition: 'all 0.2s ease',
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.08)';
          (e.currentTarget as HTMLButtonElement).style.borderColor = '#10b981';
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)';
          (e.currentTarget as HTMLButtonElement).style.borderColor =
            'rgba(16, 185, 129, 0.4)';
        }}
      >
        🎯
      </button>
    </div>
  );
};

export const BiodiversityMap: React.FC = () => {
  const { viewport, bounds, filters, setViewport, setBounds } = useMapStore();

  const handleBoundsChange = useCallback(
    (newBounds: MapBounds) => {
      setBounds(newBounds);
    },
    [setBounds]
  );

  const handleViewportChange = useCallback(
    (center: [number, number], zoom: number) => {
      setViewport(center, zoom);
    },
    [setViewport]
  );

  // TanStack Query fetching GeoJSON sightings for visible bounds
  const {
    data: geoJsonData,
    isLoading,
    isFetching,
    error,
  } = useQuery({
    queryKey: [
      'mapSightings',
      bounds?.minLat,
      bounds?.maxLat,
      bounds?.minLng,
      bounds?.maxLng,
      filters.speciesId,
      filters.dateFrom,
      filters.dateTo,
    ],
    queryFn: () => mapApi.fetchSightingsGeoJSON(bounds, filters),
    enabled: !!bounds,
    staleTime: 30000,
  });

  const features = geoJsonData?.features || [];

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        minHeight: 'calc(100vh - 64px)',
        background: '#090d16',
      }}
    >
      {/* Map Status HUD Pill */}
      <div
        style={{
          position: 'absolute',
          top: '16px',
          left: '60px',
          zIndex: 1000,
          background: 'rgba(15, 23, 42, 0.85)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '24px',
          padding: '6px 14px',
          color: '#f8fafc',
          fontSize: '12px',
          fontWeight: 500,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
          pointerEvents: 'none',
        }}
      >
        <span
          style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: isFetching ? '#f59e0b' : '#10b981',
            boxShadow: `0 0 8px ${isFetching ? '#f59e0b' : '#10b981'}`,
          }}
        />
        <span>
          {isLoading
            ? 'Scanning region...'
            : `${features.length} insect sightings in view`}
        </span>
      </div>

      {/* Main Leaflet Map Container */}
      <MapContainer
        center={viewport.center}
        zoom={viewport.zoom}
        scrollWheelZoom={true}
        style={{ width: '100%', height: '100%', minHeight: 'calc(100vh - 64px)' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />

        <MapEventsHandler
          onBoundsChange={handleBoundsChange}
          onViewportChange={handleViewportChange}
        />

        {/* Render Observation Pins */}
        {features.map((feature) => (
          <SightingMarker key={feature.id} feature={feature} />
        ))}

        <LocateControl />
      </MapContainer>

      {/* Error Banner */}
      {error && (
        <div
          style={{
            position: 'absolute',
            bottom: '24px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 1000,
            background: 'rgba(239, 68, 68, 0.9)',
            color: '#ffffff',
            padding: '8px 16px',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: 500,
            boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
          }}
        >
          Failed to load map sightings. Retrying...
        </div>
      )}
    </div>
  );
};

export default BiodiversityMap;
