import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  createTask,
  listTasks,
  getTaskById,
  updateTask,
  deleteTask,
} from '../src/services/taskService.js';

/** Remove every task currently in the store. */
function clearStore() {
  for (const task of listTasks()) {
    deleteTask(task.id);
  }
}

describe('createTask()', () => {
  beforeEach(clearStore);

  it('returns success with the created task', () => {
    const result = createTask({ title: 'New task' });
    assert.ok(result.success);
    assert.ok(result.data);
    assert.equal(result.data.title, 'New task');
  });

  it('adds the task to the store', () => {
    createTask({ title: 'Stored task' });
    assert.equal(listTasks().length, 1);
  });

  it('returns failure on invalid title', () => {
    const result = createTask({ title: '' });
    assert.equal(result.success, false);
    assert.ok(result.error);
  });

  it('returns failure on invalid status', () => {
    const result = createTask({ title: 'Task', status: 'unknown' });
    assert.equal(result.success, false);
    assert.match(result.error, /Invalid status/);
  });

  it('returns failure on invalid priority', () => {
    const result = createTask({ title: 'Task', priority: 'extreme' });
    assert.equal(result.success, false);
    assert.match(result.error, /Invalid priority/);
  });

  it('assigns unique ids to each task', () => {
    const a = createTask({ title: 'Task A' });
    const b = createTask({ title: 'Task B' });
    assert.notEqual(a.data.id, b.data.id);
  });
});

describe('listTasks()', () => {
  beforeEach(clearStore);

  it('returns an empty array when no tasks exist', () => {
    assert.deepEqual(listTasks(), []);
  });

  it('returns all tasks when no filters are applied', () => {
    createTask({ title: 'A' });
    createTask({ title: 'B' });
    assert.equal(listTasks().length, 2);
  });

  it('filters by status', () => {
    createTask({ title: 'Todo task', status: 'todo' });
    createTask({ title: 'Done task', status: 'done' });
    const results = listTasks({ status: 'todo' });
    assert.equal(results.length, 1);
    assert.equal(results[0].title, 'Todo task');
  });

  it('filters by priority', () => {
    createTask({ title: 'High task', priority: 'high' });
    createTask({ title: 'Low task', priority: 'low' });
    const results = listTasks({ priority: 'high' });
    assert.equal(results.length, 1);
    assert.equal(results[0].title, 'High task');
  });

  it('filters by both status and priority', () => {
    createTask({ title: 'Match', status: 'todo', priority: 'high' });
    createTask({ title: 'Wrong status', status: 'done', priority: 'high' });
    createTask({ title: 'Wrong priority', status: 'todo', priority: 'low' });
    const results = listTasks({ status: 'todo', priority: 'high' });
    assert.equal(results.length, 1);
    assert.equal(results[0].title, 'Match');
  });

  it('sorts by priority ascending by default when sort=priority', () => {
    createTask({ title: 'Low', priority: 'low' });
    createTask({ title: 'High', priority: 'high' });
    createTask({ title: 'Medium', priority: 'medium' });
    const results = listTasks({ sort: 'priority', order: 'asc' });
    assert.equal(results[0].priority, 'high');
    assert.equal(results[1].priority, 'medium');
    assert.equal(results[2].priority, 'low');
  });

  it('sorts by priority descending', () => {
    createTask({ title: 'Low', priority: 'low' });
    createTask({ title: 'High', priority: 'high' });
    const results = listTasks({ sort: 'priority', order: 'desc' });
    assert.equal(results[0].priority, 'low');
    assert.equal(results[1].priority, 'high');
  });

  it('sorts by createdAt ascending by default', () => {
    createTask({ title: 'First' });
    createTask({ title: 'Second' });
    const results = listTasks({ sort: 'createdAt', order: 'asc' });
    assert.equal(results.length, 2);
    // Earlier (or equal) timestamp must appear first.
    assert.ok(results[0].createdAt <= results[1].createdAt);
  });

  it('sorts by createdAt descending', () => {
    createTask({ title: 'First' });
    createTask({ title: 'Second' });
    const results = listTasks({ sort: 'createdAt', order: 'desc' });
    assert.equal(results.length, 2);
    // Later (or equal) timestamp must appear first.
    assert.ok(results[0].createdAt >= results[1].createdAt);
  });

  it('throws on invalid status filter', () => {
    assert.throws(() => listTasks({ status: 'invalid' }), /Invalid status filter/);
  });

  it('throws on invalid priority filter', () => {
    assert.throws(() => listTasks({ priority: 'invalid' }), /Invalid priority filter/);
  });
});

describe('getTaskById()', () => {
  beforeEach(clearStore);

  it('returns the task for a known id', () => {
    const { data } = createTask({ title: 'Find me' });
    const found = getTaskById(data.id);
    assert.ok(found);
    assert.equal(found.id, data.id);
  });

  it('returns null for an unknown id', () => {
    const found = getTaskById('non-existent-id');
    assert.equal(found, null);
  });
});

