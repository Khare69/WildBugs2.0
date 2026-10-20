import { Router } from 'express';
import forumController from '../controllers/forumController';
import { authenticate, optionalAuthenticate } from '../middleware/authenticate';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

/**
 * @route   GET /api/forum/posts
 * @desc    Get paginated discussion threads (optionally filter by speciesId or keyword)
 * @access  Public
 */
router.get('/posts', optionalAuthenticate, asyncHandler(forumController.getPostsHandler));

/**
 * @route   GET /api/forum/posts/:id
 * @desc    Get thread details and all nested replies for a post
 * @access  Public
 */
router.get('/posts/:id', optionalAuthenticate, asyncHandler(forumController.getThreadHandler));

/**
 * @route   POST /api/forum/posts
 * @desc    Create a new top-level community discussion post
 * @access  Protected
 */
router.post('/posts', authenticate, asyncHandler(forumController.createPostHandler));

/**
 * @route   POST /api/forum/posts/:id/reply
 * @desc    Reply to an existing post or reply thread
 * @access  Protected
 */
router.post('/posts/:id/reply', authenticate, asyncHandler(forumController.replyHandler));

/**
 * @route   POST /api/forum/posts/:id/upvote
 * @desc    Upvote a post or reply
 * @access  Protected
 */
router.post('/posts/:id/upvote', authenticate, asyncHandler(forumController.upvoteHandler));

export default router;
