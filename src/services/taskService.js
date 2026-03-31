import { Task } from '../models/task.js';
import {
  isValidStatus,
  isValidPriority,
  isValidTaskUpdate,
  PRIORITY_ORDER,
} from '../utils/validators.js';

/** @type {Task[]} */
const store = [];

/**
 * Creates a new task and adds it to the in-memory store.
 * @param {{ title: string, description?: string, status?: string, priority?: string }} input
 * @returns {{ success: boolean, data?: Task, error?: string }}
 */
export function createTask(input) {
  try {
    const task = Task.create(input);
    store.push(task);
    return { success: true, data: task };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * Returns tasks filtered by status and/or priority, sorted by a given field.
 * @param {{ status?: string, priority?: string, sort?: 'priority'|'createdAt', order?: 'asc'|'desc' }} [options]
 * @returns {Task[]}
 */
export function listTasks({ status, priority, sort = 'createdAt', order = 'asc' } = {}) {
  if (status !== undefined && !isValidStatus(status)) {
    throw new Error(`Invalid status filter "${status}"`);
  }
  if (priority !== undefined && !isValidPriority(priority)) {
    throw new Error(`Invalid priority filter "${priority}"`);
  }

  let results = store.filter(t => {
    if (status !== undefined && t.status !== status) return false;
    if (priority !== undefined && t.priority !== priority) return false;
    return true;
  });

  results.sort((a, b) => {
    let cmp;
    if (sort === 'priority') {
      cmp = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
    } else {
      cmp = a.createdAt < b.createdAt ? -1 : a.createdAt > b.createdAt ? 1 : 0;
    }
    return order === 'desc' ? -cmp : cmp;
  });

  return results;
}

/**
 * Returns a single task by id, or null if not found.
 * @param {string} id
 * @returns {Task|null}
 */
export function getTaskById(id) {
  return store.find(t => t.id === id) ?? null;
}

/**
 * Updates allowed fields on an existing task and refreshes its updatedAt timestamp.
 * @param {string} id
 * @param {Partial<Task>} update
 * @returns {{ success: boolean, data?: Task, error?: string }}
 */
export function updateTask(id, update) {
  const task = store.find(t => t.id === id);
  if (!task) return { success: false, error: `Task not found: ${id}` };

  const { valid, errors } = isValidTaskUpdate(update);
  if (!valid) return { success: false, error: errors.join('; ') };

  if (update.title !== undefined) task.title = update.title.trim();
  if (update.description !== undefined) {
    task.description = update.description == null ? '' : String(update.description).trim();
  }
  if (update.status !== undefined) task.status = update.status;
  if (update.priority !== undefined) task.priority = update.priority;
  task.updatedAt = new Date().toISOString();

  return { success: true, data: task };
}

/**
 * Removes a task from the store by id.
 * @param {string} id
 * @returns {{ success: boolean, error?: string }}
 */
export function deleteTask(id) {
  const index = store.findIndex(t => t.id === id);
  if (index === -1) return { success: false, error: `Task not found: ${id}` };
  store.splice(index, 1);
  return { success: true };
}
