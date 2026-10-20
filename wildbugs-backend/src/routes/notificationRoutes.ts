import { Router } from 'express';
import notificationController from '../controllers/notificationController';
import { authenticate } from '../middleware/authenticate';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

// All notification endpoints require valid Bearer JWT authentication
router.use(authenticate);

/**
 * @route   GET /api/notifications
 * @desc    Get user's notifications with pagination and unreadCount
 * @access  Protected
 */
router.get('/', asyncHandler(notificationController.getNotificationsHandler));

/**
 * @route   GET /api/notifications/unread-count
 * @desc    Get current unread count for navbar polling
 * @access  Protected
 */
router.get('/unread-count', asyncHandler(notificationController.getUnreadCountHandler));

/**
 * @route   POST /api/notifications/mark-all-read
 * @desc    Mark all user notifications as read
 * @access  Protected
 */
router.post('/mark-all-read', asyncHandler(notificationController.markAllAsReadHandler));

/**
 * @route   PATCH /api/notifications/:id/read
 * @desc    Mark a specific notification as read
 * @access  Protected
 */
router.patch('/:id/read', asyncHandler(notificationController.markAsReadHandler));

export default router;
