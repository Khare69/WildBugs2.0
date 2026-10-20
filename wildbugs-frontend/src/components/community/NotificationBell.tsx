import React, { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import notificationsApi from '../../api/notificationsApi';
import useAuthStore from '../../store/authStore';
import useNotificationStore from '../../store/notificationStore';
import { formatRelativeTime } from './forumUtils';
import { getNotificationIcon, getNotificationLink } from './notificationUtils';
import type { NotificationItem } from '../../types/notification';

export const NotificationBell: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { isAuthenticated } = useAuthStore();
  const { isOpen, setIsOpen, toggleOpen } = useNotificationStore();

  // 1. Auto-poll unread count every 30 seconds
  const { data: unreadCount = 0 } = useQuery({
    queryKey: ['notifications-unread-count'],
    queryFn: notificationsApi.getUnreadCount,
    refetchInterval: 30000,
    enabled: isAuthenticated,
  });

  // 2. Fetch recent notifications when dropdown is open
  const {
    data: notificationsData,
    isLoading,
  } = useQuery({
    queryKey: ['notifications-list'],
    queryFn: () => notificationsApi.getNotifications({ limit: 15 }),
    enabled: isAuthenticated && isOpen,
  });

  const notifications: NotificationItem[] = notificationsData?.notifications || [];

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen, setIsOpen]);

  // Mutation: Mark single notification read
  const markReadMutation = useMutation({
    mutationFn: (id: string) => notificationsApi.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-list'] });
    },
  });

  // Mutation: Mark all as read
  const markAllReadMutation = useMutation({
    mutationFn: () => notificationsApi.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-list'] });
    },
  });

  const handleNotificationClick = async (notification: NotificationItem) => {
    if (!notification.read) {
      await markReadMutation.mutateAsync(notification.id);
    }
    setIsOpen(false);
    const link = getNotificationLink(notification);
    if (link) {
      navigate(link);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="notification-bell-wrapper" ref={dropdownRef}>
      <button
        type="button"
        className={`notification-bell-btn ${unreadCount > 0 ? 'notification-bell-btn--has-unread' : ''}`}
        onClick={toggleOpen}
        aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
        aria-expanded={isOpen}
      >
        <span className="bell-icon" aria-hidden="true">🔔</span>
        {unreadCount > 0 && (
          <span className="notification-badge-count">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="notification-dropdown" role="region" aria-label="Notifications Panel">
          <div className="notification-dropdown__header">
            <div className="notification-dropdown__title">
              <h4>Notifications</h4>
              {unreadCount > 0 && (
                <span className="notification-pill-count">{unreadCount} new</span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                className="btn-mark-all-read"
                onClick={() => markAllReadMutation.mutate()}
                disabled={markAllReadMutation.isPending}
              >
                ✓ Mark all as read
              </button>
            )}
          </div>

          <div className="notification-dropdown__body">
            {isLoading ? (
              <div className="notification-loading-state">
                <span className="spinner-small" />
                <p>Checking for updates...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="notification-empty-state">
                <span className="notification-empty-icon">🔕</span>
                <p>No notifications yet</p>
                <small>You will be notified when your sightings are verified or someone replies.</small>
              </div>
            ) : (
              <ul className="notification-list">
                {notifications.map((item) => {
                  const icon = getNotificationIcon(item.type);
                  return (
                    <li
                      key={item.id}
                      className={`notification-item ${!item.read ? 'notification-item--unread' : ''}`}
                      onClick={() => handleNotificationClick(item)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          handleNotificationClick(item);
                        }
                      }}
                    >
                      <div className="notification-item__icon-frame">{icon}</div>

                      <div className="notification-item__content">
                        <p className="notification-item__message">{item.message}</p>
                        <span className="notification-item__time">
                          {formatRelativeTime(item.createdAt)}
                        </span>
                      </div>

                      {!item.read && <span className="notification-unread-dot" />}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
