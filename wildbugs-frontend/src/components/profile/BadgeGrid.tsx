import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import usersApi from '../../api/usersApi';
import type { UserBadgeItem } from '../../types/user';
import {
  type BadgeFilter,
  calculateBadgeSummary,
  filterBadges,
  formatEarnedDate,
  getBadgeProgressHint,
} from './badgeUtils';

interface BadgeGridProps {
  userId: string;
}

export const BadgeGrid: React.FC<BadgeGridProps> = ({ userId }) => {
  const [filter, setFilter] = useState<BadgeFilter>('all');
  const [selectedBadge, setSelectedBadge] = useState<UserBadgeItem | null>(null);

  const {
    data: badges = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['userBadges', userId],
    queryFn: () => usersApi.getUserBadges(userId),
    enabled: Boolean(userId),
    staleTime: 60000,
  });

  const summary = useMemo(() => calculateBadgeSummary(badges), [badges]);
  const displayedBadges = useMemo(() => filterBadges(badges, filter), [badges, filter]);

  if (isLoading) {
    return (
      <section className="badge-grid-section glass-panel">
        <div className="badge-grid-header">
          <div className="badge-grid-title-row">
            <span className="badge-section-icon">🏅</span>
            <div>
              <h2 className="badge-section-title">Field Badges & Achievements</h2>
              <p className="badge-section-subtitle">Loading naturalist accolades...</p>
            </div>
          </div>
        </div>
        <div className="badge-grid-loading">
          <div className="spinner-medium">🪲</div>
          <p>Analyzing observation milestones...</p>
        </div>
      </section>
    );
  }

  if (isError) {
    return (
      <section className="badge-grid-section glass-panel">
        <div className="badge-grid-error">
          <span className="error-icon">⚠️</span>
          <h3>Unable to load badges</h3>
          <p>Could not retrieve achievement records from the server.</p>
          <button type="button" className="btn-secondary" onClick={() => refetch()}>
            ↻ Try Again
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="badge-grid-section glass-panel">
      {/* Header with Title and Global Progress */}
      <div className="badge-grid-header">
        <div className="badge-grid-title-row">
          <span className="badge-section-icon">🏅</span>
          <div>
            <h2 className="badge-section-title">Field Badges & Achievements</h2>
            <p className="badge-section-subtitle">
              Milestone accolades earned through field research, streak discipline, and species discovery.
            </p>
          </div>
        </div>

        {/* Achievement Progress Bar & Pill */}
        <div className="badge-summary-pill-box">
          <div className="badge-summary-metrics">
            <span className="badge-summary-count">
              <strong>{summary.earned}</strong> of {summary.total} Unlocked
            </span>
            <span className="badge-summary-percent">{summary.percentage}%</span>
          </div>
          <div className="badge-progress-track">
            <div
              className="badge-progress-fill"
              style={{ width: `${summary.percentage}%` }}
              role="progressbar"
              aria-valuenow={summary.percentage}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="badge-filter-bar">
        <button
          type="button"
          className={`badge-filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All Badges ({summary.total})
        </button>
        <button
          type="button"
          className={`badge-filter-btn ${filter === 'unlocked' ? 'active' : ''}`}
          onClick={() => setFilter('unlocked')}
        >
          🏆 Unlocked ({summary.earned})
        </button>
        <button
          type="button"
          className={`badge-filter-btn ${filter === 'locked' ? 'active' : ''}`}
          onClick={() => setFilter('locked')}
        >
          🔒 In Progress ({summary.locked})
        </button>
      </div>

      {/* Badges Cards Grid */}
      {displayedBadges.length === 0 ? (
        <div className="badge-grid-empty">
          <span className="empty-icon">{filter === 'locked' ? '🎉' : '🧭'}</span>
          <p>
            {filter === 'locked'
              ? 'Incredible! You have unlocked every single achievement badge!'
              : 'No badges match this category.'}
          </p>
        </div>
      ) : (
        <div className="badge-cards-grid">
          {displayedBadges.map((badge) => {
            const isEarned = badge.earned;
            const progressHint = getBadgeProgressHint(badge);

            return (
              <div
                key={badge.id}
                className={`badge-card ${isEarned ? 'badge-earned' : 'badge-locked'}`}
                onClick={() => setSelectedBadge(badge)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    setSelectedBadge(badge);
                  }
                }}
                title={badge.description}
              >
                {/* Medallion Icon */}
                <div className="badge-medallion-container">
                  <div className="badge-medallion">
                    <span className="badge-icon-symbol">{badge.iconUrl}</span>
                  </div>
                  {!isEarned && (
                    <span className="badge-lock-badge" title="Locked Achievement">
                      🔒
                    </span>
                  )}
                </div>

                {/* Content */}
                <div className="badge-card-info">
                  <h3 className="badge-name">{badge.name}</h3>
                  <p className="badge-description">{badge.description}</p>

                  {isEarned ? (
                    <div className="badge-earned-tag">
                      <span className="badge-check-icon">✓</span>
                      <span>Earned {formatEarnedDate(badge.earnedAt)}</span>
                    </div>
                  ) : (
                    <div className="badge-progress-box">
                      <div className="badge-progress-meta">
                        <span className="badge-progress-hint">{progressHint}</span>
                        <span className="badge-progress-percent">
                          {badge.progress.percentage}%
                        </span>
                      </div>
                      <div className="badge-mini-track">
                        <div
                          className="badge-mini-fill"
                          style={{ width: `${badge.progress.percentage}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail Modal */}
      {selectedBadge && (
        <div className="badge-modal-backdrop" onClick={() => setSelectedBadge(null)}>
          <div
            className="badge-modal-content glass-panel"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <button
              type="button"
              className="badge-modal-close"
              onClick={() => setSelectedBadge(null)}
              aria-label="Close modal"
            >
              ✕
            </button>

            <div className="badge-modal-medallion">
              <span className="badge-modal-icon">{selectedBadge.iconUrl}</span>
            </div>

            <h2 className="badge-modal-title">{selectedBadge.name}</h2>
            <p className="badge-modal-desc">{selectedBadge.description}</p>

            {selectedBadge.earned ? (
              <div className="badge-modal-status earned">
                <span className="modal-status-badge">🏆 Unlocked</span>
                <p className="modal-status-date">
                  Recorded in your naturalist permanent registry on{' '}
                  <strong>{formatEarnedDate(selectedBadge.earnedAt)}</strong>
                </p>
              </div>
            ) : (
              <div className="badge-modal-status locked">
                <span className="modal-status-badge">🔒 Locked</span>
                <p className="modal-status-progress">
                  Current Progress: {selectedBadge.progress.current} /{' '}
                  {selectedBadge.progress.max} ({selectedBadge.progress.percentage}%)
                </p>
                <div className="badge-modal-track">
                  <div
                    className="badge-modal-fill"
                    style={{ width: `${selectedBadge.progress.percentage}%` }}
                  />
                </div>
                <p className="modal-status-hint">
                  Requirement: {getBadgeProgressHint(selectedBadge)}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
};

export default BadgeGrid;
