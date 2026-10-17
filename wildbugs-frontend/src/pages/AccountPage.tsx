import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../hooks/useAuth';
import authApi from '../api/authApi';

export const AccountPage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Fetch fresh profile stats from /api/auth/me
  const { data: profileData, isLoading, refetch } = useQuery({
    queryKey: ['userProfileMe'],
    queryFn: () => authApi.getMe(),
    staleTime: 30000,
  });

  const handleSignOut = () => {
    logout();
    navigate('/');
  };

  const currentUser = profileData?.user || user;
  const stats = profileData?.stats;

  if (!currentUser) {
    return null;
  }

  const initial = currentUser.displayName.charAt(0).toUpperCase();
  const memberDate = currentUser.createdAt
    ? new Date(currentUser.createdAt).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : 'Active Member';

  return (
    <div className="account-page">
      {/* Profile Overview Card */}
      <section className="account-profile-card">
        <div className="account-avatar-large" aria-label={`Avatar for ${currentUser.displayName}`}>
          {initial}
        </div>

        <div className="account-info-header">
          <div className="account-name-row">
            <h1 className="account-display-name">{currentUser.displayName}</h1>
            <span className="account-chip role-chip">{currentUser.role}</span>
          </div>

          <p className="account-email-text">{currentUser.email}</p>

          <div className="account-meta-chips">
            <span className="account-chip">Member since {memberDate}</span>
            <span className="account-chip">ID: {currentUser.id.substring(0, 8)}...</span>
          </div>
        </div>
      </section>

      {/* Discovery Stats Grid */}
      <section className="account-stats-container">
        <h2 className="account-stats-title">Observation Activity</h2>

        <div className="account-stats-grid">
          <div className="account-stat-card">
            <span className="account-stat-number">
              {isLoading ? '...' : stats?.sightingsCount ?? 0}
            </span>
            <span className="account-stat-title">Field Sightings</span>
          </div>

          <div className="account-stat-card">
            <span className="account-stat-number">
              {isLoading ? '...' : stats?.identificationsCount ?? 0}
            </span>
            <span className="account-stat-title">Taxonomic Identifications</span>
          </div>

          <div className="account-stat-card">
            <span className="account-stat-number">
              {isLoading ? '...' : stats?.badgesCount ?? 0}
            </span>
            <span className="account-stat-title">Earned Badges</span>
          </div>
        </div>
      </section>

      {/* Phase 2 Feature Preview */}
      <section className="account-preview-box">
        <div className="account-preview-header">
          <span style={{ fontSize: '1.5rem' }}>📸</span>
          <h3>Citizen Science Observer Toolkit</h3>
        </div>
        <p className="account-preview-text">
          Phase 2 Core Upload Loop will enable direct camera photo capture, client-side canvas compression,
          Cloudinary image ingestion, and automated Google Cloud Vision AI insect identification.
        </p>
      </section>

      {/* Actions */}
      <div className="account-actions-bar">
        <button
          type="button"
          className="btn-retry"
          style={{ background: 'transparent', border: '1px solid var(--border-subtle)' }}
          onClick={() => refetch()}
        >
          ↻ Refresh Stats
        </button>
        <Link to="/species" className="btn-secondary">
          Browse Catalog
        </Link>
        <button type="button" className="btn-reset-filters" onClick={handleSignOut}>
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default AccountPage;
