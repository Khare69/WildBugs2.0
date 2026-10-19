import React from 'react';
import type { StreakDay } from '../../types/user';

interface StreakTrackerProps {
  currentStreak: number;
  longestStreak: number;
  last7Days: StreakDay[];
}

export const StreakTracker: React.FC<StreakTrackerProps> = ({
  currentStreak,
  longestStreak,
  last7Days,
}) => {
  const isStreakActive = currentStreak > 0;
  const todayFormatted = last7Days[last7Days.length - 1]?.date;

  return (
    <section className="streak-tracker-card glass-panel" aria-label="Observation Habit & Streak Tracker">
      <div className="streak-header-row">
        <div className="streak-title-group">
          <div className="streak-badge-large">
            <span className="streak-flame-icon">🔥</span>
            <span className="streak-number">{currentStreak}</span>
            <span className="streak-unit">{currentStreak === 1 ? 'Day Streak' : 'Days Streak'}</span>
          </div>
          <p className="streak-caption">
            {isStreakActive
              ? 'Great work! Daily observation strengthens ecological biodiversity intelligence.'
              : 'Record a field sighting today to ignite your observation streak!'}
          </p>
        </div>

        <div className="streak-records-pill">
          <span className="trophy-icon">🏆</span>
          <span className="record-label">All-Time Best:</span>
          <strong className="record-value">{longestStreak} {longestStreak === 1 ? 'day' : 'days'}</strong>
        </div>
      </div>

      {/* 7-Day Timeline Visualization */}
      <div className="streak-timeline-container">
        <div className="streak-timeline-title">Past 7 Days Activity</div>
        <div className="streak-dots-row">
          {last7Days.map((day) => {
            const isToday = day.date === todayFormatted;
            const statusClass = day.hasSighting
              ? 'streak-dot-active'
              : isToday
              ? 'streak-dot-today-pending'
              : 'streak-dot-inactive';

            const formattedDateLabel = new Date(day.date + 'T00:00:00Z').toLocaleDateString(
              undefined,
              { month: 'short', day: 'numeric', timeZone: 'UTC' }
            );

            return (
              <div
                key={day.date}
                className={`streak-day-item ${isToday ? 'streak-day-today' : ''}`}
                title={`${formattedDateLabel}: ${
                  day.hasSighting
                    ? 'Sighting recorded'
                    : isToday
                    ? 'Due today — log a bug!'
                    : 'No sightings recorded'
                }`}
              >
                <span className="streak-day-label">{day.dayLabel}</span>
                <div className={`streak-indicator-circle ${statusClass}`}>
                  {day.hasSighting ? (
                    <span className="streak-check">✓</span>
                  ) : isToday ? (
                    <span className="streak-pulse-inner" />
                  ) : (
                    <span className="streak-empty-dash">·</span>
                  )}
                </div>
                <span className="streak-date-label">{formattedDateLabel}</span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default StreakTracker;
