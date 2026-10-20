import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  validatePostInput,
  validateReplyInput,
  formatPostSnippet,
  buildNestedReplies,
} from '../../../src/services/forumService';

describe('ForumService Unit Tests', () => {
  it('validates discussion post inputs correctly', () => {
    // Valid input
    const valid = validatePostInput('Monarch Migration Patterns', 'Have you observed Monarch butterflies migrating south this week?');
    assert.equal(valid.valid, true);
    assert.equal(valid.errors.length, 0);

    // Empty title
    const emptyTitle = validatePostInput('', 'Some valid body content here');
    assert.equal(emptyTitle.valid, false);
    assert.match(emptyTitle.errors[0], /title is required/i);

    // Too short title
    const shortTitle = validatePostInput('Hi', 'Some valid body content here');
    assert.equal(shortTitle.valid, false);
    assert.match(shortTitle.errors[0], /at least 3 characters/i);

    // Too long title
    const longTitle = validatePostInput('A'.repeat(201), 'Some valid body content here');
    assert.equal(longTitle.valid, false);
    assert.match(longTitle.errors[0], /cannot exceed 200/i);

    // Too short body
    const shortBody = validatePostInput('Valid Title', 'Hi');
    assert.equal(shortBody.valid, false);
    assert.match(shortBody.errors[0], /at least 5 characters/i);
  });

  it('validates reply inputs correctly', () => {
    // Valid reply
    const valid = validateReplyInput('I spotted three monarchs in Seattle!');
    assert.equal(valid.valid, true);
    assert.equal(valid.errors.length, 0);

    // Empty reply
    const empty = validateReplyInput('   ');
    assert.equal(empty.valid, false);
    assert.match(empty.errors[0], /cannot be empty/i);

    // Too long reply
    const tooLong = validateReplyInput('X'.repeat(5001));
    assert.equal(tooLong.valid, false);
    assert.match(tooLong.errors[0], /cannot exceed 5000/i);
  });

  it('formats text snippets and cleans whitespace correctly', () => {
    const raw = `
      This is a multi-line
      discussion   post with 
      excessive     spaces.
    `;
    const snippet = formatPostSnippet(raw, 40);
    assert.equal(snippet.includes('\n'), false);
    assert.ok(snippet.endsWith('...'));
    assert.ok(snippet.length <= 43);

    const short = formatPostSnippet('Short message', 50);
    assert.equal(short, 'Short message');
  });

  it('builds nested reply hierarchy from flat reply list', () => {
    const flatList = [
      { id: 'reply-1', parentId: null, body: 'Top level reply' },
      { id: 'reply-2', parentId: 'reply-1', body: 'Nested reply to 1' },
      { id: 'reply-3', parentId: 'reply-2', body: 'Deeply nested reply to 2' },
      { id: 'reply-4', parentId: null, body: 'Second top level reply' },
    ];

    const hierarchy = buildNestedReplies(flatList);

    assert.equal(hierarchy.length, 2);
    assert.equal(hierarchy[0].id, 'reply-1');
    assert.equal(hierarchy[0].replies?.length, 1);
    assert.equal(hierarchy[0].replies?.[0].id, 'reply-2');
    assert.equal(hierarchy[0].replies?.[0].replies?.length, 1);
    assert.equal(hierarchy[0].replies?.[0].replies?.[0].id, 'reply-3');

    assert.equal(hierarchy[1].id, 'reply-4');
    assert.equal(hierarchy[1].replies?.length, 0);
  });
});
