import apiClient from './client';
import type {
  ForumPost,
  ForumReply,
  ForumThread,
  PaginatedPosts,
  CreatePostPayload,
  CreateReplyPayload,
} from '../types/forum';

export const forumApi = {
  /**
   * Fetch paginated top-level forum discussion posts with optional species and search filters
   */
  async getPosts(params?: {
    page?: number;
    limit?: number;
    speciesId?: number;
    search?: string;
    sortBy?: 'recent' | 'upvotes' | 'replies';
  }): Promise<PaginatedPosts> {
    const response = await apiClient.get<{ status: string; data: PaginatedPosts }>('/forum/posts', {
      params,
    });
    return response.data.data;
  },

  /**
   * Fetch a full thread with its author, species, and nested replies
   */
  async getThread(id: string): Promise<ForumThread> {
    const response = await apiClient.get<{ status: string; data: ForumThread }>(`/forum/posts/${id}`);
    return response.data.data;
  },

  /**
   * Create a new top-level community discussion thread
   */
  async createPost(payload: CreatePostPayload): Promise<ForumPost> {
    const response = await apiClient.post<{ status: string; data: ForumPost }>('/forum/posts', payload);
    return response.data.data;
  },

  /**
   * Post a reply to an existing post or nested reply
   */
  async replyToPost(postId: string, payload: CreateReplyPayload): Promise<ForumReply> {
    const response = await apiClient.post<{ status: string; data: ForumReply }>(
      `/forum/posts/${postId}/reply`,
      payload
    );
    return response.data.data;
  },

  /**
   * Upvote a discussion post or reply
   */
  async upvotePost(postId: string): Promise<{ id: string; upvotes: number }> {
    const response = await apiClient.post<{ status: string; data: { id: string; upvotes: number } }>(
      `/forum/posts/${postId}/upvote`
    );
    return response.data.data;
  },
};

export default forumApi;
