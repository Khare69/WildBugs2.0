/**
 * Pure utility functions for the community forum logic, testable in headless node environments.
 */

export interface BaseReply {
  id: string;
  replies?: BaseReply[];
}

/**
 * Formats an ISO date string into human-readable relative time (e.g. '5m ago', '2h ago').
 */
export function formatRelativeTime(isoString: string, now: Date = new Date()): string {
  if (!isoString) return '';
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return '';

  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);

  if (diffSec < 45) return 'just now';
  if (diffSec < 3600) {
    const mins = Math.floor(diffSec / 60);
    return `${mins}m ago`;
  }
  if (diffSec < 86400) {
    const hours = Math.floor(diffSec / 3600);
    return `${hours}h ago`;
  }
  const days = Math.floor(diffSec / 86400);
  if (days < 30) {
    return `${days}d ago`;
  }

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
}

/**
 * Truncates text cleanly for post snippets, stripping extra newlines and spaces.
 */
export function truncateSnippet(text: string, maxLength: number = 140): string {
  if (!text) return '';
  const cleaned = text.replace(/(\r\n|\n|\r)/gm, ' ').replace(/\s+/g, ' ').trim();
  if (cleaned.length <= maxLength) return cleaned;
  return cleaned.slice(0, maxLength).trimEnd() + '...';
}

/**
 * Recursively counts all replies (including nested replies) in a reply tree.
 */
export function countTotalReplies(replies?: BaseReply[]): number {
  if (!replies || !Array.isArray(replies)) return 0;
  let count = replies.length;
  for (const reply of replies) {
    if (reply.replies && Array.isArray(reply.replies)) {
      count += countTotalReplies(reply.replies);
    }
  }
  return count;
}

/**
 * Filters posts locally by matching against title, body, or author displayName.
 */
export function filterPostsByKeyword<T extends { title?: string | null; body: string; author?: { displayName: string } }>(
  posts: T[],
  query: string
): T[] {
  if (!query || !query.trim()) return posts;
  const q = query.toLowerCase().trim();
  return posts.filter((p) => {
    const titleMatch = p.title?.toLowerCase().includes(q) ?? false;
    const bodyMatch = p.body.toLowerCase().includes(q);
    const authorMatch = p.author?.displayName.toLowerCase().includes(q) ?? false;
    return titleMatch || bodyMatch || authorMatch;
  });
}
