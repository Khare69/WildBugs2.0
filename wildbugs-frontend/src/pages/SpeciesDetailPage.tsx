import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import speciesApi from '../api/speciesApi';

export const SpeciesDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const speciesId = id ? parseInt(id, 10) : NaN;
  const [imgError, setImgError] = useState(false);

  const {
    data: species,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['speciesDetail', speciesId],
    queryFn: () => speciesApi.getSpeciesById(speciesId),
    enabled: !isNaN(speciesId),
  });

  const getStatusBadgeClass = (status: string) => {
    const s = status.toLowerCase();
    if (s.includes('endangered')) return 'badge-status-danger';
    if (s.includes('threatened') || s.includes('vulnerable')) return 'badge-status-warning';
    return 'badge-status-success';
  };

  if (isNaN(speciesId)) {
    return (
      <div className="state-panel error-panel">
        <div className="state-icon">⚠️</div>
        <h3>Invalid Species ID</h3>
        <p>The requested species identifier is invalid.</p>
        <Link to="/species" className="btn-primary">
          Back to Catalog
        </Link>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="detail-loading-container">
        <div className="skeleton-line short" />
        <div className="skeleton-detail-hero" />
        <div className="skeleton-grid">
          <div className="skeleton-card" />
          <div className="skeleton-card" />
        </div>
      </div>
    );
  }

  if (isError || !species) {
    return (
      <div className="state-panel error-panel">
        <div className="state-icon">⚠️</div>
        <h3>Species Profile Not Found</h3>
        <p>{error instanceof Error ? error.message : 'Could not retrieve species details.'}</p>
        <div className="button-group">
          <button type="button" className="btn-retry" onClick={() => refetch()}>
            Retry
          </button>
          <Link to="/species" className="btn-secondary">
            Back to Catalog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="species-detail-page">
      <nav className="breadcrumb-nav">
        <Link to="/" className="breadcrumb-link">
          Home
        </Link>
        <span className="breadcrumb-sep">/</span>
        <Link to="/species" className="breadcrumb-link">
          Species Catalog
        </Link>
        <span className="breadcrumb-sep">/</span>
        <span className="breadcrumb-current">{species.commonName}</span>
      </nav>

      <section className="species-hero-card">
        <div className="species-hero-media">
          {!imgError && species.imageUrl ? (
            <img
              src={species.imageUrl}
              alt={species.commonName}
              className="species-hero-image"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="species-hero-placeholder">
              <span className="placeholder-hero-icon">🐞</span>
              <span>{species.family}</span>
            </div>
          )}
        </div>

        <div className="species-hero-info">
          <div className="species-header-badges">
            <span className="species-family-tag">{species.family}</span>
            <span className={`species-status-badge ${getStatusBadgeClass(species.conservationStatus)}`}>
              {species.conservationStatus}
            </span>
          </div>

          <h1 className="species-hero-title">{species.commonName}</h1>
          <p className="species-hero-scientific">{species.scientificName}</p>

          <p className="species-hero-desc">{species.description}</p>

          <div className="species-quick-stats">
            <div className="quick-stat-box">
              <span className="stat-label">Catalog ID</span>
              <span className="stat-value">#{species.id}</span>
            </div>
            <div className="quick-stat-box">
              <span className="stat-label">Recorded Sightings</span>
              <span className="stat-value">{species._count?.sightings ?? 0}</span>
            </div>
            <div className="quick-stat-box">
              <span className="stat-label">Identifications</span>
              <span className="stat-value">{species._count?.identifications ?? 0}</span>
            </div>
          </div>
        </div>
      </section>

      <section className="species-traits-grid">
        <div className="trait-card">
          <div className="trait-card-header">
            <span className="trait-icon">🌿</span>
            <h2>Habitat & Ecosystem</h2>
          </div>
          <p className="trait-card-body">{species.habitat}</p>
        </div>

        <div className="trait-card">
          <div className="trait-card-header">
            <span className="trait-icon">🍽️</span>
            <h2>Diet & Foraging</h2>
          </div>
          <p className="trait-card-body">{species.diet}</p>
        </div>

        <div className="trait-card">
          <div className="trait-card-header">
            <span className="trait-icon">🔄</span>
            <h2>Life Cycle & Metamorphosis</h2>
          </div>
          <p className="trait-card-body">{species.lifecycle}</p>
        </div>

        <div className="trait-card action-card">
          <div className="trait-card-header">
            <span className="trait-icon">📸</span>
            <h2>Spotted this insect?</h2>
          </div>
          <p className="trait-card-body">
            Upload your observation photo with geolocation coordinates to contribute to the regional
            biodiversity map.
          </p>
          <Link to="/" className="btn-primary btn-full-width">
            Log Observation
          </Link>
        </div>
      </section>
    </div>
  );
};

export default SpeciesDetailPage;
