export const VALID_STATUSES = ['todo', 'in-progress', 'done'];
export const VALID_PRIORITIES = ['low', 'medium', 'high'];
export const PRIORITY_ORDER = { high: 0, medium: 1, low: 2 };
export const DEFAULT_STATUS = 'todo';
export const DEFAULT_PRIORITY = 'medium';

/**
 * Returns true if the value is a non-empty string no longer than 255 characters.
 * @param {string} title
 * @returns {boolean}
 */
export function isValidTitle(title) {
  return typeof title === 'string' && title.length > 0 && title.length <= 255;
}

/**
 * Returns true if the value is a string no longer than 1024 characters.
 * @param {string} description
 * @returns {boolean}
 */
export function isValidDescription(description) {
  return typeof description === 'string' && description.length <= 1024;
}

/**
 * Returns true if the value is one of the allowed status strings.
 * @param {string} status
 * @returns {boolean}
 */
export function isValidStatus(status) {
  return VALID_STATUSES.includes(status);
}

/**
 * Returns true if the value is one of the allowed priority strings.
 * @param {string} priority
 * @returns {boolean}
 */
export function isValidPriority(priority) {
  return VALID_PRIORITIES.includes(priority);
}

/**
 * Validates a partial task update object and returns an error list.
 * @param {object} update
 * @returns {{ valid: boolean, errors: string[] }}
 */
export function isValidTaskUpdate(update) {
  const errors = [];

  if (update.title !== undefined) {
    const trimmed = typeof update.title === 'string' ? update.title.trim() : '';
    if (!isValidTitle(trimmed)) {
      errors.push('Invalid title: must be a non-empty string of at most 255 characters');
    }
  }

  if (update.description !== undefined) {
    const trimmed = update.description == null ? '' : String(update.description).trim();
    if (!isValidDescription(trimmed)) {
      errors.push('Invalid description: must not exceed 1024 characters');
    }
  }

  if (update.status !== undefined && !isValidStatus(update.status)) {
    errors.push(`Invalid status "${update.status}": must be one of ${VALID_STATUSES.join(', ')}`);
  }

  if (update.priority !== undefined && !isValidPriority(update.priority)) {
    errors.push(`Invalid priority "${update.priority}": must be one of ${VALID_PRIORITIES.join(', ')}`);
  }

  return { valid: errors.length === 0, errors };
}
