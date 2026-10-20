import { Request, Response } from 'express';
import forumService from '../services/forumService';
import { UnauthorizedError, ValidationError } from '../utils/errors';

export class ForumController {
  /**
   * GET /api/forum/posts
   * Lists paginated discussion threads, optionally filtered by speciesId or keyword search.
   */
  public getPostsHandler = async (req: Request, res: Response): Promise<void> => {
    const { speciesId, page, limit, search, sortBy } = req.query;

    const data = await forumService.getPosts({
      speciesId: speciesId ? Number(speciesId) : undefined,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      search: typeof search === 'string' ? search : undefined,
      sortBy: sortBy === 'upvotes' || sortBy === 'replies' ? sortBy : 'recent',
    });

    res.status(200).json({
      status: 'success',
      data,
    });
  };

  /**
   * GET /api/forum/posts/:id
   * Retrieves a full discussion thread with its nested replies.
   */
  public getThreadHandler = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    if (!id || typeof id !== 'string') {
      throw new ValidationError('A valid post ID parameter is required.');
    }

    const data = await forumService.getThread(id);

    res.status(200).json({
      status: 'success',
      data,
    });
  };

  /**
   * POST /api/forum/posts
   * Creates a new top-level community discussion post.
   */
  public createPostHandler = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?.userId || req.user?.id;
    if (!userId) {
      throw new UnauthorizedError('Authentication required to create a forum post');
    }

    const { title, body, speciesId } = req.body;
    const data = await forumService.createPost(userId, {
      title,
      body,
      speciesId: speciesId ? Number(speciesId) : undefined,
    });

    res.status(201).json({
      status: 'success',
      message: 'Discussion post created successfully',
      data,
    });
  };

  /**
   * POST /api/forum/posts/:id/reply
   * Posts a reply to an existing post or reply thread.
   */
  public replyHandler = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?.userId || req.user?.id;
    if (!userId) {
      throw new UnauthorizedError('Authentication required to reply to a forum post');
    }

    const { id } = req.params;
    const { body } = req.body;

    const data = await forumService.reply(userId, id, body);

    res.status(201).json({
      status: 'success',
      message: 'Reply submitted successfully',
      data,
    });
  };

  /**
   * POST /api/forum/posts/:id/upvote
   * Increments the upvote counter for a post or reply.
   */
  public upvoteHandler = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?.userId || req.user?.id;
    if (!userId) {
      throw new UnauthorizedError('Authentication required to upvote a post');
    }

    const { id } = req.params;
    const data = await forumService.upvote(id);

    res.status(200).json({
      status: 'success',
      message: 'Post upvoted successfully',
      data,
    });
  };
}

export const forumController = new ForumController();
export default forumController;
