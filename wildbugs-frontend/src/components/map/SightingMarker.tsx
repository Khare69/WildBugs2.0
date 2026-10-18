import React, { useMemo } from 'react';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Link } from 'react-router-dom';
import type { SightingGeoJSONFeature } from '../../types/map';
import { getMarkerBadgeColor, formatObservationDate } from '../../utils/mapUtils';

const createInsectDivIcon = (status: string): L.DivIcon => {
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

interface SightingMarkerProps {
  feature: SightingGeoJSONFeature;
}

export const SightingMarker: React.FC<SightingMarkerProps> = ({ feature }) => {
  const [lng, lat] = feature.geometry.coordinates;
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

  const icon = useMemo(() => createInsectDivIcon(status), [status]);
  const formattedDate = useMemo(() => formatObservationDate(observedAt), [observedAt]);
  const imageSrc = thumbnailUrl || photoUrl;

  return (
    <Marker position={[lat, lng]} icon={icon}>
      <Popup className="wildbugs-sighting-popup" minWidth={220} maxWidth={280}>
        <div style={{ padding: '4px', color: '#f8fafc', fontFamily: 'inherit' }}>
          {/* Sighting Photo Preview */}
          {imageSrc && (
            <div
              style={{
                width: '100%',
                height: '140px',
                borderRadius: '8px',
                overflow: 'hidden',
                marginBottom: '10px',
                background: '#0f172a',
              }}
            >
              <img
                src={imageSrc}
                alt={commonName}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block',
                }}
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
          )}

          {/* Sighting Identification Details */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
            <h4
              style={{
                margin: 0,
                fontSize: '15px',
                fontWeight: 600,
                color: '#10b981',
                lineHeight: 1.3,
              }}
            >
              {commonName}
            </h4>
            <span
              style={{
                fontSize: '10px',
                padding: '2px 6px',
                borderRadius: '12px',
                textTransform: 'uppercase',
                fontWeight: 700,
                background:
                  status === 'VERIFIED'
                    ? 'rgba(16, 185, 129, 0.2)'
                    : status === 'IDENTIFIED'
                    ? 'rgba(6, 182, 212, 0.2)'
                    : 'rgba(245, 158, 11, 0.2)',
                color:
                  status === 'VERIFIED'
                    ? '#34d399'
                    : status === 'IDENTIFIED'
                    ? '#22d3ee'
                    : '#fbbf24',
              }}
            >
              {status}
            </span>
          </div>

          {scientificName && (
            <p
              style={{
                margin: '2px 0 6px 0',
                fontSize: '12px',
                color: '#94a3b8',
                fontStyle: 'italic',
              }}
            >
              {scientificName}
            </p>
          )}

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '11px',
              color: '#64748b',
              margin: '6px 0 10px 0',
              paddingTop: '6px',
              borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            <span>👤 {observerName}</span>
            <span>📅 {formattedDate}</span>
          </div>

          {aiConfidence !== null && aiConfidence !== undefined && (
            <div
              style={{
                fontSize: '11px',
                color: '#a7f3d0',
                marginBottom: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <span>✨ AI Match:</span>
              <strong>{Math.round(aiConfidence * 100)}%</strong>
            </div>
          )}

          {/* Action Link to Full Observation Detail */}
          <Link
            to={`/sightings/${id}`}
            style={{
              display: 'block',
              textAlign: 'center',
              padding: '6px 12px',
              background: 'linear-gradient(135deg, #059669, #10b981)',
              color: '#ffffff',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: 600,
              textDecoration: 'none',
              marginTop: '4px',
              boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)',
            }}
          >
            Inspect Discovery →
          </Link>
        </div>
      </Popup>
    </Marker>
  );
};

export default SightingMarker;
