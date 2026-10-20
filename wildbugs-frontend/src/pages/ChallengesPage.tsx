import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../hooks/useAuth';
import challengesApi from '../api/challengesApi';
import ChallengeCard from '../components/challenges/ChallengeCard';
import {
  type ChallengeFilter,
  filterChallenges,
  calculateChallengeMetrics,
} from '../components/challenges/challengeUtils';

export const ChallengesPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [filter, setFilter] = useState<ChallengeFilter>('all');

  const {
    data: challenges = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['challenges'],
    queryFn: () => challengesApi.getChallenges(),
    staleTime: 30000,
  });

  const metrics = useMemo(() => calculateChallengeMetrics(challenges), [challenges]);
  const displayedChallenges = useMemo(
    () => filterChallenges(challenges, filter),
    [challenges, filter]
  );

  return (
    <div className="challenges-page-container">
      {/* Hero Header */}
      <section className="challenges-hero-section glass-panel">
        <div className="challenges-hero-content">
          <div className="challenges-hero-badge">
            <span className="badge-sparkle">🌸</span>
            <span>Community BioBlitzes & Seasonal Field Quests</span>
          </div>
          <h1 className="challenges-hero-title">Seasonal BioBlitz Challenges</h1>
          <p className="challenges-hero-subtitle">
            Join synchronized biodiversity quests with fellow naturalists around the world.
            Catalogue focal insect orders, maintain observation streaks, and unlock permanent field honours.
          </p>

          {/* Metrics Ribbon */}
          <div className="challenges-metrics-ribbon">
            <div className="challenge-metric-card">
              <span className="metric-number">{metrics.total}</span>
              <span className="metric-label">Total Challenges</span>
            </div>
            <div className="challenge-metric-card">
              <span className="metric-number highlight-active">{metrics.activeCount}</span>
              <span className="metric-label">Active BioBlitzes</span>
            </div>
            {isAuthenticated && (
              <>
                <div className="challenge-metric-card">
                  <span className="metric-number highlight-joined">{metrics.joinedCount}</span>
                  <span className="metric-label">Your Active Quests</span>
                </div>
                <div className="challenge-metric-card">
                  <span className="metric-number highlight-completed">{metrics.completedCount}</span>
                  <span className="metric-label">Completed</span>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Filter Tabs */}
      <div className="challenges-filter-bar">
        <button
          type="button"
          className={`challenge-tab-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All Quests ({metrics.total})
        </button>
        <button
          type="button"
          className={`challenge-tab-btn ${filter === 'active' ? 'active' : ''}`}
          onClick={() => setFilter('active')}
        >
          🟢 Active ({metrics.activeCount})
        </button>
        {isAuthenticated && (
          <>
            <button
              type="button"
              className={`challenge-tab-btn ${filter === 'joined' ? 'active' : ''}`}
              onClick={() => setFilter('joined')}
            >
              🚀 Joined ({metrics.joinedCount})
            </button>
            <button
              type="button"
              className={`challenge-tab-btn ${filter === 'completed' ? 'active' : ''}`}
              onClick={() => setFilter('completed')}
            >
              🏆 Completed ({metrics.completedCount})
            </button>
          </>
        )}
      </div>

      {/* Content State Handling */}
      {isLoading ? (
        <div className="challenges-loading-state glass-panel">
          <div className="spinner-large">🌸</div>
          <h3>Scanning seasonal bioblitz registry...</h3>
          <p>Retrieving active community expeditions and observation milestones.</p>
        </div>
      ) : isError ? (
        <div className="challenges-error-state glass-panel">
          <span className="error-icon">⚠️</span>
          <h3>Failed to load seasonal challenges</h3>
          <p>We encountered an issue synchronizing challenge data with the platform registry.</p>
          <button type="button" className="btn-primary" onClick={() => refetch()}>
            ↻ Try Again
          </button>
        </div>
      ) : displayedChallenges.length === 0 ? (
        <div className="challenges-empty-state glass-panel">
          <span className="empty-icon">🧭</span>
          <h3>No challenges match this filter</h3>
          <p>
            {filter === 'joined'
              ? 'You have not joined any quests in this category yet. Explore the active tab to participate!'
              : filter === 'completed'
              ? 'No completed challenges yet. Keep observing to reach your milestones!'
              : 'There are currently no challenges in this section.'}
          </p>
          <button type="button" className="btn-secondary" onClick={() => setFilter('all')}>
            View All Quests
          </button>
        </div>
      ) : (
        <div className="challenges-grid">
          {displayedChallenges.map((challenge) => (
            <ChallengeCard
              key={challenge.id}
              challenge={challenge}
              isAuthenticated={isAuthenticated}
            />
          ))}
        </div>
      )}

      {/* Call to Action Banner */}
      <section className="challenges-cta-banner glass-panel">
        <div className="challenges-cta-text">
          <h2>Ready to Make an Observation?</h2>
          <p>
            Every sighting you submit with high-resolution photography and GPS coordinates
            automatically counts toward all your active bioblitz challenges!
          </p>
        </div>
        <Link to="/upload" className="btn-primary btn-cta">
          📸 Record Sighting
        </Link>
      </section>
    </div>
  );
};

export default ChallengesPage;
