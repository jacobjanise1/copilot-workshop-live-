import {
  createTask,
  listTasks,
  getTaskById,
  updateTask,
  deleteTask,
} from './services/taskService.js';
import { colorStatus, colorPriority } from './utils/colors.js';

console.log('=== Task Manager CLI — Feature Demo ===\n');

// --- Create tasks ---
console.log('--- Creating tasks ---');
const r1 = createTask({ title: 'Buy groceries', description: 'Milk, eggs, bread', priority: 'high' });
const r2 = createTask({ title: 'Write unit tests', status: 'in-progress', priority: 'medium' });
const r3 = createTask({ title: 'Read documentation', priority: 'low', status: 'done' });
const r4 = createTask({ title: 'Fix login bug', priority: 'high', status: 'in-progress' });

console.log(`Created: ${r1.data.title} (${r1.data.id})`);
console.log(`Created: ${r2.data.title} (${r2.data.id})`);
console.log(`Created: ${r3.data.title} (${r3.data.id})`);
console.log(`Created: ${r4.data.title} (${r4.data.id})`);

// --- Validation error ---
console.log('\n--- Validation error (empty title) ---');
const badCreate = createTask({ title: '   ' });
console.log(`Error: ${badCreate.error}`);

// --- List all tasks sorted by priority ---
console.log('\n--- List all tasks (sorted by priority asc) ---');
listTasks({ sort: 'priority' }).forEach(t =>
  console.log(`  [${colorPriority(t.priority).padEnd(16)}] [${colorStatus(t.status).padEnd(20)}] ${t.title}`)
);

// --- List sorted by createdAt descending ---
console.log('\n--- List all tasks (sorted by createdAt desc) ---');
listTasks({ sort: 'createdAt', order: 'desc' }).forEach(t =>
  console.log(`  ${t.createdAt}  ${t.title}`)
);

// --- Filter by status ---
console.log('\n--- Filter by status: in-progress ---');
listTasks({ status: 'in-progress' }).forEach(t => console.log(`  ${t.title}`));

// --- Filter by priority ---
console.log('\n--- Filter by priority: high ---');
listTasks({ priority: 'high' }).forEach(t => console.log(`  ${t.title}`));

// --- Get by id ---
console.log('\n--- Get task by id ---');
const fetched = getTaskById(r1.data.id);
console.log(`Fetched: ${fetched.title} | status: ${colorStatus(fetched.status)} | createdAt: ${fetched.createdAt}`);

// --- Get non-existent id ---
console.log('\n--- Get task by non-existent id ---');
const missing = getTaskById('00000000-0000-0000-0000-000000000000');
console.log(`Result: ${missing}`);

// --- Update task ---
console.log('\n--- Update task (title and status) ---');
const updated = updateTask(r1.data.id, { title: 'Buy groceries (done)', status: 'done' });
console.log(`Updated: ${updated.data.title} | status: ${colorStatus(updated.data.status)} | priority: ${colorPriority(updated.data.priority)}`);
console.log(`  createdAt: ${updated.data.createdAt}`);
console.log(`  updatedAt: ${updated.data.updatedAt}`);

// --- Validation error on update ---
console.log('\n--- Validation error (invalid status on update) ---');
const badUpdate = updateTask(r2.data.id, { status: 'finished' });
console.log(`Error: ${badUpdate.error}`);

// --- Update non-existent task ---
console.log('\n--- Update non-existent task ---');
const notFound = updateTask('00000000-0000-0000-0000-000000000000', { status: 'done' });
console.log(`Error: ${notFound.error}`);

// --- Delete task ---
console.log('\n--- Delete task ---');
const deleted = deleteTask(r3.data.id);
console.log(`Deleted: ${deleted.success}`);
console.log(`Remaining tasks: ${listTasks().length}`);

// --- Delete non-existent task ---
console.log('\n--- Delete non-existent task ---');
const deleteMissing = deleteTask('00000000-0000-0000-0000-000000000000');
console.log(`Error: ${deleteMissing.error}`);

console.log('\n=== Demo complete ===');
