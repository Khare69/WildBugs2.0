import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  formatRelativeTime,
  truncateSnippet,
  countTotalReplies,
  filterPostsByKeyword,
} from './forumUtils.ts';

describe('Forum Frontend Logic Unit Tests', () => {
  it('formats relative timestamps accurately', () => {
    const fixedNow = new Date('2026-10-20T12:00:00.000Z');

    // 20 seconds ago -> 'just now'
    const justNow = formatRelativeTime('2026-10-20T11:59:40.000Z', fixedNow);
    assert.equal(justNow, 'just now');

    // 15 minutes ago -> '15m ago'
    const minsAgo = formatRelativeTime('2026-10-20T11:45:00.000Z', fixedNow);
    assert.equal(minsAgo, '15m ago');

    // 4 hours ago -> '4h ago'
    const hoursAgo = formatRelativeTime('2026-10-20T08:00:00.000Z', fixedNow);
    assert.equal(hoursAgo, '4h ago');

    // 3 days ago -> '3d ago'
    const daysAgo = formatRelativeTime('2026-10-17T12:00:00.000Z', fixedNow);
    assert.equal(daysAgo, '3d ago');

    // Invalid input
    assert.equal(formatRelativeTime(''), '');
    assert.equal(formatRelativeTime('invalid-date'), '');
  });

  it('truncates text snippets and flattens newlines', () => {
    const raw = `Observing insect behavior in the field
    requires patience and stillness.`;
    const snippet = truncateSnippet(raw, 30);
    assert.equal(snippet.includes('\n'), false);
    assert.ok(snippet.endsWith('...'));
    assert.ok(snippet.length <= 33);

    const full = truncateSnippet('Short text', 50);
    assert.equal(full, 'Short text');
    assert.equal(truncateSnippet(''), '');
  });

  it('recursively counts nested replies in a thread tree', () => {
    assert.equal(countTotalReplies([]), 0);
    assert.equal(countTotalReplies(undefined), 0);

    const tree = [
      {
        id: '1',
        replies: [
          {
            id: '1-1',
            replies: [
              { id: '1-1-1' },
            ],
          },
        ],
      },
      {
        id: '2',
        replies: [],
      },
    ];

    // Total replies = 2 top-level + 1 child + 1 grandchild = 4
    assert.equal(countTotalReplies(tree), 4);
  });

  it('filters forum posts by keyword in title, body, or author name', () => {
    const samplePosts = [
      {
        id: 'p1',
        title: 'Monarch butterfly migration',
        body: 'Spotted in forest glade yesterday afternoon.',
        author: { displayName: 'Alice Explorer' },
      },
      {
        id: 'p2',
        title: 'Dragonfly wing morphology',
        body: 'Notice the double venation patterns near the tip.',
        author: { displayName: 'Bob Odonata' },
      },
      {
        id: 'p3',
        title: 'Stag beetle burrowing habits',
        body: 'Found under decaying oak logs in wet moss.',
        author: { displayName: 'Carol Beetles' },
      },
    ];

    // Empty query returns all posts
    assert.equal(filterPostsByKeyword(samplePosts, '').length, 3);

    // Title match
    const monarchMatches = filterPostsByKeyword(samplePosts, 'monarch');
    assert.equal(monarchMatches.length, 1);
    assert.equal(monarchMatches[0].id, 'p1');

    // Body match
    const oakMatches = filterPostsByKeyword(samplePosts, 'decaying oak');
    assert.equal(oakMatches.length, 1);
    assert.equal(oakMatches[0].id, 'p3');

    // Author match
    const bobMatches = filterPostsByKeyword(samplePosts, 'bob');
    assert.equal(bobMatches.length, 1);
    assert.equal(bobMatches[0].id, 'p2');
  });
});
