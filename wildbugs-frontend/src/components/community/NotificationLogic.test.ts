import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { getNotificationIcon, getNotificationLink } from './notificationUtils.ts';
import { useNotificationStore } from '../../store/notificationStore.ts';
import type { NotificationItem } from '../../types/notification.ts';

describe('Notification Frontend Logic Unit Tests', () => {
  it('maps notification types to distinct recognizable icons', () => {
    assert.equal(getNotificationIcon('VERIFICATION'), '🛡️');
    assert.equal(getNotificationIcon('verification'), '🛡️');
    assert.equal(getNotificationIcon('REJECTION'), '⚠️');
    assert.equal(getNotificationIcon('BADGE_EARNED'), '🏆');
    assert.equal(getNotificationIcon('FORUM_REPLY'), '💬');
    assert.equal(getNotificationIcon('CHALLENGE_PROGRESS'), '🎯');
    assert.equal(getNotificationIcon('UNKNOWN_TYPE'), '🔔');
    assert.equal(getNotificationIcon(''), '🔔');
  });

  it('resolves correct in-app navigation routes for various notifications', () => {
    const sightingNotification: NotificationItem = {
      id: 'n1',
      userId: 'u1',
      type: 'VERIFICATION',
      message: 'Your sighting was verified!',
      data: { sightingId: 'sighting-uuid-123' },
      read: false,
      createdAt: '2026-10-20T12:00:00Z',
    };
    assert.equal(getNotificationLink(sightingNotification), '/sightings/sighting-uuid-123');

    const badgeNotification: NotificationItem = {
      id: 'n2',
      userId: 'u1',
      type: 'BADGE_EARNED',
      message: 'Badge unlocked',
      data: { badgeId: 5 },
      read: false,
      createdAt: '2026-10-20T12:00:00Z',
    };
    assert.equal(getNotificationLink(badgeNotification), '/profile');

    const forumNotification: NotificationItem = {
      id: 'n3',
      userId: 'u1',
      type: 'FORUM_REPLY',
      message: 'Someone replied',
      data: { postId: 'thread-456' },
      read: false,
      createdAt: '2026-10-20T12:00:00Z',
    };
    assert.equal(getNotificationLink(forumNotification), '/forum/thread-456');

    const challengeNotification: NotificationItem = {
      id: 'n4',
      userId: 'u1',
      type: 'CHALLENGE_PROGRESS',
      message: 'Challenge goal met',
      data: { challengeId: 2 },
      read: false,
      createdAt: '2026-10-20T12:00:00Z',
    };
    assert.equal(getNotificationLink(challengeNotification), '/challenges');

    // Null safety
    assert.equal(getNotificationLink({} as any), null);
  });

  it('manages unread counter and dropdown toggle in notification store', () => {
    const store = useNotificationStore.getState();

    store.setUnreadCount(5);
    assert.equal(useNotificationStore.getState().unreadCount, 5);

    store.decrementUnread();
    assert.equal(useNotificationStore.getState().unreadCount, 4);

    // Clamps at zero
    store.setUnreadCount(0);
    store.decrementUnread();
    assert.equal(useNotificationStore.getState().unreadCount, 0);

    // Dropdown toggle
    store.setIsOpen(false);
    store.toggleOpen();
    assert.equal(useNotificationStore.getState().isOpen, true);
    store.toggleOpen();
    assert.equal(useNotificationStore.getState().isOpen, false);
  });
});
