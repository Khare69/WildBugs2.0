import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import forumApi from '../api/forumApi';
import useAuthStore from '../store/authStore';
import ForumPostCard from '../components/community/ForumPostCard';
import ForumEditor from '../components/community/ForumEditor';
import { formatRelativeTime, countTotalReplies } from '../components/community/forumUtils';
import type { ForumReply } from '../types/forum';

interface ReplyNodeProps {
  reply: ForumReply;
  onReplySubmit: (parentId: string, body: string) => Promise<void>;
  onUpvote: (replyId: string) => Promise<void>;
  isAuthenticated: boolean;
  depth?: number;
}

const ReplyNode: React.FC<ReplyNodeProps> = ({
  reply,
  onReplySubmit,
  onUpvote,
  isAuthenticated,
  depth = 0,
}) => {
  const [isReplying, setIsReplying] = useState(false);
  const [upvotes, setUpvotes] = useState(reply.upvotes);
  const [hasUpvoted, setHasUpvoted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleUpvote = async () => {
    if (hasUpvoted) return;
    setUpvotes((prev: number) => prev + 1);
    setHasUpvoted(true);
    try {
      await onUpvote(reply.id);
    } catch {
      setUpvotes((prev: number) => prev - 1);
      setHasUpvoted(false);
    }
  };

  const handleNestedReply = async (data: { body: string }) => {
    try {
      setIsSubmitting(true);
      await onReplySubmit(reply.id, data.body);
      setIsReplying(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const avatarInitial = reply.author?.displayName
    ? reply.author.displayName.charAt(0).toUpperCase()
    : 'N';

  const roleBadge = () => {
    switch (reply.author?.role?.toUpperCase()) {
      case 'EXPERT':
        return <span className="role-tag role-expert">🛡️ Expert</span>;
      case 'ADMIN':
        return <span className="role-tag role-admin">⚡ Staff</span>;
      default:
        return null;
    }
  };

  return (
    <div className={`forum-reply-node ${depth > 0 ? 'forum-reply-node--nested' : ''}`}>
      <div className="forum-reply-card">
        <div className="forum-reply-card__header">
          {reply.author?.avatarUrl ? (
            <img
              src={reply.author.avatarUrl}
              alt={reply.author.displayName}
              className="forum-reply-card__avatar"
            />
          ) : (
            <div className="forum-reply-card__avatar-placeholder">{avatarInitial}</div>
          )}
          <div className="forum-reply-card__author-info">
            <span className="forum-reply-card__author-name">
              {reply.author?.displayName || 'Naturalist'}
            </span>
            {roleBadge()}
            <time className="forum-reply-card__time" dateTime={reply.createdAt}>
              {formatRelativeTime(reply.createdAt)}
            </time>
          </div>
        </div>

        <div className="forum-reply-card__body">
          <p>{reply.body}</p>
        </div>

        <div className="forum-reply-card__footer">
          <button
            type="button"
            className={`forum-reply-upvote-btn ${hasUpvoted ? 'forum-reply-upvote-btn--active' : ''}`}
            onClick={handleUpvote}
            disabled={hasUpvoted || !isAuthenticated}
            title={isAuthenticated ? 'Upvote reply' : 'Sign in to upvote'}
          >
            ▲ {upvotes}
          </button>

          {isAuthenticated ? (
            <button
              type="button"
              className="forum-reply-action-btn"
              onClick={() => setIsReplying((prev) => !prev)}
            >
              {isReplying ? 'Cancel' : '💬 Reply'}
            </button>
          ) : (
            <Link to="/login" className="forum-reply-action-link">
              Sign in to reply
            </Link>
          )}
        </div>
      </div>

      {isReplying && (
        <div className="forum-reply-inline-editor">
          <ForumEditor
            mode="reply"
            parentAuthorName={reply.author?.displayName}
            isSubmitting={isSubmitting}
            onSubmitReply={handleNestedReply}
            onCancel={() => setIsReplying(false)}
          />
        </div>
      )}

      {/* Nested Replies Rendering */}
      {reply.replies && reply.replies.length > 0 && (
        <div className="forum-reply-children">
          {reply.replies.map((childReply: ForumReply) => (
            <ReplyNode
              key={childReply.id}
              reply={childReply}
              onReplySubmit={onReplySubmit}
              onUpvote={onUpvote}
              isAuthenticated={isAuthenticated}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const ForumThreadPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuthStore();

  const {
    data: thread,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['forum-thread', id],
    queryFn: () => (id ? forumApi.getThread(id) : Promise.reject('No ID')),
    enabled: !!id,
  });

  const replyMutation = useMutation({
    mutationFn: ({ parentId, body }: { parentId: string; body: string }) =>
      forumApi.replyToPost(parentId, { body }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forum-thread', id] });
    },
  });

  const handleRootReply = async (data: { body: string }) => {
    if (!id) return;
    await replyMutation.mutateAsync({ parentId: id, body: data.body });
  };

  const handleNestedReplySubmit = async (parentId: string, body: string) => {
    await replyMutation.mutateAsync({ parentId, body });
  };

  const handleUpvote = async (postId: string) => {
    try {
      await forumApi.upvotePost(postId);
      queryClient.invalidateQueries({ queryKey: ['forum-thread', id] });
    } catch {
      // Non-blocking upvote failure
    }
  };

  if (isLoading) {
    return (
      <div className="forum-thread-page forum-thread-page--loading">
        <div className="forum-skeleton-card" style={{ height: '220px' }} />
        <div className="forum-skeleton-card" style={{ height: '140px', marginTop: '1.5rem' }} />
      </div>
    );
  }

  if (isError || !thread) {
    return (
      <div className="forum-thread-page">
        <Link to="/forum" className="forum-back-link">
          ← Back to Forum
        </Link>
        <div className="forum-error-card">
          <h2>⚠️ Discussion Thread Not Found</h2>
          <p>This discussion thread may have been removed or does not exist.</p>
          <button type="button" className="btn btn-secondary" onClick={() => refetch()}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  const totalReplies = countTotalReplies(thread.replies);

  return (
    <div className="forum-thread-page">
      <nav className="forum-thread-nav" aria-label="Breadcrumb">
        <Link to="/forum" className="forum-back-link">
          ← Back to Forum Discussions
        </Link>
      </nav>

      {/* Main Root Discussion Post */}
      <section className="forum-thread-root">
        <ForumPostCard post={thread} onUpvote={handleUpvote} isDetailView={true} />
      </section>

      {/* Replies & Comments Section */}
      <section className="forum-thread-discussion">
        <div className="forum-thread-discussion__header">
          <h2 className="forum-thread-discussion__title">
            Discussion ({totalReplies} {totalReplies === 1 ? 'Reply' : 'Replies'})
          </h2>
        </div>

        {/* Quick Root Reply Editor */}
        <div className="forum-thread-reply-box">
          {isAuthenticated ? (
            <div className="forum-root-reply-wrapper">
              <h3 className="forum-reply-box-title">Add Your Observation or Answer</h3>
              <ForumEditor
                mode="reply"
                isSubmitting={replyMutation.isPending}
                onSubmitReply={handleRootReply}
              />
            </div>
          ) : (
            <div className="forum-auth-prompt-card">
              <p>Join the naturalist community conversation.</p>
              <Link to="/login" className="btn btn-primary btn-sm">
                Sign In to Post a Reply
              </Link>
            </div>
          )}
        </div>

        {/* Replies Tree */}
        <div className="forum-replies-tree">
          {thread.replies && thread.replies.length > 0 ? (
            thread.replies.map((reply: ForumReply) => (
              <ReplyNode
                key={reply.id}
                reply={reply}
                onReplySubmit={handleNestedReplySubmit}
                onUpvote={handleUpvote}
                isAuthenticated={isAuthenticated}
              />
            ))
          ) : (
            <div className="forum-replies-empty">
              <span className="forum-replies-empty__icon">💭</span>
              <p>No replies yet. Be the first to share your thoughts!</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default ForumThreadPage;
