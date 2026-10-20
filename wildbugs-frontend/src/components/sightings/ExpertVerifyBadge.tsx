import React from 'react';
import type { SightingStatus } from '../../types/sighting';
import { getVerificationStatusConfig } from './expertVerificationUtils';

interface ExpertVerifyBadgeProps {
  status: SightingStatus;
  showDescription?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const ExpertVerifyBadge: React.FC<ExpertVerifyBadgeProps> = ({
  status,
  showDescription = false,
  size = 'md',
  className = '',
}) => {
  const config = getVerificationStatusConfig(status);

  return (
    <div className={`expert-verify-badge-container expert-verify-badge--${size} ${config.themeClass} ${className}`}>
      <div className="expert-verify-badge__badge">
        <span className="expert-verify-badge__icon" aria-hidden="true">
          {config.icon}
        </span>
        <span className="expert-verify-badge__label">{config.label}</span>
      </div>

      {showDescription && (
        <p className="expert-verify-badge__description">
          {config.description}
        </p>
      )}
    </div>
  );
};

export default ExpertVerifyBadge;
