import React from 'react';
import type { UserStats } from '../../types/user';

interface StatsOverviewProps {
  stats: UserStats;
  isLoading?: boolean;
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({ stats, isLoading }) => {
  const cards = [
    {
      id: 'sightings',
      label: 'Field Sightings',
      value: isLoading ? '...' : stats.totalSightings.toLocaleString(),
      subtext: 'Observations recorded',
      icon: '🔭',
      accent: 'var(--emerald-400)',
      bgGlow: 'rgba(52, 211, 153, 0.08)',
    },
    {
      id: 'species',
      label: 'Species Found',
      value: isLoading ? '...' : stats.uniqueSpecies.toLocaleString(),
      subtext: 'Unique taxa cataloged',
      icon: '🐞',
      accent: '#38bdf8',
      bgGlow: 'rgba(56, 189, 248, 0.08)',
    },
    {
      id: 'verified',
      label: 'Verified Records',
      value: isLoading ? '...' : stats.verifiedCount.toLocaleString(),
      subtext: 'Expert validated',
      icon: '🛡️',
      accent: '#10b981',
      bgGlow: 'rgba(16, 185, 129, 0.08)',
    },
    {
      id: 'accuracy',
      label: 'Accuracy Rate',
      value: isLoading ? '...' : `${stats.accuracyRate}%`,
      subtext: 'Verification precision',
      icon: '🎯',
      accent: '#a855f7',
      bgGlow: 'rgba(168, 85, 247, 0.08)',
    },
    {
      id: 'streak',
      label: 'Current Streak',
      value: isLoading
        ? '...'
        : `${stats.currentStreak} ${stats.currentStreak === 1 ? 'day' : 'days'}`,
      subtext: 'Consecutive observing',
      icon: '🔥',
      accent: '#f97316',
      bgGlow: 'rgba(249, 115, 22, 0.08)',
    },
    {
      id: 'longestStreak',
      label: 'Personal Best',
      value: isLoading
        ? '...'
        : `${stats.longestStreak} ${stats.longestStreak === 1 ? 'day' : 'days'}`,
      subtext: 'All-time longest run',
      icon: '🏆',
      accent: '#eab308',
      bgGlow: 'rgba(234, 179, 8, 0.08)',
    },
  ];

  return (
    <section className="stats-overview-section" aria-label="Observer Discovery Statistics">
      <div className="stats-cards-grid">
        {cards.map((card) => (
          <div
            key={card.id}
            className="stat-metric-card glass-panel"
            style={{ '--card-accent': card.accent, '--card-glow': card.bgGlow } as React.CSSProperties}
          >
            <div className="stat-card-top">
              <span className="stat-card-icon" role="img" aria-label={card.label}>
                {card.icon}
              </span>
              <span className="stat-card-badge" style={{ color: card.accent }}>
                Active
              </span>
            </div>
            <div className="stat-card-content">
              <div className="stat-card-value" style={{ color: card.accent }}>
                {card.value}
              </div>
              <div className="stat-card-label">{card.label}</div>
              <div className="stat-card-subtext">{card.subtext}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default StatsOverview;
