import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  isValidTitle,
  isValidDescription,
  isValidStatus,
  isValidPriority,
  isValidTaskUpdate,
  VALID_STATUSES,
  VALID_PRIORITIES,
  PRIORITY_ORDER,
  DEFAULT_STATUS,
  DEFAULT_PRIORITY,
} from '../src/utils/validators.js';

describe('constants', () => {
  it('VALID_STATUSES contains todo, in-progress, done', () => {
    assert.deepEqual(VALID_STATUSES, ['todo', 'in-progress', 'done']);
  });

  it('VALID_PRIORITIES contains low, medium, high', () => {
    assert.deepEqual(VALID_PRIORITIES, ['low', 'medium', 'high']);
  });

  it('PRIORITY_ORDER maps high < medium < low numerically', () => {
    assert.ok(PRIORITY_ORDER['high'] < PRIORITY_ORDER['medium']);
    assert.ok(PRIORITY_ORDER['medium'] < PRIORITY_ORDER['low']);
  });

  it('DEFAULT_STATUS is todo', () => {
    assert.equal(DEFAULT_STATUS, 'todo');
  });

  it('DEFAULT_PRIORITY is medium', () => {
    assert.equal(DEFAULT_PRIORITY, 'medium');
  });
});

describe('isValidTitle()', () => {
  it('returns true for a normal string', () => {
    assert.ok(isValidTitle('Buy milk'));
  });

  it('returns true for a single character', () => {
    assert.ok(isValidTitle('A'));
  });

  it('returns true for exactly 255 characters', () => {
    assert.ok(isValidTitle('a'.repeat(255)));
  });

  it('returns false for an empty string', () => {
    assert.equal(isValidTitle(''), false);
  });

  it('returns false for a string of 256 characters', () => {
    assert.equal(isValidTitle('a'.repeat(256)), false);
  });

  it('returns false for a non-string value', () => {
    assert.equal(isValidTitle(42), false);
    assert.equal(isValidTitle(null), false);
    assert.equal(isValidTitle(undefined), false);
  });
});

describe('isValidDescription()', () => {
  it('returns true for an empty string', () => {
    assert.ok(isValidDescription(''));
  });

  it('returns true for a normal string', () => {
    assert.ok(isValidDescription('A helpful description'));
  });

  it('returns true for exactly 1024 characters', () => {
    assert.ok(isValidDescription('x'.repeat(1024)));
  });

  it('returns false for 1025 characters', () => {
    assert.equal(isValidDescription('x'.repeat(1025)), false);
  });

  it('returns false for non-string values', () => {
    assert.equal(isValidDescription(123), false);
    assert.equal(isValidDescription(null), false);
  });
});

describe('isValidStatus()', () => {
  it('returns true for todo', () => {
    assert.ok(isValidStatus('todo'));
  });

  it('returns true for in-progress', () => {
    assert.ok(isValidStatus('in-progress'));
  });

  it('returns true for done', () => {
    assert.ok(isValidStatus('done'));
  });

  it('returns false for an unknown string', () => {
    assert.equal(isValidStatus('pending'), false);
  });

  it('returns false for empty string', () => {
    assert.equal(isValidStatus(''), false);
  });

  it('returns false for non-string values', () => {
    assert.equal(isValidStatus(null), false);
    assert.equal(isValidStatus(undefined), false);
  });
});

describe('isValidPriority()', () => {
  it('returns true for low', () => {
    assert.ok(isValidPriority('low'));
  });

  it('returns true for medium', () => {
    assert.ok(isValidPriority('medium'));
  });

  it('returns true for high', () => {
    assert.ok(isValidPriority('high'));
  });

  it('returns false for an unknown string', () => {
    assert.equal(isValidPriority('critical'), false);
  });

  it('returns false for empty string', () => {
    assert.equal(isValidPriority(''), false);
  });

  it('returns false for non-string values', () => {
    assert.equal(isValidPriority(null), false);
    assert.equal(isValidPriority(undefined), false);
  });
});

