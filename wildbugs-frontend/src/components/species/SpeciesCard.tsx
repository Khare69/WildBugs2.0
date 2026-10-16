import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import type { Species } from '../../types/species';

interface SpeciesCardProps {
  species: Species;
}

export const SpeciesCard: React.FC<SpeciesCardProps> = ({ species }) => {
  const [imgError, setImgError] = useState(false);

  // Status color mapper
  const getStatusBadgeClass = (status: string) => {
    const s = status.toLowerCase();
    if (s.includes('endangered')) return 'badge-status-danger';
    if (s.includes('threatened') || s.includes('vulnerable')) return 'badge-status-warning';
    return 'badge-status-success';
  };

  return (
    <article className="species-card">
      <div className="species-card-image-wrap">
        {!imgError && species.imageUrl ? (
          <img
            src={species.imageUrl}
            alt={species.commonName}
            className="species-card-image"
            onError={() => setImgError(true)}
            loading="lazy"
          />
        ) : (
          <div className="species-card-placeholder">
            <span className="placeholder-icon">🐞</span>
            <span className="placeholder-label">{species.family}</span>
          </div>
        )}
        <span className={`species-status-badge ${getStatusBadgeClass(species.conservationStatus)}`}>
          {species.conservationStatus}
        </span>
      </div>

      <div className="species-card-body">
        <div className="species-card-meta">
          <span className="species-family-tag">{species.family}</span>
        </div>

        <h3 className="species-card-title">
          <Link to={`/species/${species.id}`} className="species-card-link">
            {species.commonName}
          </Link>
        </h3>
        <p className="species-card-scientific">{species.scientificName}</p>

        <p className="species-card-snippet">
          {species.description.length > 120
            ? `${species.description.substring(0, 120)}...`
            : species.description}
        </p>

        <div className="species-card-footer">
          <div className="species-habitat-hint">
            <span className="icon">🌿</span>
            <span className="text">{species.habitat.split('.')[0]}</span>
          </div>
          <Link to={`/species/${species.id}`} className="btn-view-profile">
            Details →
          </Link>
        </div>
      </div>
    </article>
  );
};

export default SpeciesCard;
