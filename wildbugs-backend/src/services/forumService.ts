import { ForumPost } from '@prisma/client';
import prisma from '../database/prisma';
import { NotFoundError, ValidationError } from '../utils/errors';

export interface AuthorSummary {
  id: string;
  displayName: string;
  avatarUrl: string | null;
  role: string;
}

export interface SpeciesSummary {
  id: number;
  commonName: string;
  scientificName: string;
  family: string;
}

export interface ForumPostItem {
  id: string;
  authorId: string;
  parentId: string | null;
  speciesId: number | null;
  title: string | null;
  body: string;
  upvotes: number;
  replyCount: number;
  createdAt: string;
  updatedAt: string;
  author: AuthorSummary;
  species?: SpeciesSummary | null;
}

export interface ForumThreadReply {
  id: string;
  authorId: string;
  parentId: string | null;
  speciesId: number | null;
  title: string | null;
  body: string;
  upvotes: number;
  createdAt: string;
  updatedAt: string;
  author: AuthorSummary;
  replies?: ForumThreadReply[];
}

export interface ForumThreadItem extends ForumPostItem {
  replies: ForumThreadReply[];
}

export interface GetPostsOptions {
  page?: number;
  limit?: number;
  speciesId?: number;
  search?: string;
  sortBy?: 'recent' | 'upvotes' | 'replies';
}

