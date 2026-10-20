import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import forumApi from '../api/forumApi';
import speciesApi from '../api/speciesApi';
import useAuthStore from '../store/authStore';
import ForumPostCard from '../components/community/ForumPostCard';
import ForumEditor from '../components/community/ForumEditor';
import type { ForumPost } from '../types/forum';
import type { Species } from '../types/species';

export const ForumPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuthStore();

  const [page, setPage] = useState(1);
  const [selectedSpeciesId, setSelectedSpeciesId] = useState<number | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'recent' | 'upvotes' | 'replies'>('recent');
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);

  // Load species for filter dropdown
  const { data: speciesData } = useQuery({
    queryKey: ['species-filter-options'],
    queryFn: () => speciesApi.getSpecies({ limit: 100 }),
    staleTime: 1000 * 60 * 10,
  });

  const speciesOptions: Species[] = speciesData?.data || [];

  // Query discussion threads
  const {
    data: forumData,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['forum-posts', page, selectedSpeciesId, searchQuery, sortBy],
    queryFn: () =>
      forumApi.getPosts({
        page,
        limit: 12,
        speciesId: selectedSpeciesId,
        search: searchQuery.trim() || undefined,
        sortBy,
      }),
  });

  // Mutation for creating a new post
  const createPostMutation = useMutation({
    mutationFn: (newPostData: { title: string; body: string; speciesId?: number }) =>
      forumApi.createPost(newPostData),
    onSuccess: () => {
      setIsCreatingPost(false);
      setNotificationMsg('🎉 Discussion published successfully!');
      setTimeout(() => setNotificationMsg(null), 4000);
      queryClient.invalidateQueries({ queryKey: ['forum-posts'] });
    },
  });

  const handleUpvote = async (postId: string) => {
    try {
      await forumApi.upvotePost(postId);
      queryClient.invalidateQueries({ queryKey: ['forum-posts'] });
    } catch {
      // Non-blocking upvote failure
    }
  };

  const posts = forumData?.posts || [];
  const totalPages = forumData?.totalPages || 1;

  return (
    <div className="forum-page">
      <header className="forum-page__header">
        <div className="forum-page__header-content">
          <div className="forum-page__badge">👥 Community Discussions</div>
          <h1 className="forum-page__title">Entomological Field Forum</h1>
          <p className="forum-page__subtitle">
            Share field observations, seek taxonomic identifications, debate insect behaviors, and
            collaborate on BioBlitz expeditions with fellow naturalists.
          </p>
        </div>

        <div className="forum-page__header-actions">
          {isAuthenticated ? (
            <button
              type="button"
              className="btn btn-primary forum-new-post-btn"
              onClick={() => setIsCreatingPost((prev) => !prev)}
            >
              {isCreatingPost ? '✕ Close Editor' : '✏️ Start New Discussion'}
            </button>
          ) : (
            <Link to="/login" className="btn btn-secondary">
              🔒 Sign In to Post
            </Link>
          )}
        </div>
      </header>

      {notificationMsg && (
        <div className="forum-toast-notification" role="status">
          {notificationMsg}
        </div>
      )}

      {isCreatingPost && (
        <section className="forum-editor-wrapper">
          <div className="forum-editor-header">
            <h2>Start a New Discussion Thread</h2>
            <p>Ask a question, report a rare finding, or start a taxonomy discussion.</p>
          </div>
          <ForumEditor
            mode="post"
            isSubmitting={createPostMutation.isPending}
            onSubmitPost={async (data) => {
              await createPostMutation.mutateAsync(data);
            }}
            onCancel={() => setIsCreatingPost(false)}
          />
        </section>
      )}

      {/* Filter and Search Bar */}
      <section className="forum-controls-bar">
        <div className="forum-search-box">
          <span className="forum-search-icon">🔍</span>
          <input
            type="search"
            placeholder="Search discussions by topic or observation..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            className="forum-search-input"
          />
        </div>

        <div className="forum-filters-group">
          <select
            className="forum-select"
            value={selectedSpeciesId ?? ''}
            onChange={(e) => {
              setSelectedSpeciesId(e.target.value ? Number(e.target.value) : undefined);
              setPage(1);
            }}
            aria-label="Filter by species"
          >
            <option value="">All Species</option>
            {speciesOptions.map((sp) => (
              <option key={sp.id} value={sp.id}>
                {sp.commonName}
              </option>
            ))}
          </select>

          <div className="forum-sort-tabs">
            <button
              type="button"
              className={`forum-sort-tab ${sortBy === 'recent' ? 'forum-sort-tab--active' : ''}`}
              onClick={() => {
                setSortBy('recent');
                setPage(1);
              }}
            >
              Latest
            </button>
            <button
              type="button"
              className={`forum-sort-tab ${sortBy === 'upvotes' ? 'forum-sort-tab--active' : ''}`}
              onClick={() => {
                setSortBy('upvotes');
                setPage(1);
              }}
            >
              Top Upvoted
            </button>
            <button
              type="button"
              className={`forum-sort-tab ${sortBy === 'replies' ? 'forum-sort-tab--active' : ''}`}
              onClick={() => {
                setSortBy('replies');
                setPage(1);
              }}
            >
              Most Replies
            </button>
          </div>
        </div>
      </section>

      {/* Main Discussions List */}
      <main className="forum-posts-container">
        {isLoading ? (
          <div className="forum-loading-skeleton">
            <div className="forum-skeleton-card" />
            <div className="forum-skeleton-card" />
            <div className="forum-skeleton-card" />
          </div>
        ) : isError ? (
          <div className="forum-error-card">
            <h3>⚠️ Unable to load discussions</h3>
            <p>We encountered an error loading the community discussions.</p>
            <button type="button" className="btn btn-secondary" onClick={() => refetch()}>
              Try Again
            </button>
          </div>
        ) : posts.length === 0 ? (
          <div className="forum-empty-card">
            <div className="forum-empty-card__icon">🌿</div>
            <h3>No Discussions Found</h3>
            <p>
              {searchQuery || selectedSpeciesId
                ? 'No threads matched your active search filters. Try clearing them to see all posts.'
                : 'The community forum is waiting for its first observation thread!'}
            </p>
            {isAuthenticated ? (
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setIsCreatingPost(true)}
              >
                Start First Discussion
              </button>
            ) : (
              <Link to="/login" className="btn btn-primary">
                Sign In to Post
              </Link>
            )}
          </div>
        ) : (
          <div className="forum-posts-list">
            {posts.map((post: ForumPost) => (
              <ForumPostCard key={post.id} post={post} onUpvote={handleUpvote} />
            ))}
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <nav className="forum-pagination" aria-label="Discussions pagination">
            <button
              type="button"
              className="forum-pagination__btn"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              ← Previous
            </button>
            <span className="forum-pagination__info">
              Page <strong>{page}</strong> of <strong>{totalPages}</strong>
            </span>
            <button
              type="button"
              className="forum-pagination__btn"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Next →
            </button>
          </nav>
        )}
      </main>
    </div>
  );
};

export default ForumPage;
