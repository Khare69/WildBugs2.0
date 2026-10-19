import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../hooks/useAuth';
import usersApi from '../api/usersApi';
import StatsOverview from '../components/profile/StatsOverview';
import StreakTracker from '../components/profile/StreakTracker';
import FieldJournal from '../components/profile/FieldJournal';

export const ProfilePage: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const { user: authUser, logout } = useAuth();
  const navigate = useNavigate();

  // Determine if viewing own profile
  const isOwnProfile = !id || Boolean(authUser && authUser.id === id);
  const targetUserId = id || authUser?.id;

  const {
    data: profileData,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['userProfile', targetUserId, isOwnProfile],
    queryFn: () => {
      if (isOwnProfile) {
        return usersApi.getMyProfile();
      }
      if (id) {
        return usersApi.getUserProfile(id);
      }
      throw new Error('No user identifier provided');
    },
    enabled: Boolean(targetUserId),
    staleTime: 30000,
  });

  const handleSignOut = () => {
    logout();
    navigate('/');
  };

  if (isLoading) {
    return (
      <div className="profile-page-loading">
        <div className="spinner-large">🪲</div>
        <p>Loading naturalist profile & observation records...</p>
      </div>
    );
  }

  if (isError || !profileData) {
    return (
      <div className="profile-page-error glass-panel">
        <span className="error-icon">⚠️</span>
        <h2>Observer Profile Not Found</h2>
        <p>The requested naturalist profile could not be retrieved from the biodiversity registry.</p>
        <div className="error-actions">
          <button type="button" className="btn-primary" onClick={() => refetch()}>
            ↻ Retry
          </button>
          <Link to="/" className="btn-secondary">
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  const { user, stats } = profileData;
  const initial = user.displayName ? user.displayName.charAt(0).toUpperCase() : 'N';
  const memberDate = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : 'Active Contributor';

  return (
    <div className="profile-page-container">
      {/* Back button if visiting another user */}
      {!isOwnProfile && (
        <div className="profile-breadcrumbs">
          <Link to="/species" className="breadcrumb-link">
            ← Explore Community
          </Link>
        </div>
      )}

      {/* Hero Profile Header */}
      <section className="profile-hero-card glass-panel">
        <div className="profile-hero-banner" />
        <div className="profile-hero-body">
          <div className="profile-avatar-large" aria-label={`Avatar for ${user.displayName}`}>
            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt={user.displayName} className="profile-avatar-img" />
            ) : (
              <span className="profile-avatar-initial">{initial}</span>
            )}
            <span className="profile-status-online-dot" title="Active Observer" />
          </div>

          <div className="profile-hero-info">
            <div className="profile-name-row">
              <h1 className="profile-display-name">{user.displayName}</h1>
              <span className="profile-role-badge">{user.role}</span>
              {stats.verifiedCount >= 5 && (
                <span className="profile-veteran-chip" title="Veteran Verifier with 5+ verified records">
                  ✨ Veteran Naturalist
                </span>
              )}
            </div>

            {user.email && (
              <p className="profile-email-text">{user.email}</p>
            )}

            <div className="profile-meta-tags">
              <span className="profile-meta-chip">🗓️ Contributor since {memberDate}</span>
              <span className="profile-meta-chip">🆔 {user.id.substring(0, 8)}...</span>
              <span className="profile-meta-chip">
                📍 {stats.totalSightings} {stats.totalSightings === 1 ? 'Observation' : 'Observations'}
              </span>
            </div>
          </div>

          <div className="profile-hero-actions">
            {isOwnProfile ? (
              <>
                <Link to="/upload" className="btn-primary">
                  📸 Record Sighting
                </Link>
                <Link to="/account" className="btn-secondary">
                  ⚙️ Account Settings
                </Link>
                <button
                  type="button"
                  className="btn-outline-danger"
                  onClick={handleSignOut}
                  title="Sign out of current session"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <button
                type="button"
                className="btn-secondary"
                onClick={() => {
                  navigator.clipboard?.writeText(window.location.href);
                  alert('Profile URL copied to clipboard!');
                }}
              >
                🔗 Share Profile
              </button>
            )}
          </div>
        </div>
      </section>

      {/* 7-Day Habit & Streak Tracker */}
      <StreakTracker
        currentStreak={stats.currentStreak}
        longestStreak={stats.longestStreak}
        last7Days={stats.last7Days}
      />

      {/* Discovery Metrics & Stats Overview Grid */}
      <StatsOverview stats={stats} />

      {/* Chronological Field Journal Timeline */}
      <FieldJournal userId={user.id} isOwnProfile={isOwnProfile} />
    </div>
  );
};

export default ProfilePage;
