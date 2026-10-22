import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.markercluster';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import type { SightingGeoJSONFeature } from '../../types/map';
import { getMarkerBadgeColor, formatObservationDate } from '../../utils/mapUtils';

/**
 * Creates custom styled HTML string for Leaflet marker popups inside cluster layers.
 */
const createPopupHtml = (feature: SightingGeoJSONFeature): string => {
  const {
    id,
    commonName,
    scientificName,
    thumbnailUrl,
    photoUrl,
    observedAt,
    status,
    aiConfidence,
    observerName,
  } = feature.properties;

  const imageSrc = thumbnailUrl || photoUrl;
  const formattedDate = formatObservationDate(observedAt);
  const badgeColor = getMarkerBadgeColor(status);

  return `
    <div style="padding: 4px; color: #f8fafc; font-family: inherit;">
      ${
        imageSrc
          ? `<div style="width: 100%; height: 135px; border-radius: 8px; overflow: hidden; margin-bottom: 8px; background: #0f172a;">
              <img src="${imageSrc}" alt="${commonName}" style="width: 100%; height: 100%; object-fit: cover; display: block;" onerror="this.style.display='none'" />
            </div>`
          : ''
      }
      <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px;">
        <h4 style="margin: 0; font-size: 15px; font-weight: 700; color: #10b981; line-height: 1.3;">${commonName}</h4>
        <span style="font-size: 10px; padding: 2px 7px; border-radius: 12px; font-weight: 700; text-transform: uppercase; background: ${badgeColor}25; color: ${badgeColor}; border: 1px solid ${badgeColor}50;">
          ${status}
        </span>
      </div>
      ${scientificName ? `<p style="margin: 2px 0 6px; font-size: 12px; color: #94a3b8; font-style: italic;">${scientificName}</p>` : ''}
      <div style="display: flex; justify-content: space-between; font-size: 11px; color: #64748b; margin: 6px 0; padding-top: 6px; border-top: 1px solid rgba(255, 255, 255, 0.08);">
        <span>👤 ${observerName}</span>
        <span>📅 ${formattedDate}</span>
      </div>
      ${
        aiConfidence !== null && aiConfidence !== undefined
          ? `<div style="font-size: 11px; color: #a7f3d0; margin-bottom: 8px;">
              <span>✨ AI Match: <strong>${Math.round(aiConfidence * 100)}%</strong></span>
            </div>`
          : ''
      }
      <a href="/sightings/${id}" style="display: block; text-align: center; padding: 6px 12px; background: linear-gradient(135deg, #059669, #10b981); color: #ffffff; border-radius: 6px; font-size: 12px; font-weight: 600; text-decoration: none; box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3); margin-top: 4px;">
        Inspect Discovery →
      </a>
    </div>
  `;
};

const createInsectPinIcon = (status: string): L.DivIcon => {
  const badgeColor = getMarkerBadgeColor(status);

  return L.divIcon({
    className: 'wildbugs-map-marker-container',
    html: `
      <div style="
        position: relative;
        width: 38px;
        height: 38px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(15, 23, 42, 0.95);
        border: 2px solid ${badgeColor};
        border-radius: 50%;
        box-shadow: 0 4px 14px rgba(0, 0, 0, 0.5), 0 0 12px ${badgeColor}80;
        cursor: pointer;
        transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
      ">
        <span style="font-size: 20px; line-height: 1; user-select: none;">🪲</span>
        <span style="
          position: absolute;
          bottom: -2px;
          right: -2px;
          width: 11px;
          height: 11px;
          background: ${badgeColor};
          border: 2px solid #0f172a;
          border-radius: 50%;
        "></span>
      </div>
    `,
    iconSize: [38, 38],
    iconAnchor: [19, 19],
    popupAnchor: [0, -20],
  });
};

interface MarkerClusterProps {
  features: SightingGeoJSONFeature[];
}

export const MarkerCluster: React.FC<MarkerClusterProps> = ({ features }) => {
  const map = useMap();
  const navigate = useNavigate();
  const clusterGroupRef = useRef<L.MarkerClusterGroup | null>(null);

  // Event-delegated SPA routing for popup links inside Leaflet map container (SOL-06)
  useEffect(() => {
    const handlePopupClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest('a[href^="/sightings/"]');
      if (target) {
        e.preventDefault();
        const href = target.getAttribute('href');
        if (href) {
          navigate(href);
        }
      }
    };

    const container = map.getContainer();
    container.addEventListener('click', handlePopupClick);
    return () => {
      container.removeEventListener('click', handlePopupClick);
    };
  }, [map, navigate]);

  useEffect(() => {
    // Initialize cluster group with customized theme
    const clusterGroup = L.markerClusterGroup({
      chunkedLoading: true,
      maxClusterRadius: 45,
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
      iconCreateFunction: (cluster) => {
        const count = cluster.getChildCount();
        let sizeClass = 'wildbugs-cluster-sm';
        let glowColor = 'rgba(16, 185, 129, 0.4)';
        let borderColor = '#10b981';

        if (count > 50) {
          sizeClass = 'wildbugs-cluster-lg';
          glowColor = 'rgba(239, 68, 68, 0.4)';
          borderColor = '#ef4444';
        } else if (count > 15) {
          sizeClass = 'wildbugs-cluster-md';
          glowColor = 'rgba(245, 158, 11, 0.4)';
          borderColor = '#f59e0b';
        }

        return L.divIcon({
          html: `
            <div class="wildbugs-cluster-pill ${sizeClass}" style="
              width: 42px;
              height: 42px;
              display: flex;
              align-items: center;
              justify-content: center;
              background: rgba(15, 23, 42, 0.95);
              border: 2px solid ${borderColor};
              border-radius: 50%;
              color: #f8fafc;
              font-weight: 700;
              font-size: 13px;
              box-shadow: 0 4px 14px rgba(0, 0, 0, 0.5), 0 0 16px ${glowColor};
              transition: transform 0.2s ease;
            ">
              <span>${count}</span>
            </div>
          `,
          className: 'wildbugs-custom-cluster',
          iconSize: L.point(42, 42),
        });
      },
    });

    clusterGroupRef.current = clusterGroup;
    map.addLayer(clusterGroup);

    return () => {
      map.removeLayer(clusterGroup);
      clusterGroupRef.current = null;
    };
  }, [map]);

  // Synchronize observation pins inside the cluster group
  useEffect(() => {
    const clusterGroup = clusterGroupRef.current;
    if (!clusterGroup) return;

    clusterGroup.clearLayers();

    for (const feature of features) {
      const [lng, lat] = feature.geometry.coordinates;
      const marker = L.marker([lat, lng], {
        icon: createInsectPinIcon(feature.properties.status),
      });

      marker.bindPopup(createPopupHtml(feature), {
        className: 'wildbugs-sighting-popup',
        minWidth: 220,
        maxWidth: 280,
      });

      clusterGroup.addLayer(marker);
    }
  }, [features]);

  return null;
};

export default MarkerCluster;
