import React from 'react';
import { Link } from 'react-router-dom';
import { useInfiniteQuery } from '@tanstack/react-query';
import usersApi from '../../api/usersApi';
import type { JournalSighting } from '../../types/user';

interface FieldJournalProps {
  userId: string;
  isOwnProfile?: boolean;
}

export const FieldJournal: React.FC<FieldJournalProps> = ({ userId, isOwnProfile = false }) => {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    refetch,
  } = useInfiniteQuery({
    queryKey: ['fieldJournal', userId],
    queryFn: ({ pageParam = 1 }) => usersApi.getFieldJournal(userId, pageParam, 6),
    getNextPageParam: (lastPage) => {
      return lastPage.pagination.hasMore ? lastPage.pagination.page + 1 : undefined;
    },
    initialPageParam: 1,
  });

  const allSightings: JournalSighting[] =
    data?.pages.flatMap((page) => page.sightings) || [];
  const totalCount = data?.pages[0]?.pagination.total ?? 0;

  const getStatusBadge = (status: JournalSighting['status']) => {
    switch (status) {
      case 'VERIFIED':
        return <span className="journal-status-badge status-verified">🛡️ Verified</span>;
      case 'IDENTIFIED':
        return <span className="journal-status-badge status-identified">🔍 Identified</span>;
      case 'REJECTED':
        return <span className="journal-status-badge status-rejected">✕ Rejected</span>;
      default:
        return <span className="journal-status-badge status-pending">⏳ Pending Review</span>;
    }
  };

  const formatDate = (isoStr: string) => {
    const d = new Date(isoStr);
    if (isNaN(d.getTime())) return 'Recently observed';
    return d.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <section className="field-journal-section" aria-label="Field Journal Timeline">
      <div className="journal-header-bar">
        <div className="journal-header-left">
          <div className="journal-title-wrapper">
            <span className="journal-book-icon">📖</span>
            <h2 className="journal-heading">Field Observation Journal</h2>
            <span className="journal-count-pill">{totalCount} {totalCount === 1 ? 'Record' : 'Records'}</span>
          </div>
          <p className="journal-subtitle">
            Chronological field observations logged with GPS geolocations, photographs, and taxonomic classifications.
          </p>
        </div>

        {isOwnProfile && (
          <Link to="/upload" className="btn-primary journal-cta-btn">
            <span>📸</span>
            <span>Record New Observation</span>
          </Link>
        )}
      </div>

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="journal-loading-grid">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="journal-skeleton-card glass-panel">
              <div className="skeleton-image" />
              <div className="skeleton-content">
                <div className="skeleton-line line-short" />
                <div className="skeleton-line line-long" />
                <div className="skeleton-line line-medium" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error State */}
      {isError && (
        <div className="journal-error-state glass-panel">
          <span className="error-icon">⚠️</span>
          <h3>Could not load field journal</h3>
          <p>An error occurred while fetching observation records from the biodiversity registry.</p>
          <button type="button" className="btn-primary" onClick={() => refetch()}>
            ↻ Try Again
          </button>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !isError && allSightings.length === 0 && (
        <div className="journal-empty-state glass-panel">
          <div className="empty-icon-circle">
            <span>🌿</span>
          </div>
          <h3 className="empty-state-title">No field observations recorded yet</h3>
          <p className="empty-state-desc">
            {isOwnProfile
              ? 'Your field journal is empty. Take your camera into the field, spot an insect or spider, and upload your first observation to start contributing to biodiversity data.'
              : 'This observer has not published any sightings to their field journal yet.'}
          </p>
          {isOwnProfile && (
            <Link to="/upload" className="btn-primary empty-state-btn">
              <span>📸</span>
              <span>Record First Observation</span>
            </Link>
          )}
        </div>
      )}

      {/* Sightings Timeline List */}
      {!isLoading && allSightings.length > 0 && (
        <div className="journal-timeline-grid">
          {allSightings.map((sighting) => {
            const speciesName = sighting.species?.commonName || 'Unidentified Arthropod';
            const scientificName = sighting.species?.scientificName || 'Insecta incertae sedis';
            const familyName = sighting.species?.family;
            const photoSrc = sighting.thumbnailUrl || sighting.photoUrl;

            return (
              <article key={sighting.id} className="journal-entry-card glass-panel">
                <div className="journal-card-media">
                  <img
                    src={photoSrc}
                    alt={speciesName}
                    loading="lazy"
                    className="journal-card-img"
                    onError={(e) => {
                      // Fallback for broken media
                      (e.currentTarget as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=600&q=80';
                    }}
                  />
                  <div className="journal-card-media-overlay">
                    {getStatusBadge(sighting.status)}
                    {sighting.aiConfidence && (
                      <span className="journal-confidence-chip">
                        AI {Math.round(sighting.aiConfidence * 100)}%
                      </span>
                    )}
                  </div>
                </div>

                <div className="journal-card-body">
                  <div className="journal-species-header">
                    {sighting.species?.id ? (
                      <Link
                        to={`/species/${sighting.species.id}`}
                        className="journal-species-title-link"
                      >
                        <h3 className="journal-species-title">{speciesName}</h3>
                      </Link>
                    ) : (
                      <h3 className="journal-species-title">{speciesName}</h3>
                    )}
                    <span className="journal-species-scientific">{scientificName}</span>
                  </div>

                  <div className="journal-meta-chips-row">
                    {familyName && (
                      <span className="journal-chip family-chip">
                        🏷️ {familyName}
                      </span>
                    )}
                    <span className="journal-chip date-chip">
                      📅 {formatDate(sighting.observedAt)}
                    </span>
                    <span className="journal-chip coord-chip">
                      📍 {sighting.latitude.toFixed(3)}, {sighting.longitude.toFixed(3)}
                    </span>
                  </div>

                  {sighting.identifications && sighting.identifications.length > 0 && (
                    <div className="journal-ident-preview">
                      <span className="ident-preview-label">Taxa Suggestions:</span>
                      <div className="ident-chips-list">
                        {sighting.identifications.map((ident) => (
                          <span
                            key={ident.id}
                            className={`ident-micro-chip ${ident.isAccepted ? 'accepted' : ''}`}
                          >
                            {ident.source === 'AI' ? '🤖' : '👤'} {ident.species.commonName}
                            {ident.isAccepted && ' ✓'}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="journal-card-footer">
                    <Link
                      to={`/sightings/${sighting.id}`}
                      className="btn-journal-details"
                    >
                      <span>Explore Observation</span>
                      <span className="arrow-icon">→</span>
                    </Link>
                    <Link
                      to={`/map?lat=${sighting.latitude}&lng=${sighting.longitude}&zoom=14`}
                      className="btn-journal-map-pin"
                      title="Locate on Biodiversity Map"
                    >
                      🗺️ Map
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Infinite Scroll / Load More Action */}
      {hasNextPage && (
        <div className="journal-load-more-bar">
          <button
            type="button"
            className="btn-load-more glass-panel"
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
          >
            {isFetchingNextPage ? (
              <>
                <span className="spinner-icon">↻</span>
                <span>Retrieving observations...</span>
              </>
            ) : (
              <>
                <span>Load More Field Observations</span>
                <span className="arrow-down-icon">↓</span>
              </>
            )}
          </button>
        </div>
      )}
    </section>
  );
};

export default FieldJournal;