export interface PaginatedPostsResponse {
  posts: ForumPostItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreatePostInput {
  title: string;
  body: string;
  speciesId?: number;
}

/**
 * Pure helper to validate post title and body.
 */
export function validatePostInput(title?: string, body?: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const trimmedTitle = title?.trim() || '';
  const trimmedBody = body?.trim() || '';

  if (!trimmedTitle) {
    errors.push('Post title is required.');
  } else if (trimmedTitle.length < 3) {
    errors.push('Post title must be at least 3 characters.');
  } else if (trimmedTitle.length > 200) {
    errors.push('Post title cannot exceed 200 characters.');
  }

  if (!trimmedBody) {
    errors.push('Post body is required.');
  } else if (trimmedBody.length < 5) {
    errors.push('Post body must be at least 5 characters.');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Pure helper to validate a reply body.
 */
export function validateReplyInput(body?: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const trimmedBody = body?.trim() || '';

  if (!trimmedBody) {
    errors.push('Reply body cannot be empty.');
  } else if (trimmedBody.length > 5000) {
    errors.push('Reply body cannot exceed 5000 characters.');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Pure helper to format a snippet of markdown or text.
 */
export function formatPostSnippet(text: string, maxLength = 160): string {
  if (!text) return '';
  const cleaned = text.replace(/(\r\n|\n|\r)/gm, ' ').replace(/\s+/g, ' ').trim();
  if (cleaned.length <= maxLength) return cleaned;
  return cleaned.slice(0, maxLength).trimEnd() + '...';
}

/**
 * Pure helper to build a nested reply hierarchy from a flat list of replies.
 */
export type NestedReply<T> = T & { replies: NestedReply<T>[] };

export function buildNestedReplies<T extends { id: string; parentId: string | null }>(
  replies: T[]
): NestedReply<T>[] {
  const map = new Map<string, NestedReply<T>>();
  const roots: NestedReply<T>[] = [];

  for (const item of replies) {
    map.set(item.id, { ...item, replies: [] });
  }

  for (const item of replies) {
    const current = map.get(item.id)!;
    if (item.parentId && map.has(item.parentId)) {
      const parent = map.get(item.parentId)!;
      parent.replies.push(current);
    } else {
      roots.push(current);
    }
  }

  return roots;
}

export class ForumService {
  /**
   * Retrieves paginated top-level forum discussion posts with author and species context.
   */
  public async getPosts(options: GetPostsOptions = {}): Promise<PaginatedPostsResponse> {
    const page = Math.max(1, Number(options.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(options.limit) || 20));
    const skip = (page - 1) * limit;

    const where: any = {
      parentId: null, // Only top-level posts in thread directory
    };

    if (options.speciesId !== undefined && options.speciesId !== null && !isNaN(Number(options.speciesId))) {
      where.speciesId = Number(options.speciesId);
    }

    if (options.search && typeof options.search === 'string' && options.search.trim()) {
      const query = options.search.trim();
      where.OR = [
        { title: { contains: query, mode: 'insensitive' } },
        { body: { contains: query, mode: 'insensitive' } },
      ];
    }

    let orderBy: any = { createdAt: 'desc' };
    if (options.sortBy === 'upvotes') {
      orderBy = { upvotes: 'desc' };
    } else if (options.sortBy === 'replies') {
      orderBy = { replies: { _count: 'desc' } };
    }

    const [rawPosts, total] = await Promise.all([
      prisma.forumPost.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          author: {
            select: {
              id: true,
              displayName: true,
              avatarUrl: true,
              role: true,
            },
          },
          species: {
            select: {
              id: true,
              commonName: true,
              scientificName: true,
              family: true,
            },
          },
          _count: {
            select: { replies: true },
          },
        },
      }),
      prisma.forumPost.count({ where }),
    ]);

    const posts: ForumPostItem[] = rawPosts.map((post) => ({
      id: post.id,
      authorId: post.authorId,
      parentId: post.parentId,
      speciesId: post.speciesId,
      title: post.title,
      body: post.body,
      upvotes: post.upvotes,
      replyCount: post._count.replies,
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString(),
      author: post.author,
      species: post.species,
    }));

    return {
      posts,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  /**
   * Retrieves a full discussion thread including root post, metadata, and nested replies.
   */
  public async getThread(postId: string): Promise<ForumThreadItem> {
    if (!postId || typeof postId !== 'string') {
      throw new ValidationError('A valid post ID is required.');
    }

    const post = await prisma.forumPost.findUnique({
      where: { id: postId },
      include: {
        author: {
          select: {
            id: true,
            displayName: true,
            avatarUrl: true,
            role: true,
          },
        },
        species: {
          select: {
            id: true,
            commonName: true,
            scientificName: true,
            family: true,
          },
        },
        _count: {
          select: { replies: true },
        },
        replies: {
          orderBy: { createdAt: 'asc' },
          include: {
            author: {
              select: {
                id: true,
                displayName: true,
                avatarUrl: true,
                role: true,
              },
            },
            replies: {
              orderBy: { createdAt: 'asc' },
              include: {
                author: {
                  select: {
                    id: true,
                    displayName: true,
                    avatarUrl: true,
                    role: true,
                  },
                },
                replies: {
                  orderBy: { createdAt: 'asc' },
                  include: {
                    author: {
                      select: {
                        id: true,
                        displayName: true,
                        avatarUrl: true,
                        role: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!post) {
      throw new NotFoundError(`Discussion thread with ID '${postId}' was not found.`);
    }

    const mapReply = (reply: any): ForumThreadReply => ({
      id: reply.id,
      authorId: reply.authorId,
      parentId: reply.parentId,
      speciesId: reply.speciesId,
      title: reply.title,
      body: reply.body,
      upvotes: reply.upvotes,
      createdAt: reply.createdAt.toISOString(),
      updatedAt: reply.updatedAt.toISOString(),
      author: reply.author,
      replies: reply.replies ? reply.replies.map(mapReply) : [],
    });

    return {
      id: post.id,
      authorId: post.authorId,
      parentId: post.parentId,
      speciesId: post.speciesId,
      title: post.title,
      body: post.body,
      upvotes: post.upvotes,
      replyCount: post._count.replies,
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString(),
      author: post.author,
      species: post.species,
      replies: post.replies.map(mapReply),
    };
  }

  /**
   * Creates a new top-level community discussion post.
   */
  public async createPost(authorId: string, data: CreatePostInput): Promise<ForumPostItem> {
    if (!authorId) {
      throw new ValidationError('Author ID is required to create a forum post.');
    }

    const validation = validatePostInput(data.title, data.body);
    if (!validation.valid) {
      throw new ValidationError(validation.errors[0]);
    }

    const title = data.title.trim();
    const body = data.body.trim();

    let speciesIdToLink: number | null = null;
    if (data.speciesId !== undefined && data.speciesId !== null && !isNaN(Number(data.speciesId))) {
      const species = await prisma.species.findUnique({
        where: { id: Number(data.speciesId) },
        select: { id: true },
      });
      if (species) {
        speciesIdToLink = species.id;
      }
    }

    const post = await prisma.forumPost.create({
      data: {
        authorId,
        title,
        body,
        speciesId: speciesIdToLink,
        parentId: null,
      },
      include: {
        author: {
          select: {
            id: true,
            displayName: true,
            avatarUrl: true,
            role: true,
          },
        },
        species: {
          select: {
            id: true,
            commonName: true,
            scientificName: true,
            family: true,
          },
        },
      },
    });

    return {
      id: post.id,
      authorId: post.authorId,
      parentId: post.parentId,
      speciesId: post.speciesId,
      title: post.title,
      body: post.body,
      upvotes: post.upvotes,
      replyCount: 0,
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString(),
      author: post.author,
      species: post.species,
    };
  }

  /**
   * Posts a reply to an existing post or reply thread.
   */
  public async reply(authorId: string, parentId: string, bodyContent: string): Promise<ForumThreadReply> {
    if (!authorId) {
      throw new ValidationError('Author ID is required to submit a reply.');
    }
    if (!parentId || typeof parentId !== 'string') {
      throw new ValidationError('Parent post ID is required.');
    }

    const validation = validateReplyInput(bodyContent);
    if (!validation.valid) {
      throw new ValidationError(validation.errors[0]);
    }
    const body = bodyContent.trim();

    const parent = await prisma.forumPost.findUnique({
      where: { id: parentId },
      select: { id: true, authorId: true, speciesId: true },
    });

    if (!parent) {
      throw new NotFoundError(`Parent post with ID '${parentId}' was not found.`);
    }

    const replyPost = await prisma.forumPost.create({
      data: {
        authorId,
        parentId,
        body,
        speciesId: parent.speciesId, // Inherit linked species from thread parent
      },
      include: {
        author: {
          select: {
            id: true,
            displayName: true,
            avatarUrl: true,
            role: true,
          },
        },
      },
    });

    // Create an in-app notification for the author of the parent post if someone else replies
    if (parent.authorId !== authorId) {
      try {
        await prisma.notification.create({
          data: {
            userId: parent.authorId,
            type: 'FORUM_REPLY',
            message: `${replyPost.author.displayName} replied to your forum post.`,
            data: {
              postId: parent.id,
              replyId: replyPost.id,
            },
          },
        });
      } catch {
        // Non-blocking notification creation
      }
    }

    return {
      id: replyPost.id,
      authorId: replyPost.authorId,
      parentId: replyPost.parentId,
      speciesId: replyPost.speciesId,
      title: replyPost.title,
      body: replyPost.body,
      upvotes: replyPost.upvotes,
      createdAt: replyPost.createdAt.toISOString(),
      updatedAt: replyPost.updatedAt.toISOString(),
      author: replyPost.author,
      replies: [],
    };
  }

  /**
   * Increments the upvote counter for a forum post or reply.
   */
  public async upvote(postId: string): Promise<{ id: string; upvotes: number }> {
    if (!postId || typeof postId !== 'string') {
      throw new ValidationError('A valid post ID is required to upvote.');
    }

    const existing = await prisma.forumPost.findUnique({
      where: { id: postId },
      select: { id: true },
    });

    if (!existing) {
      throw new NotFoundError(`Post with ID '${postId}' was not found.`);
    }

    const updated = await prisma.forumPost.update({
      where: { id: postId },
      data: {
        upvotes: { increment: 1 },
      },
      select: {
        id: true,
        upvotes: true,
      },
    });

    return updated;
  }
}

export const forumService = new ForumService();
export default forumService;
