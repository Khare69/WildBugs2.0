import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import type { ForumPost } from '../../types/forum';
import { formatRelativeTime, truncateSnippet } from './forumUtils';

interface ForumPostCardProps {
  post: ForumPost;
  onUpvote?: (postId: string) => Promise<void> | void;
  isDetailView?: boolean;
}

export const ForumPostCard: React.FC<ForumPostCardProps> = ({
  post,
  onUpvote,
  isDetailView = false,
}) => {
  const [upvotes, setUpvotes] = useState(post.upvotes);
  const [hasUpvoted, setHasUpvoted] = useState(false);
  const [isUpvoting, setIsUpvoting] = useState(false);

  const handleUpvote = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (hasUpvoted || isUpvoting) return;

    try {
      setIsUpvoting(true);
      setUpvotes((prev) => prev + 1);
      setHasUpvoted(true);
      if (onUpvote) {
        await onUpvote(post.id);
      }
    } catch {
      setUpvotes((prev) => prev - 1);
      setHasUpvoted(false);
    } finally {
      setIsUpvoting(false);
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role?.toUpperCase()) {
      case 'EXPERT':
        return <span className="role-tag role-expert">🛡️ Expert Naturalist</span>;
      case 'ADMIN':
        return <span className="role-tag role-admin">⚡ Staff</span>;
      default:
        return <span className="role-tag role-user">🌱 Explorer</span>;
    }
  };

  const avatarInitial = post.author?.displayName
    ? post.author.displayName.charAt(0).toUpperCase()
    : 'N';

  return (
    <article className={`forum-post-card ${isDetailView ? 'forum-post-card--detail' : ''}`}>
      <div className="forum-post-card__header">
        <div className="forum-post-card__author">
          {post.author?.avatarUrl ? (
            <img
              src={post.author.avatarUrl}
              alt={post.author.displayName}
              className="forum-post-card__avatar-img"
            />
          ) : (
            <div className="forum-post-card__avatar-placeholder">{avatarInitial}</div>
          )}
          <div className="forum-post-card__author-info">
            <div className="forum-post-card__author-line">
              <span className="forum-post-card__author-name">
                {post.author?.displayName || 'Anonymous Naturalist'}
              </span>
              {getRoleBadge(post.author?.role)}
            </div>
            <time className="forum-post-card__time" dateTime={post.createdAt}>
              {formatRelativeTime(post.createdAt)}
            </time>
          </div>
        </div>

        {post.species && (
          <Link
            to={`/species/${post.species.id}`}
            className="forum-species-tag"
            title={`View ${post.species.commonName}`}
            onClick={(e) => e.stopPropagation()}
          >
            <span className="forum-species-tag__icon">🐞</span>
            <span className="forum-species-tag__name">{post.species.commonName}</span>
            <span className="forum-species-tag__sci">({post.species.scientificName})</span>
          </Link>
        )}
      </div>

      <div className="forum-post-card__content">
        {post.title && (
          <h3 className="forum-post-card__title">
            {isDetailView ? (
              post.title
            ) : (
              <Link to={`/forum/${post.id}`} className="forum-post-card__title-link">
                {post.title}
              </Link>
            )}
          </h3>
        )}

        <div className="forum-post-card__body">
          {isDetailView ? (
            <p className="forum-post-card__text">{post.body}</p>
          ) : (
            <p className="forum-post-card__snippet">
              {truncateSnippet(post.body, 180)}
            </p>
          )}
        </div>
      </div>

      <div className="forum-post-card__footer">
        <div className="forum-post-card__actions">
          <button
            type="button"
            className={`forum-action-btn forum-upvote-btn ${
              hasUpvoted ? 'forum-upvote-btn--active' : ''
            }`}
            onClick={handleUpvote}
            disabled={isUpvoting || hasUpvoted}
            title={hasUpvoted ? 'You upvoted this post' : 'Upvote discussion'}
          >
            <span className="forum-upvote-btn__icon">▲</span>
            <span className="forum-upvote-btn__count">{upvotes}</span>
            <span className="forum-upvote-btn__label">Upvotes</span>
          </button>

          {!isDetailView && (
            <Link to={`/forum/${post.id}`} className="forum-action-btn forum-replies-btn">
              <span className="forum-replies-btn__icon">💬</span>
              <span className="forum-replies-btn__count">{post.replyCount || 0}</span>
              <span className="forum-replies-btn__label">
                {post.replyCount === 1 ? 'Reply' : 'Replies'}
              </span>
            </Link>
          )}
        </div>

        {!isDetailView && (
          <Link to={`/forum/${post.id}`} className="forum-post-card__view-link">
            Join Discussion →
          </Link>
        )}
      </div>
    </article>
  );
};

export default ForumPostCard;
