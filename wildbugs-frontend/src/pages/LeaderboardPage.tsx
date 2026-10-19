import React from 'react';
import { Link } from 'react-router-dom';
import LeaderboardTable from '../components/leaderboard/LeaderboardTable';

export const LeaderboardPage: React.FC = () => {
  return (
    <div className="leaderboard-page-container">
      {/* Hero Header */}
      <header className="leaderboard-hero glass-panel">
        <div className="leaderboard-hero-content">
          <div className="leaderboard-hero-tag">
            <span className="trophy-tag-icon">🏆</span>
            <span>Citizen Science Hall of Fame</span>
          </div>
          <h1 className="leaderboard-title">Community Biodiversity Leaderboards</h1>
          <p className="leaderboard-desc">
            Recognizing the observers, naturalists, and expert verifiers who document, classify,
            and monitor regional arthropod biodiversity.
          </p>
        </div>

        {/* Global Community Statistics Banner */}
        <div className="leaderboard-stat-ribbon">
          <div className="ribbon-metric">
            <span className="ribbon-icon">🌍</span>
            <div className="ribbon-text">
              <strong>Open Science</strong>
              <span>Global Registry</span>
            </div>
          </div>
          <div className="ribbon-metric">
            <span className="ribbon-icon">⚡</span>
            <div className="ribbon-text">
              <strong>Redis Powered</strong>
              <span>15m Smart TTL</span>
            </div>
          </div>
          <div className="ribbon-metric">
            <span className="ribbon-icon">🎯</span>
            <div className="ribbon-text">
              <strong>AI & Expert</strong>
              <span>Dual Validation</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Tabbed Rankings Table & Podium */}
      <main className="leaderboard-main-content">
        <LeaderboardTable initialMetric="sightings" />
      </main>

      {/* Call to Action Card */}
      <section className="leaderboard-cta-banner glass-panel">
        <div className="cta-banner-content">
          <span className="cta-icon">📸</span>
          <div className="cta-text">
            <h3>Ready to climb the leaderboard?</h3>
            <p>
              Take a walk outdoors, photograph an insect or spider, and upload your observation to start earning points and streaks.
            </p>
          </div>
        </div>
        <Link to="/upload" className="btn-primary cta-btn">
          <span>Log an Observation</span>
          <span>→</span>
        </Link>
      </section>
    </div>
  );
};

export default LeaderboardPage;
