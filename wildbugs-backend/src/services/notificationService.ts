import prisma from '../database/prisma';
import { NotFoundError, ValidationError } from '../utils/errors';

export interface GetNotificationsOptions {
  page?: number;
  limit?: number;
  unreadOnly?: boolean;
}

export interface NotificationResponseItem {
  id: string;
  userId: string;
  type: string;
  message: string;
  data: any;
  read: boolean;
  createdAt: string;
}

export class NotificationService {
  /**
   * Retrieves paginated notifications for the specified user along with the total unread count.
   */
  public async getUserNotifications(userId: string, options: GetNotificationsOptions = {}) {
    if (!userId) {
      throw new ValidationError('User ID is required to fetch notifications.');
    }

    const page = Math.max(1, Number(options.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(options.limit) || 20));
    const skip = (page - 1) * limit;

    const where: any = { userId };
    if (options.unreadOnly) {
      where.read = false;
    }

    const [rawNotifications, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.notification.count({ where }),
      prisma.notification.count({ where: { userId, read: false } }),
    ]);

    const notifications: NotificationResponseItem[] = rawNotifications.map((n) => ({
      id: n.id,
      userId: n.userId,
      type: n.type,
      message: n.message,
      data: n.data,
      read: n.read,
      createdAt: n.createdAt.toISOString(),
    }));

    return {
      notifications,
      unreadCount,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  /**
   * Retrieves the current count of unread notifications for a user (efficient for polling).
   */
  public async getUnreadCount(userId: string): Promise<number> {
    if (!userId) return 0;
    return prisma.notification.count({
      where: { userId, read: false },
    });
  }

  /**
   * Marks a specific notification as read.
   */
  public async markAsRead(userId: string, notificationId: string) {
    if (!userId || !notificationId) {
      throw new ValidationError('User ID and Notification ID are required.');
    }

    const notification = await prisma.notification.findFirst({
      where: { id: notificationId, userId },
    });

    if (!notification) {
      throw new NotFoundError(`Notification '${notificationId}' was not found.`);
    }

    const updated = await prisma.notification.update({
      where: { id: notificationId },
      data: { read: true },
    });

    return {
      id: updated.id,
      userId: updated.userId,
      type: updated.type,
      message: updated.message,
      data: updated.data,
      read: updated.read,
      createdAt: updated.createdAt.toISOString(),
    };
  }

  /**
   * Marks all unread notifications for a user as read.
   */
  public async markAllAsRead(userId: string) {
    if (!userId) {
      throw new ValidationError('User ID is required.');
    }

    const result = await prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });

    return {
      updatedCount: result.count,
    };
  }

  /**
   * Dispatches a new notification to a target user.
   */
  public async createNotification(
    userId: string,
    type: string,
    message: string,
    data?: Record<string, any>
  ) {
    if (!userId || !type || !message) {
      throw new ValidationError('User ID, type, and message are required.');
    }

    return prisma.notification.create({
      data: {
        userId,
        type,
        message,
        data: data || undefined,
      },
    });
  }
}

export const notificationService = new NotificationService();
export default notificationService;
