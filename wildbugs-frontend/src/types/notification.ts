export interface NotificationItem {
  id: string;
  userId: string;
  type: string;
  message: string;
  data: any;
  read: boolean;
  createdAt: string;
}

export interface NotificationsResponse {
  status: 'success' | 'fail' | 'error';
  data: {
    notifications: NotificationItem[];
    unreadCount: number;
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface UnreadCountResponse {
  status: 'success' | 'fail' | 'error';
  data: {
    count: number;
  };
}

export interface MarkAsReadResponse {
  status: 'success' | 'fail' | 'error';
  data: {
    notification: NotificationItem;
  };
}

export interface MarkAllReadResponse {
  status: 'success' | 'fail' | 'error';
  data: {
    updatedCount: number;
  };
}
