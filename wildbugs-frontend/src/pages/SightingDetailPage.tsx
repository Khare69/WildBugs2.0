import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { sightingsApi } from '../api/sightingsApi';
import IdentificationResult from '../components/sightings/IdentificationResult';

export const SightingDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [copiedCoords, setCopiedCoords] = useState(false);

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ['sighting-detail', id],
    queryFn: () => sightingsApi.getSightingById(id!),
    enabled: !!id,
    // Poll every 3 seconds while sighting status is PENDING (waiting for AI worker)
    refetchInterval: (query) => {
      const status = query.state.data?.data?.sighting?.status;
      return status === 'PENDING' ? 3000 : false;
    },
  });

  const sighting = data?.data?.sighting;

  const copyCoordinates = async () => {
    if (!sighting) return;
    try {
      await navigator.clipboard.writeText(`${sighting.latitude}, ${sighting.longitude}`);
      setCopiedCoords(true);
      setTimeout(() => setCopiedCoords(false), 2500);
    } catch {
      // Fallback
    }
  };

  if (isLoading) {
    return (
      <div className="sighting-loading-view">
        <div className="spinner-large" />
        <p className="loading-text">Loading sighting observation details...</p>
      </div>
    );
  }

  if (isError || !sighting) {
    return (
      <div className="sighting-error-card">
        <div className="error-icon">⚠️</div>
        <h2>Observation Not Found</h2>
        <p className="error-message">
          {(error as Error)?.message || 'We could not locate this observation in the WildBugs database.'}
        </p>
        <div className="error-actions">
          <button type="button" className="btn-secondary" onClick={() => navigate(-1)}>
            ⬅️ Go Back
          </button>
          <Link to="/species" className="btn-primary">
            Explore Species Catalog 🐞
          </Link>
        </div>
      </div>
    );
  }

  const osmUrl = `https://www.openstreetmap.org/?mlat=${sighting.latitude}&mlon=${sighting.longitude}#map=16/${sighting.latitude}/${sighting.longitude}`;

  return (
    <div className="sighting-detail-container">
      {/* Navigation Breadcrumb Bar */}
      <div className="sighting-breadcrumb-bar">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="btn-breadcrumb-back"
        >
          ← Back
        </button>
        <span className="breadcrumb-separator">/</span>
        <span className="breadcrumb-current">
          Observation {sighting.id.slice(0, 8)}...
        </span>
      </div>

      <div className="sighting-layout-grid">
        {/* Left Column: Observation Photo & Geolocation Pin */}
        <div className="sighting-media-col">
          <div className="sighting-hero-image-card">
            <img
              src={sighting.photoUrl}
              alt="Insect observation"
              className="sighting-hero-image"
              loading="eager"
            />
            <div className="hero-photo-meta">
              <span className="photo-time-tag">
                📅 {new Date(sighting.observedAt).toLocaleString(undefined, {
                  dateStyle: 'medium',
                  timeStyle: 'short',
                })}
              </span>
            </div>
          </div>

          {/* Observer Card */}
          <div className="observer-info-card">
            <div className="observer-avatar">
              {sighting.user?.displayName ? sighting.user.displayName.charAt(0).toUpperCase() : '👤'}
            </div>
            <div className="observer-text">
              <span className="observer-label">Observed by</span>
              <strong className="observer-name">{sighting.user?.displayName || 'Naturalist Observer'}</strong>
              <span className="observer-date">
                Logged on {new Date(sighting.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>

          {/* Mini Geospatial Pin Card */}
          <div className="geospatial-pin-card">
            <div className="pin-header">
              <span className="pin-title">📍 Spatial Geolocation</span>
              <button
                type="button"
                className="btn-copy-coords"
                onClick={copyCoordinates}
                title="Copy coordinates to clipboard"
              >
                {copiedCoords ? '✓ Copied' : '📋 Copy'}
              </button>
            </div>

            <div className="pin-coordinates">
              <span className="coord-val">
                {sighting.latitude.toFixed(6)}°N, {sighting.longitude.toFixed(6)}°E
              </span>
            </div>

            <div className="pin-actions">
              <a
                href={osmUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-link-osm"
              >
                🗺️ View on OpenStreetMap ↗
              </a>
            </div>
          </div>
        </div>

        {/* Right Column: AI Identification & Species Spotlight */}
        <div className="sighting-identification-col">
          <IdentificationResult
            sighting={sighting}
            onRefresh={() => void refetch()}
            isRefreshing={isFetching}
          />

          {/* Full Species Ecological Dossier (if identified) */}
          {sighting.species && (
            <div className="species-ecological-dossier">
              <h3 className="dossier-heading">🌿 Ecological Profile</h3>
              
              <div className="dossier-grid">
                <div className="dossier-item">
                  <span className="dossier-label">Habitat</span>
                  <p className="dossier-val">{sighting.species.habitat}</p>
                </div>

                <div className="dossier-item">
                  <span className="dossier-label">Diet</span>
                  <p className="dossier-val">{sighting.species.diet}</p>
                </div>

                <div className="dossier-item">
                  <span className="dossier-label">Lifecycle & Seasonality</span>
                  <p className="dossier-val">{sighting.species.lifecycle}</p>
                </div>

                <div className="dossier-item">
                  <span className="dossier-label">Conservation Status</span>
                  <span className={`status-badge status-${sighting.species.conservationStatus.toLowerCase().replace(/\s+/g, '-')}`}>
                    {sighting.species.conservationStatus}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SightingDetailPage;
