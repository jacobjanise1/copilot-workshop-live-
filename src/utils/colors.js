import chalk from 'chalk';

/**
 * Returns a colorized status string using the CLI status color mapping.
 * @param {string} status
 * @returns {string}
 */
export function colorStatus(status) {
  if (status === 'done') return chalk.green(status);
  if (status === 'in-progress') return chalk.yellow(status);
  if (status === 'todo') return chalk.red(status);
  return status;
}

/**
 * Returns a colorized priority string using the CLI priority color mapping.
 * @param {string} priority
 * @returns {string}
 */
export function colorPriority(priority) {
  if (priority === 'high') return chalk.bold.red(priority);
  if (priority === 'medium') return chalk.bold.yellow(priority);
  if (priority === 'low') return chalk.dim(priority);
  return priority;
}
