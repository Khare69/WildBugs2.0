import type { NotificationItem } from '../../types/notification';

/**
 * Returns a recognizable visual emoji icon based on notification category.
 */
export function getNotificationIcon(type: string): string {
  switch (type?.toUpperCase()) {
    case 'VERIFICATION':
      return '🛡️';
    case 'REJECTION':
      return '⚠️';
    case 'BADGE_EARNED':
      return '🏆';
    case 'FORUM_REPLY':
      return '💬';
    case 'CHALLENGE_PROGRESS':
      return '🎯';
    default:
      return '🔔';
  }
}

/**
 * Resolves the target in-app route link based on notification data payload.
 */
export function getNotificationLink(notification: NotificationItem): string | null {
  if (!notification || !notification.data) return null;

  const data = notification.data;
  switch (notification.type?.toUpperCase()) {
    case 'VERIFICATION':
    case 'REJECTION':
      if (data.sightingId) {
        return `/sightings/${data.sightingId}`;
      }
      return null;
    case 'BADGE_EARNED':
      return '/profile';
    case 'FORUM_REPLY':
      if (data.postId) {
        return `/forum/${data.postId}`;
      }
      return '/forum';
    case 'CHALLENGE_PROGRESS':
      return '/challenges';
    default:
      return null;
  }
}
