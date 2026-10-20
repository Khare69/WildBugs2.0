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

export interface ForumPost {
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

export interface ForumReply {
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
  replies?: ForumReply[];
}

export interface ForumThread extends ForumPost {
  replies: ForumReply[];
}

export interface PaginatedPosts {
  posts: ForumPost[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreatePostPayload {
  title: string;
  body: string;
  speciesId?: number;
}

export interface CreateReplyPayload {
  body: string;
}
