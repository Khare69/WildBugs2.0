import React, { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.heat';

interface HeatmapLayerProps {
  points: [number, number, number][]; // [latitude, longitude, intensity]
  radius?: number;
  blur?: number;
  maxZoom?: number;
}

export const HeatmapLayer: React.FC<HeatmapLayerProps> = ({
  points,
  radius = 28,
  blur = 16,
  maxZoom = 16,
}) => {
  const map = useMap();
  const heatLayerRef = useRef<L.Layer | null>(null);

  useEffect(() => {
    if (!points || points.length === 0) {
      if (heatLayerRef.current) {
        map.removeLayer(heatLayerRef.current);
        heatLayerRef.current = null;
      }
      return;
    }

    // Remove existing layer before rendering new coordinates
    if (heatLayerRef.current) {
      map.removeLayer(heatLayerRef.current);
      heatLayerRef.current = null;
    }

    // Leaflet heat plugin extends L with heatLayer
    const heatLayerFactory = (L as unknown as { heatLayer: (pts: [number, number, number][], opts: unknown) => L.Layer }).heatLayer;

    if (typeof heatLayerFactory === 'function') {
      const layer = heatLayerFactory(points, {
        radius,
        blur,
        maxZoom,
        minOpacity: 0.35,
        gradient: {
          0.2: '#06b6d4', // Cyan (low density)
          0.45: '#10b981', // Emerald (medium density)
          0.7: '#f59e0b', // Amber (high density)
          1.0: '#ef4444', // Red (hotspot)
        },
      });

      layer.addTo(map);
      heatLayerRef.current = layer;
    }

    return () => {
      if (heatLayerRef.current) {
        map.removeLayer(heatLayerRef.current);
        heatLayerRef.current = null;
      }
    };
  }, [map, points, radius, blur, maxZoom]);

  return null;
};

export default HeatmapLayer;
