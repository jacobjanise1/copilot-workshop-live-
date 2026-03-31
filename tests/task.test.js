import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { Task } from '../src/models/task.js';

describe('Task constructor', () => {
  it('stores all provided properties', () => {
    const now = new Date().toISOString();
    const task = new Task({
      id: 'abc-123',
      title: 'Test task',
      description: 'A description',
      status: 'todo',
      priority: 'medium',
      createdAt: now,
      updatedAt: now,
    });
    assert.equal(task.id, 'abc-123');
    assert.equal(task.title, 'Test task');
    assert.equal(task.description, 'A description');
    assert.equal(task.status, 'todo');
    assert.equal(task.priority, 'medium');
    assert.equal(task.createdAt, now);
    assert.equal(task.updatedAt, now);
  });
});

describe('Task.create()', () => {
  it('creates a task with valid required fields', () => {
    const task = Task.create({ title: 'Buy groceries' });
    assert.ok(task instanceof Task);
    assert.equal(task.title, 'Buy groceries');
  });

  it('generates a uuid for id', () => {
    const task = Task.create({ title: 'My task' });
    assert.match(task.id, /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
  });

  it('sets createdAt and updatedAt as ISO 8601 strings', () => {
    const task = Task.create({ title: 'Timestamp test' });
    assert.doesNotThrow(() => new Date(task.createdAt));
    assert.doesNotThrow(() => new Date(task.updatedAt));
    assert.equal(task.createdAt, task.updatedAt);
  });

  it('defaults status to todo', () => {
    const task = Task.create({ title: 'Default status' });
    assert.equal(task.status, 'todo');
  });

  it('defaults priority to medium', () => {
    const task = Task.create({ title: 'Default priority' });
    assert.equal(task.priority, 'medium');
  });

  it('defaults description to empty string', () => {
    const task = Task.create({ title: 'No description' });
    assert.equal(task.description, '');
  });

  it('trims whitespace from title', () => {
    const task = Task.create({ title: '  Trimmed title  ' });
    assert.equal(task.title, 'Trimmed title');
  });

  it('trims whitespace from description', () => {
    const task = Task.create({ title: 'Task', description: '  spaced  ' });
    assert.equal(task.description, 'spaced');
  });

  it('accepts all valid statuses', () => {
    for (const status of ['todo', 'in-progress', 'done']) {
      const task = Task.create({ title: 'Status task', status });
      assert.equal(task.status, status);
    }
  });

  it('accepts all valid priorities', () => {
    for (const priority of ['low', 'medium', 'high']) {
      const task = Task.create({ title: 'Priority task', priority });
      assert.equal(task.priority, priority);
    }
  });

  it('throws on empty title', () => {
    assert.throws(
      () => Task.create({ title: '' }),
      /Invalid title/
    );
  });

  it('throws on whitespace-only title', () => {
    assert.throws(
      () => Task.create({ title: '   ' }),
      /Invalid title/
    );
  });

  it('throws when title exceeds 255 characters', () => {
    assert.throws(
      () => Task.create({ title: 'a'.repeat(256) }),
      /Invalid title/
    );
  });

  it('accepts a title of exactly 255 characters', () => {
    const task = Task.create({ title: 'a'.repeat(255) });
    assert.equal(task.title.length, 255);
  });

  it('throws when description exceeds 1024 characters', () => {
    assert.throws(
      () => Task.create({ title: 'Valid title', description: 'x'.repeat(1025) }),
      /Invalid description/
    );
  });

  it('accepts a description of exactly 1024 characters', () => {
    const task = Task.create({ title: 'Valid title', description: 'x'.repeat(1024) });
    assert.equal(task.description.length, 1024);
  });

  it('throws on invalid status', () => {
    assert.throws(
      () => Task.create({ title: 'Task', status: 'pending' }),
      /Invalid status/
    );
  });

  it('throws on invalid priority', () => {
    assert.throws(
      () => Task.create({ title: 'Task', priority: 'critical' }),
      /Invalid priority/
    );
  });
});

describe('Task.clone()', () => {
  it('returns a new Task instance', () => {
    const original = Task.create({ title: 'Original' });
    const cloned = original.clone();
    assert.ok(cloned instanceof Task);
  });

  it('assigns a different id than the original', () => {
    const original = Task.create({ title: 'Original' });
    const cloned = original.clone();
    assert.notEqual(cloned.id, original.id);
  });

  it('copies title, description, status, and priority', () => {
    const original = Task.create({
      title: 'Clone me',
      description: 'Some description',
      status: 'in-progress',
      priority: 'high',
    });
    const cloned = original.clone();
    assert.equal(cloned.title, original.title);
    assert.equal(cloned.description, original.description);
    assert.equal(cloned.status, original.status);
    assert.equal(cloned.priority, original.priority);
  });

  it('assigns fresh createdAt and updatedAt timestamps', () => {
    const original = Task.create({ title: 'Timestamps' });
    const cloned = original.clone();
    assert.doesNotThrow(() => new Date(cloned.createdAt));
    assert.doesNotThrow(() => new Date(cloned.updatedAt));
  });

  it('does not mutate the original task', () => {
    const original = Task.create({ title: 'Immutable' });
    const originalId = original.id;
    original.clone();
    assert.equal(original.id, originalId);
  });

  it('clone of a clone has a unique id from both ancestors', () => {
    const a = Task.create({ title: 'A' });
    const b = a.clone();
    const c = b.clone();
    assert.notEqual(c.id, a.id);
    assert.notEqual(c.id, b.id);
  });

  it('preserves empty string description when cloning', () => {
    const original = Task.create({ title: 'No desc', description: '' });
    const cloned = original.clone();
    assert.equal(cloned.description, '');
  });

  it('cloned createdAt is not before original createdAt', () => {
    const original = Task.create({ title: 'Time order' });
    const cloned = original.clone();
    assert.ok(new Date(cloned.createdAt) >= new Date(original.createdAt));
  });
});

describe('Task.create() — type mismatches', () => {
  it('throws when title is a number', () => {
    assert.throws(
      () => Task.create({ title: 123 }),
      /Invalid title/
    );
  });

  it('throws when title is null', () => {
    assert.throws(
      () => Task.create({ title: null }),
      /Invalid title/
    );
  });

  it('throws when title is undefined', () => {
    assert.throws(
      () => Task.create({ title: undefined }),
      /Invalid title/
    );
  });

  it('throws when status is a number', () => {
    assert.throws(
      () => Task.create({ title: 'Valid', status: 42 }),
      /Invalid status/
    );
  });

  it('throws when priority is a boolean', () => {
    assert.throws(
      () => Task.create({ title: 'Valid', priority: false }),
      /Invalid priority/
    );
  });
});

describe('Task.create() — boundary and coercion', () => {
  it('accepts a title of exactly 1 character', () => {
    const task = Task.create({ title: 'x' });
    assert.equal(task.title, 'x');
  });

  it('coerces explicit null description to empty string', () => {
    const task = Task.create({ title: 'Null desc', description: null });
    assert.equal(task.description, '');
  });

  it('coerces a numeric description to its string form', () => {
    const task = Task.create({ title: 'Numeric desc', description: 0 });
    assert.equal(task.description, '0');
  });

  it('accepts description of exactly 0 characters', () => {
    const task = Task.create({ title: 'Empty desc', description: '' });
    assert.equal(task.description, '');
  });
});