describe('isValidTaskUpdate()', () => {
  it('returns valid:true for an empty update object', () => {
    const result = isValidTaskUpdate({});
    assert.ok(result.valid);
    assert.deepEqual(result.errors, []);
  });

  it('returns valid:true when all fields are valid', () => {
    const result = isValidTaskUpdate({
      title: 'New title',
      description: 'New desc',
      status: 'done',
      priority: 'high',
    });
    assert.ok(result.valid);
    assert.deepEqual(result.errors, []);
  });

  it('returns valid:false with error for invalid title', () => {
    const result = isValidTaskUpdate({ title: '' });
    assert.equal(result.valid, false);
    assert.ok(result.errors.some(e => /Invalid title/.test(e)));
  });

  it('returns valid:false with error for title exceeding 255 characters', () => {
    const result = isValidTaskUpdate({ title: 'a'.repeat(256) });
    assert.equal(result.valid, false);
    assert.ok(result.errors.some(e => /Invalid title/.test(e)));
  });

  it('returns valid:false with error for description exceeding 1024 characters', () => {
    const result = isValidTaskUpdate({ description: 'x'.repeat(1025) });
    assert.equal(result.valid, false);
    assert.ok(result.errors.some(e => /Invalid description/.test(e)));
  });

  it('returns valid:false with error for invalid status', () => {
    const result = isValidTaskUpdate({ status: 'archived' });
    assert.equal(result.valid, false);
    assert.ok(result.errors.some(e => /Invalid status/.test(e)));
  });

  it('returns valid:false with error for invalid priority', () => {
    const result = isValidTaskUpdate({ priority: 'urgent' });
    assert.equal(result.valid, false);
    assert.ok(result.errors.some(e => /Invalid priority/.test(e)));
  });

  it('accumulates multiple errors', () => {
    const result = isValidTaskUpdate({ title: '', status: 'nope' });
    assert.equal(result.valid, false);
    assert.equal(result.errors.length, 2);
  });

  it('does not validate id, createdAt, or updatedAt fields', () => {
    const result = isValidTaskUpdate({ id: 'any-value', createdAt: 'anything' });
    assert.ok(result.valid);
  });
});

// ── Edge-case additions ────────────────────────────────────────────────────

describe('isValidTitle() — edge cases', () => {
  it('returns true for a whitespace-only string (validator itself does not trim)', () => {
    // Task.create() trims before calling isValidTitle; the validator checks raw length.
    assert.ok(isValidTitle('   '));
  });

  it('returns false for an array value', () => {
    assert.equal(isValidTitle([]), false);
  });

  it('returns false for an object value', () => {
    assert.equal(isValidTitle({}), false);
  });
});

describe('isValidDescription() — edge cases', () => {
  it('returns true for a whitespace-only string', () => {
    assert.ok(isValidDescription('   '));
  });

  it('returns false for an array value', () => {
    assert.equal(isValidDescription([]), false);
  });
});

describe('isValidStatus() — edge cases', () => {
  it('returns false for uppercase variant TODO', () => {
    assert.equal(isValidStatus('TODO'), false);
  });

  it('returns false for mixed-case variant In-Progress', () => {
    assert.equal(isValidStatus('In-Progress'), false);
  });
});

describe('isValidPriority() — edge cases', () => {
  it('returns false for uppercase variant HIGH', () => {
    assert.equal(isValidPriority('HIGH'), false);
  });

  it('returns false for uppercase variant LOW', () => {
    assert.equal(isValidPriority('LOW'), false);
  });
});

describe('isValidTaskUpdate() — edge cases', () => {
  it('returns failure when title is a number (type mismatch)', () => {
    const result = isValidTaskUpdate({ title: 42 });
    assert.equal(result.valid, false);
    assert.ok(result.errors.some(e => /Invalid title/.test(e)));
  });

  it('returns failure when title is an array', () => {
    const result = isValidTaskUpdate({ title: [] });
    assert.equal(result.valid, false);
    assert.ok(result.errors.some(e => /Invalid title/.test(e)));
  });

  it('accumulates errors for title, status, and priority simultaneously', () => {
    const result = isValidTaskUpdate({ title: '', status: 'nope', priority: 'extreme' });
    assert.equal(result.valid, false);
    assert.equal(result.errors.length, 3);
  });
});

describe('constants — edge cases', () => {
  it('PRIORITY_ORDER contains entries for all three valid priorities', () => {
    assert.ok('high' in PRIORITY_ORDER);
    assert.ok('medium' in PRIORITY_ORDER);
    assert.ok('low' in PRIORITY_ORDER);
  });

  it('PRIORITY_ORDER has exactly three entries', () => {
    assert.equal(Object.keys(PRIORITY_ORDER).length, 3);
  });
});
