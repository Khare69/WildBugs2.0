import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import usersApi from '../../api/usersApi';
import type { LeaderboardMetric, LeaderboardEntry } from '../../types/user';

interface LeaderboardTableProps {
  initialMetric?: LeaderboardMetric;
}

export const LeaderboardTable: React.FC<LeaderboardTableProps> = ({
  initialMetric = 'sightings',
}) => {
  const [metric, setMetric] = useState<LeaderboardMetric>(initialMetric);
  const [limit, setLimit] = useState<number>(10);

  const {
    data: leaderboardData,
    isLoading,
    isError,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ['leaderboard', metric, limit],
    queryFn: () => usersApi.getLeaderboard(metric, limit),
    staleTime: 60000,
  });

  const rankings: LeaderboardEntry[] = leaderboardData?.rankings || [];
  const isCached = leaderboardData?.cached ?? false;

  const getMetricLabel = (m: LeaderboardMetric) => {
    switch (m) {
      case 'sightings':
        return 'Field Sightings';
      case 'species':
        return 'Species Cataloged';
      case 'verified':
        return 'Verified Records';
    }
  };

  const getMetricUnit = (m: LeaderboardMetric) => {
    switch (m) {
      case 'sightings':
        return 'Sightings';
      case 'species':
        return 'Species';
      case 'verified':
        return 'Verified';
    }
  };

  const getMedalOrRank = (rank: number) => {
    switch (rank) {
      case 1:
        return <span className="leaderboard-medal gold-medal" title="1st Place (Gold)">🥇</span>;
      case 2:
        return <span className="leaderboard-medal silver-medal" title="2nd Place (Silver)">🥈</span>;
      case 3:
        return <span className="leaderboard-medal bronze-medal" title="3rd Place (Bronze)">🥉</span>;
      default:
        return <span className="leaderboard-rank-number">#{rank}</span>;
    }
  };

  // Top 3 Podium observers
  const top1 = rankings[0];
  const top2 = rankings[1];
  const top3 = rankings[2];

  return (
    <div className="leaderboard-wrapper">
      {/* Metric Selector Tabs */}
      <div className="leaderboard-controls-bar glass-panel">
        <div className="leaderboard-tabs-group" role="tablist" aria-label="Leaderboard metrics">
          <button
            type="button"
            role="tab"
            aria-selected={metric === 'sightings'}
            className={`leaderboard-tab-btn ${metric === 'sightings' ? 'active' : ''}`}
            onClick={() => setMetric('sightings')}
          >
            <span className="tab-icon">🔭</span>
            <span className="tab-label">Most Sightings</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={metric === 'species'}
            className={`leaderboard-tab-btn ${metric === 'species' ? 'active' : ''}`}
            onClick={() => setMetric('species')}
          >
            <span className="tab-icon">🐞</span>
            <span className="tab-label">Most Species</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={metric === 'verified'}
            className={`leaderboard-tab-btn ${metric === 'verified' ? 'active' : ''}`}
            onClick={() => setMetric('verified')}
          >
            <span className="tab-icon">🛡️</span>
            <span className="tab-label">Top Verifiers</span>
          </button>
        </div>

        {/* Limit & Cache Controls */}
        <div className="leaderboard-actions-right">
          <div className="leaderboard-limit-select">
            <span className="limit-label">Show:</span>
            {[10, 25, 50].map((count) => (
              <button
                key={count}
                type="button"
                className={`btn-limit-chip ${limit === count ? 'active' : ''}`}
                onClick={() => setLimit(count)}
              >
                Top {count}
              </button>
            ))}
          </div>

          <div className="leaderboard-cache-badge" title="Redis Cache Status (15 min TTL)">
            <span className={`cache-dot ${isCached ? 'cached' : 'live'}`} />
            <span className="cache-text">
              {isCached ? 'Redis Cached (15m)' : 'Live DB Sync'}
            </span>
            <button
              type="button"
              className="btn-refresh-cache"
              onClick={() => refetch()}
              disabled={isFetching}
              title="Force refresh rankings"
            >
              <span className={`refresh-spin ${isFetching ? 'spinning' : ''}`}>↻</span>
            </button>
          </div>
        </div>
      </div>

      {/* Top 3 Visual Podium Showcase (Rendered when we have >= 3 rankings) */}
      {!isLoading && rankings.length >= 3 && (
        <section className="leaderboard-podium-section" aria-label="Top 3 Observers Podium">
          {/* 2nd Place */}
          {top2 && (
            <div className="podium-col podium-silver glass-panel">
              <div className="podium-badge-icon">🥈</div>
              <div className="podium-avatar-wrapper">
                <span className="podium-avatar-circle">
                  {top2.displayName.charAt(0).toUpperCase()}
                </span>
                <span className="podium-rank-pill">#2</span>
              </div>
              <Link to={`/users/${top2.userId}`} className="podium-user-name">
                {top2.displayName}
              </Link>
              {top2.role && <span className="podium-role-tag">{top2.role}</span>}
              <div className="podium-score-pill">
                <span className="score-num">{top2.score.toLocaleString()}</span>
                <span className="score-unit">{getMetricUnit(metric)}</span>
              </div>
            </div>
          )}

          {/* 1st Place (Champion) */}
          {top1 && (
            <div className="podium-col podium-gold glass-panel">
              <div className="podium-crown-icon">👑</div>
              <div className="podium-badge-icon">🥇</div>
              <div className="podium-avatar-wrapper champion">
                <span className="podium-avatar-circle gold">
                  {top1.displayName.charAt(0).toUpperCase()}
                </span>
                <span className="podium-rank-pill gold">#1</span>
              </div>
              <Link to={`/users/${top1.userId}`} className="podium-user-name champion">
                {top1.displayName}
              </Link>
              {top1.role && <span className="podium-role-tag">{top1.role}</span>}
              <div className="podium-score-pill gold">
                <span className="score-num">{top1.score.toLocaleString()}</span>
                <span className="score-unit">{getMetricUnit(metric)}</span>
              </div>
            </div>
          )}

          {/* 3rd Place */}
          {top3 && (
            <div className="podium-col podium-bronze glass-panel">
              <div className="podium-badge-icon">🥉</div>
              <div className="podium-avatar-wrapper">
                <span className="podium-avatar-circle bronze">
                  {top3.displayName.charAt(0).toUpperCase()}
                </span>
                <span className="podium-rank-pill bronze">#3</span>
              </div>
              <Link to={`/users/${top3.userId}`} className="podium-user-name">
                {top3.displayName}
              </Link>
              {top3.role && <span className="podium-role-tag">{top3.role}</span>}
              <div className="podium-score-pill">
                <span className="score-num">{top3.score.toLocaleString()}</span>
                <span className="score-unit">{getMetricUnit(metric)}</span>
              </div>
            </div>
          )}
        </section>
      )}

      {/* Main Leaderboard Table */}
      <section className="leaderboard-table-container glass-panel" aria-label="Observer Rankings Table">
        <div className="table-header-row">
          <div className="table-header-title">
            <h3>{getMetricLabel(metric)} Rankings</h3>
            <span className="table-subtitle">Top {limit} community naturalists</span>
          </div>
        </div>

        {/* Loading Skeleton */}
        {isLoading && (
          <div className="leaderboard-skeleton-list">
            {[1, 2, 3, 4, 5].map((n) => (
              <div key={n} className="leaderboard-skeleton-row">
                <div className="skeleton-rank" />
                <div className="skeleton-avatar" />
                <div className="skeleton-name" />
                <div className="skeleton-score" />
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {isError && (
          <div className="leaderboard-error-state">
            <span className="error-icon">⚠️</span>
            <h4>Could not load leaderboard rankings</h4>
            <p>An error occurred while connecting to the biodiversity ranking service.</p>
            <button type="button" className="btn-primary" onClick={() => refetch()}>
              ↻ Retry Connection
            </button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !isError && rankings.length === 0 && (
          <div className="leaderboard-empty-state">
            <span className="empty-icon">🌱</span>
            <h4>No observation records for this metric yet</h4>
            <p>Be the very first naturalist to log sightings and claim the #1 spot on the leaderboard!</p>
            <Link to="/upload" className="btn-primary">
              📸 Log Observation
            </Link>
          </div>
        )}

        {/* Ranked Naturalists Table */}
        {!isLoading && !isError && rankings.length > 0 && (
          <div className="leaderboard-table-wrapper">
            <table className="leaderboard-table">
              <thead>
                <tr>
                  <th className="th-rank">Rank</th>
                  <th className="th-naturalist">Observer</th>
                  <th className="th-role">Role</th>
                  <th className="th-score">{getMetricLabel(metric)}</th>
                  <th className="th-action">Profile</th>
                </tr>
              </thead>
              <tbody>
                {rankings.map((entry) => {
                  const initial = entry.displayName.charAt(0).toUpperCase();
                  const isTop3 = entry.rank <= 3;

                  return (
                    <tr
                      key={entry.userId}
                      className={`leaderboard-row ${isTop3 ? `top-${entry.rank}-row` : ''}`}
                    >
                      <td className="td-rank">
                        <div className="rank-cell-content">
                          {getMedalOrRank(entry.rank)}
                        </div>
                      </td>

                      <td className="td-naturalist">
                        <Link to={`/users/${entry.userId}`} className="observer-info-link">
                          <div className={`observer-avatar ${entry.rank === 1 ? 'gold-border' : ''}`}>
                            {entry.avatarUrl ? (
                              <img src={entry.avatarUrl} alt={entry.displayName} />
                            ) : (
                              <span>{initial}</span>
                            )}
                          </div>
                          <span className="observer-name">{entry.displayName}</span>
                        </Link>
                      </td>

                      <td className="td-role">
                        <span className="leaderboard-role-chip">
                          {entry.role || 'USER'}
                        </span>
                      </td>

                      <td className="td-score">
                        <div className="score-badge-cell">
                          <strong className="score-digits">{entry.score.toLocaleString()}</strong>
                          <span className="score-unit-subtext">{getMetricUnit(metric)}</span>
                        </div>
                      </td>

                      <td className="td-action">
                        <Link
                          to={`/users/${entry.userId}`}
                          className="btn-view-observer"
                          title={`View ${entry.displayName}'s field journal`}
                        >
                          <span>Journal</span>
                          <span className="arrow-icon">→</span>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};

export default LeaderboardTable;
