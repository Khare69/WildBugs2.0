import apiClient from './client';
import type {
  NotificationsResponse,
  UnreadCountResponse,
  MarkAsReadResponse,
  MarkAllReadResponse,
} from '../types/notification';

export const notificationsApi = {
  /**
   * Fetches paginated notifications for the current user.
   */
  getNotifications: async (options?: {
    page?: number;
    limit?: number;
    unreadOnly?: boolean;
  }): Promise<NotificationsResponse['data']> => {
    const response = await apiClient.get<NotificationsResponse>('/notifications', {
      params: options,
    });
    return response.data.data;
  },

  /**
   * Fast poll endpoint for retrieving current unread notification count.
   */
  getUnreadCount: async (): Promise<number> => {
    const response = await apiClient.get<UnreadCountResponse>('/notifications/unread-count');
    return response.data.data.count;
  },

  /**
   * Marks an individual notification as read.
   */
  markAsRead: async (id: string): Promise<MarkAsReadResponse['data']['notification']> => {
    const response = await apiClient.patch<MarkAsReadResponse>(`/notifications/${id}/read`);
    return response.data.data.notification;
  },

  /**
   * Marks all unread notifications as read.
   */
  markAllAsRead: async (): Promise<number> => {
    const response = await apiClient.post<MarkAllReadResponse>('/notifications/mark-all-read');
    return response.data.data.updatedCount;
  },
};

export default notificationsApi;
