import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../api/client';
import { useAuth } from '../hooks/useAuth';

export const HomePage: React.FC = () => {
  const { isAuthenticated, user } = useAuth();

  const { data: healthData, isSuccess } = useQuery({
    queryKey: ['healthCheck'],
    queryFn: async () => {
      const res = await apiClient.get<{ status: string; service: string }>('/health');
      return res.data;
    },
    refetchInterval: 60000,
  });

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="badge-status">
            <span className="status-dot" />
            <span>WildBugs 2.0 Live Platform</span>
          </div>

          <h1 className="hero-title">
            Discover, Identify & Protect <br />
            <span className="text-gradient">Regional Insect Wildlife</span>
          </h1>

          <p className="hero-description">
            Join a thriving network of nature observers, citizen scientists, and entomologists.
            Catalog arthropod sightings, map ecological micro-habitats, and contribute to vital biodiversity conservation.
          </p>

          <div className="hero-actions">
            <Link to="/species" className="btn-primary hero-btn">
              Explore Species Catalog →
            </Link>
            {!isAuthenticated ? (
              <Link to="/register" className="btn-secondary hero-btn">
                Create Observer Account
              </Link>
            ) : (
              <span className="hero-user-welcome">
                Welcome back, <strong>{user?.displayName}</strong>! 🌿
              </span>
            )}
          </div>
        </div>

        <div className="hero-visual-card">
          <div className="visual-card-inner glass-panel">
            <div className="visual-header">
              <span className="icon">🐞</span>
              <div>
                <h4>Arthropod Monitoring Engine</h4>
                <p>PostgreSQL 16 + Prisma v6 + Express + React 19</p>
              </div>
            </div>

            <div className="system-health-banner">
              <span className="label">API Gateway Status:</span>
              <span className={`status-pill ${isSuccess ? 'online' : 'checking'}`}>
                {isSuccess ? `ONLINE (${healthData?.service})` : 'CHECKING...'}
              </span>
            </div>

            <div className="hero-stats-grid">
              <div className="hero-stat-card">
                <span className="stat-number">30</span>
                <span className="stat-name">Cataloged Species</span>
              </div>
              <div className="hero-stat-card">
                <span className="stat-number">6</span>
                <span className="stat-name">Taxonomic Orders</span>
              </div>
              <div className="hero-stat-card">
                <span className="stat-number">&lt;2s</span>
                <span className="stat-name">Target Query Latency</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Platform Pillars */}
      <section className="pillars-section">
        <div className="section-header">
          <h2 className="section-title">Built for Citizen Science & Field Research</h2>
          <p className="section-subtitle">
            An end-to-end ecosystem combining mobile-first observations with rigorous biological taxonomy.
          </p>
        </div>

        <div className="pillars-grid">
          <div className="pillar-card glass-panel">
            <div className="pillar-icon">📸</div>
            <h3 className="pillar-title">Computer Vision Identification</h3>
            <p className="pillar-text">
              High-accuracy insect classification pipeline. Upload field photos to receive top candidate
              predictions with confidence scoring.
            </p>
          </div>

          <div className="pillar-card glass-panel">
            <div className="pillar-icon">🗺️</div>
            <h3 className="pillar-title">PostGIS Biodiversity Map</h3>
            <p className="pillar-text">
              Spatial heatmaps, coordinate snapping for location privacy, and multi-filter geospatial
              clustering across habitats and seasons.
            </p>
          </div>

          <div className="pillar-card glass-panel">
            <div className="pillar-icon">🏅</div>
            <h3 className="pillar-title">Field Journal & Gamification</h3>
            <p className="pillar-text">
              Earn achievement badges, maintain observation streaks, participate in time-boxed community
              challenges, and track your species life list.
            </p>
          </div>

          <div className="pillar-card glass-panel">
            <div className="pillar-icon">🔬</div>
            <h3 className="pillar-title">Taxonomic Verification</h3>
            <p className="pillar-text">
              Community identification peer review, expert naturalist confirmation, and community
              consensus on challenging specimens.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
