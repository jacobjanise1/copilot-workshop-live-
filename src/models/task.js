import { randomUUID } from 'crypto';
import {
  isValidTitle,
  isValidDescription,
  isValidStatus,
  isValidPriority,
  DEFAULT_STATUS,
  DEFAULT_PRIORITY,
} from '../utils/validators.js';

/**
 * @typedef {Object} TaskData
 * @property {string} id
 * @property {string} title
 * @property {string} description
 * @property {string} status
 * @property {string} priority
 * @property {string} createdAt
 * @property {string} updatedAt
 */

/** Represents a single task in the Task Manager. */
export class Task {
  /** @param {TaskData} data */
  constructor(data) {
    this.id = data.id;
    this.title = data.title;
    this.description = data.description;
    this.status = data.status;
    this.priority = data.priority;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  /**
   * Creates and validates a new Task instance with a generated id and timestamps.
   * @param {{ title: string, description?: string, status?: string, priority?: string }} input
   * @returns {Task}
   */
  static create({
    title,
    description = '',
    status = DEFAULT_STATUS,
    priority = DEFAULT_PRIORITY,
  }) {
    const trimmedTitle = typeof title === 'string' ? title.trim() : '';
    if (!isValidTitle(trimmedTitle)) {
      throw new Error('Invalid title: must be a non-empty string of at most 255 characters');
    }

    const trimmedDesc = description == null ? '' : String(description).trim();
    if (!isValidDescription(trimmedDesc)) {
      throw new Error('Invalid description: must not exceed 1024 characters');
    }

    if (!isValidStatus(status)) {
      throw new Error(`Invalid status "${status}": must be one of todo, in-progress, done`);
    }

    if (!isValidPriority(priority)) {
      throw new Error(`Invalid priority "${priority}": must be one of low, medium, high`);
    }

    const now = new Date().toISOString();
    return new Task({
      id: randomUUID(),
      title: trimmedTitle,
      description: trimmedDesc,
      status,
      priority,
      createdAt: now,
      updatedAt: now,
    });
  }

  /**
   * Returns a copy of this task with a new generated id and fresh timestamps.
   * @returns {Task}
   */
  clone() {
    const now = new Date().toISOString();
    return new Task({
      id: randomUUID(),
      title: this.title,
      description: this.description,
      status: this.status,
      priority: this.priority,
      createdAt: now,
      updatedAt: now,
    });
  }
}