describe('updateTask()', () => {
  beforeEach(clearStore);

  it('updates the title of an existing task', () => {
    const { data } = createTask({ title: 'Old title' });
    const result = updateTask(data.id, { title: 'New title' });
    assert.ok(result.success);
    assert.equal(result.data.title, 'New title');
  });

  it('updates the status of an existing task', () => {
    const { data } = createTask({ title: 'Task' });
    const result = updateTask(data.id, { status: 'done' });
    assert.ok(result.success);
    assert.equal(result.data.status, 'done');
  });

  it('updates the priority of an existing task', () => {
    const { data } = createTask({ title: 'Task' });
    const result = updateTask(data.id, { priority: 'high' });
    assert.ok(result.success);
    assert.equal(result.data.priority, 'high');
  });

  it('updates the description of an existing task', () => {
    const { data } = createTask({ title: 'Task' });
    const result = updateTask(data.id, { description: 'New desc' });
    assert.ok(result.success);
    assert.equal(result.data.description, 'New desc');
  });

  it('refreshes updatedAt after an update', () => {
    const { data } = createTask({ title: 'Task' });
    const originalUpdatedAt = data.updatedAt;
    // Ensure time advances
    const result = updateTask(data.id, { title: 'Updated' });
    assert.ok(result.data.updatedAt >= originalUpdatedAt);
  });

  it('does not change createdAt after an update', () => {
    const { data } = createTask({ title: 'Task' });
    const result = updateTask(data.id, { title: 'Updated' });
    assert.equal(result.data.createdAt, data.createdAt);
  });

  it('trims whitespace from updated title', () => {
    const { data } = createTask({ title: 'Task' });
    const result = updateTask(data.id, { title: '  trimmed  ' });
    assert.equal(result.data.title, 'trimmed');
  });

  it('returns failure for unknown id', () => {
    const result = updateTask('bad-id', { title: 'X' });
    assert.equal(result.success, false);
    assert.match(result.error, /not found/i);
  });

  it('returns failure on invalid status', () => {
    const { data } = createTask({ title: 'Task' });
    const result = updateTask(data.id, { status: 'bad' });
    assert.equal(result.success, false);
    assert.match(result.error, /Invalid status/);
  });

  it('returns failure on invalid priority', () => {
    const { data } = createTask({ title: 'Task' });
    const result = updateTask(data.id, { priority: 'extreme' });
    assert.equal(result.success, false);
    assert.match(result.error, /Invalid priority/);
  });

  it('returns failure on empty title', () => {
    const { data } = createTask({ title: 'Task' });
    const result = updateTask(data.id, { title: '' });
    assert.equal(result.success, false);
    assert.match(result.error, /Invalid title/);
  });
});

describe('deleteTask()', () => {
  beforeEach(clearStore);

  it('removes the task from the store', () => {
    const { data } = createTask({ title: 'Delete me' });
    deleteTask(data.id);
    assert.equal(listTasks().length, 0);
  });

  it('returns success for a known id', () => {
    const { data } = createTask({ title: 'Delete me' });
    const result = deleteTask(data.id);
    assert.ok(result.success);
  });

  it('returns failure for an unknown id', () => {
    const result = deleteTask('no-such-id');
    assert.equal(result.success, false);
    assert.match(result.error, /not found/i);
  });

  it('only removes the targeted task', () => {
    const a = createTask({ title: 'Keep' });
    const b = createTask({ title: 'Delete' });
    deleteTask(b.data.id);
    const remaining = listTasks();
    assert.equal(remaining.length, 1);
    assert.equal(remaining[0].id, a.data.id);
  });
});

// ── Edge-case additions ────────────────────────────────────────────────────

describe('createTask() — edge cases', () => {
  beforeEach(clearStore);

  it('allows two tasks with the same title (no uniqueness constraint)', () => {
    const a = createTask({ title: 'Same title' });
    const b = createTask({ title: 'Same title' });
    assert.ok(a.success);
    assert.ok(b.success);
    assert.notEqual(a.data.id, b.data.id);
    assert.equal(listTasks().length, 2);
  });
});

describe('listTasks() — edge cases', () => {
  beforeEach(clearStore);

  it('returns empty array when filtering by status on empty store', () => {
    assert.deepEqual(listTasks({ status: 'todo' }), []);
  });

  it('returns empty array when filtering by priority on empty store', () => {
    assert.deepEqual(listTasks({ priority: 'high' }), []);
  });

  it('still returns results for an unrecognised sort field (falls back to createdAt)', () => {
    createTask({ title: 'A' });
    createTask({ title: 'B' });
    const results = listTasks({ sort: 'nonexistent' });
    assert.equal(results.length, 2);
  });

  it('returned array is a snapshot — pushing to it does not grow the store', () => {
    createTask({ title: 'Task' });
    const snapshot = listTasks();
    snapshot.push('extra');
    assert.equal(listTasks().length, 1);
  });
});

describe('updateTask() — edge cases', () => {
  beforeEach(clearStore);

  it('succeeds with an empty update object and leaves all fields unchanged', () => {
    const { data } = createTask({ title: 'Unchanged' });
    const result = updateTask(data.id, {});
    assert.ok(result.success);
    assert.equal(result.data.title, 'Unchanged');
    assert.equal(result.data.status, 'todo');
    assert.equal(result.data.priority, 'medium');
  });

  it('returns failure when title is passed as a number (type mismatch)', () => {
    const { data } = createTask({ title: 'Task' });
    const result = updateTask(data.id, { title: 42 });
    assert.equal(result.success, false);
    assert.match(result.error, /Invalid title/);
  });
});

describe('deleteTask() — edge cases', () => {
  beforeEach(clearStore);

  it('returns failure when deleting the same id a second time', () => {
    const { data } = createTask({ title: 'Once' });
    deleteTask(data.id);
    const second = deleteTask(data.id);
    assert.equal(second.success, false);
    assert.match(second.error, /not found/i);
  });
});
