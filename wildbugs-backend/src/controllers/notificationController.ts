import { Request, Response } from 'express';
import notificationService from '../services/notificationService';
import { UnauthorizedError, ValidationError } from '../utils/errors';

export class NotificationController {
  /**
   * GET /api/notifications
   * Retrieves paginated notifications and unread tally for the authenticated user.
   */
  public getNotificationsHandler = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?.userId || req.user?.id;
    if (!userId) {
      throw new UnauthorizedError('Authentication required to access notifications.');
    }

    const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string, 10) || 20));
    const unreadOnly = req.query.unreadOnly === 'true';

    const result = await notificationService.getUserNotifications(userId, {
      page,
      limit,
      unreadOnly,
    });

    res.status(200).json({
      status: 'success',
      data: result,
    });
  };

  /**
   * GET /api/notifications/unread-count
   * Fast endpoint specifically for polling unread badge count on the navbar.
   */
  public getUnreadCountHandler = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?.userId || req.user?.id;
    if (!userId) {
      throw new UnauthorizedError('Authentication required.');
    }

    const count = await notificationService.getUnreadCount(userId);

    res.status(200).json({
      status: 'success',
      data: { count },
    });
  };

  /**
   * PATCH /api/notifications/:id/read
   * Marks a single notification as read.
   */
  public markAsReadHandler = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?.userId || req.user?.id;
    if (!userId) {
      throw new UnauthorizedError('Authentication required.');
    }

    const { id } = req.params;
    if (!id || typeof id !== 'string') {
      throw new ValidationError('A valid notification ID is required.');
    }

    const notification = await notificationService.markAsRead(userId, id);

    res.status(200).json({
      status: 'success',
      data: { notification },
    });
  };

  /**
   * POST /api/notifications/mark-all-read
   * Marks all unread notifications for the user as read.
   */
  public markAllAsReadHandler = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?.userId || req.user?.id;
    if (!userId) {
      throw new UnauthorizedError('Authentication required.');
    }

    const result = await notificationService.markAllAsRead(userId);

    res.status(200).json({
      status: 'success',
      data: result,
    });
  };
}

export const notificationController = new NotificationController();
export default notificationController;
