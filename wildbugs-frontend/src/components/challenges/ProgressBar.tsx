import React from 'react';

export interface ProgressBarProps {
  value: number;
  max: number;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max,
  showLabel = false,
  size = 'md',
  color,
  className = '',
}) => {
  const percentage = max > 0 ? Math.min(100, Math.max(0, Math.round((value / max) * 100))) : 0;

  return (
    <div className={`wildbugs-progress-wrapper ${className}`}>
      {showLabel && (
        <div className="wildbugs-progress-labels">
          <span className="progress-value-text">
            {value} / {max}
          </span>
          <span className="progress-percent-text">{percentage}%</span>
        </div>
      )}
      <div
        className={`wildbugs-progress-track size-${size}`}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
      >
        <div
          className="wildbugs-progress-fill"
          style={{
            width: `${percentage}%`,
            ...(color ? { background: color } : {}),
          }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
