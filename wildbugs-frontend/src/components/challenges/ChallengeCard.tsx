import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import challengesApi from '../../api/challengesApi';
import ProgressBar from './ProgressBar';
import { formatDaysLeft, getCriteriaLabel } from './challengeUtils';
import type { ChallengeItem } from '../../types/challenge';

interface ChallengeCardProps {
  challenge: ChallengeItem;
  isAuthenticated: boolean;
}

export const ChallengeCard: React.FC<ChallengeCardProps> = ({
  challenge,
  isAuthenticated,
}) => {
  const queryClient = useQueryClient();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { id, title, description, criteria, scope, daysLeft, status, participantCount, userProgress } =
    challenge;

  const isJoined = Boolean(userProgress?.joined);
  const isCompleted = Boolean(userProgress?.completed);
  const isActive = status === 'ACTIVE';

  const joinMutation = useMutation({
    mutationFn: () => challengesApi.joinChallenge(id),
    onSuccess: () => {
      setErrorMessage(null);
      queryClient.invalidateQueries({ queryKey: ['challenges'] });
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || err.message || 'Failed to join challenge';
      setErrorMessage(msg);
    },
  });

  const handleJoin = () => {
    if (!isAuthenticated) return;
    setErrorMessage(null);
    joinMutation.mutate();
  };

  const icon = criteria.icon || (scope === 'TEAM' ? '👥' : '🎯');
  const criteriaLabel = getCriteriaLabel(criteria);
  const daysText = formatDaysLeft(daysLeft, status);

  return (
    <div className={`challenge-card glass-panel ${isJoined ? 'challenge-joined' : ''} ${isCompleted ? 'challenge-completed' : ''}`}>
      {/* Top Banner Row */}
      <div className="challenge-card-top-row">
        <div className="challenge-icon-box">
          <span className="challenge-icon">{icon}</span>
        </div>

        <div className="challenge-badge-group">
          <span className={`challenge-scope-chip ${scope.toLowerCase()}`}>
            {scope === 'TEAM' ? 'Team BioBlitz' : 'Individual Quest'}
          </span>
          <span className={`challenge-status-chip status-${status.toLowerCase()}`}>
            {status}
          </span>
        </div>
      </div>

      {/* Main Content */}
      <div className="challenge-card-body">
        <h3 className="challenge-title">{title}</h3>
        <p className="challenge-description">{description}</p>

        {/* Criteria & Timing Meta */}
        <div className="challenge-meta-list">
          <div className="challenge-meta-item">
            <span className="meta-icon">🎯</span>
            <span className="meta-text">
              <strong>Goal:</strong> {criteriaLabel}
            </span>
          </div>

          <div className="challenge-meta-item">
            <span className="meta-icon">⏳</span>
            <span className="meta-text">{daysText}</span>
          </div>

          <div className="challenge-meta-item">
            <span className="meta-icon">👥</span>
            <span className="meta-text">
              {participantCount} {participantCount === 1 ? 'Naturalist' : 'Naturalists'} participating
            </span>
          </div>
        </div>

        {/* Progress Display if Enrolled */}
        {isJoined && userProgress && (
          <div className="challenge-progress-section">
            <div className="challenge-progress-header">
              <span className="progress-section-title">
                {isCompleted ? '🏆 Goal Completed!' : 'Your Quest Progress'}
              </span>
              <span className="progress-section-digits">
                {userProgress.progress} / {userProgress.target}
              </span>
            </div>

            <ProgressBar
              value={userProgress.progress}
              max={userProgress.target}
              showLabel={false}
              size="md"
              color={isCompleted ? 'linear-gradient(90deg, #10b981, #34d399)' : undefined}
            />

            {isCompleted && (
              <p className="challenge-completion-note">
                ✨ Recorded into your permanent biodiversity accolades!
              </p>
            )}
          </div>
        )}

        {errorMessage && (
          <div className="challenge-card-error">
            <span>⚠️ {errorMessage}</span>
          </div>
        )}
      </div>

      {/* Card Action Footer */}
      <div className="challenge-card-footer">
        {isJoined ? (
          <div className="challenge-enrolled-banner">
            <span className="enrolled-check">✓</span>
            <span>{isCompleted ? 'Challenge Accomplished' : 'Enrolled in BioBlitz'}</span>
          </div>
        ) : isAuthenticated ? (
          <button
            type="button"
            className="btn-primary challenge-join-btn"
            onClick={handleJoin}
            disabled={!isActive || joinMutation.isPending}
          >
            {joinMutation.isPending ? 'Enrolling...' : isActive ? '🚀 Join Challenge' : 'Not Active'}
          </button>
        ) : (
          <Link to="/login" className="btn-secondary challenge-join-btn">
            Sign In to Join
          </Link>
        )}
      </div>
    </div>
  );
};

export default ChallengeCard;
