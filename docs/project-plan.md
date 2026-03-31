# Task Manager CLI Project Plan

## 1. Project Overview
Task Manager CLI is a small command-line application for Node.js 20+ that helps users manage personal tasks in memory during a single runtime session. Users can create, list, update, and delete tasks, then narrow results with filtering and ordering options for day-to-day prioritization. The solution will use only built-in Node.js modules and keep the implementation intentionally simple for workshop learning.

## 2. User Stories
1. As a user, I want to create a task so I can track work I need to do.
   - Acceptance criteria:
   - When I run the create command with a title, a new task is added with generated id, default status of todo, default priority of medium, and timestamps.
   - If description, status, or priority are omitted, defaults are applied.
   - If title is missing or empty, the command returns a validation error and does not create a task.

2. As a user, I want to list tasks so I can view what is currently tracked.
   - Acceptance criteria:
   - Running the list command shows all tasks currently stored in memory.
   - Output includes id, title, status, priority, createdAt, and updatedAt.
   - If there are no tasks, output clearly states no tasks are available.

3. As a user, I want to update a task so I can keep status and details current.
   - Acceptance criteria:
   - Updating by id modifies only provided fields and leaves all others unchanged.
   - Updated tasks always refresh updatedAt to the current ISO timestamp.
   - Updating a non-existent id returns a not found error.
   - Invalid status or priority values return validation errors.

4. As a user, I want to delete a task so I can remove completed or obsolete work.
   - Acceptance criteria:
   - Deleting by id removes the task from in-memory storage.
   - Deleting a non-existent id returns a not found error.
   - After deletion, listing tasks no longer shows the removed task.

5. As a user, I want to filter tasks by status or priority so I can focus on relevant work.
   - Acceptance criteria:
   - The list command accepts optional filter arguments for status and priority.
   - Filters can be used independently or together.
   - Invalid filter values return validation errors.

6. As a user, I want to sort tasks by priority or creation date so I can see tasks in meaningful order.
   - Acceptance criteria:
   - The list command accepts a sort option for priority or createdAt.
   - Priority sorting follows high, medium, low.
   - Date sorting supports newest-first and oldest-first options.

## 3. Data Model
- Entity: Task
  - id: string (UUID from crypto.randomUUID())
  - title: string (required, non-empty)
  - description: string (optional, default empty string)
  - status: string enum (todo | in-progress | done)
  - priority: string enum (low | medium | high)
  - createdAt: string (ISO 8601 timestamp)
  - updatedAt: string (ISO 8601 timestamp)

- In-memory store:
  - tasks: Task[]

- Derived constants:
  - VALID_STATUSES: string[] = ["todo", "in-progress", "done"]
  - VALID_PRIORITIES: string[] = ["low", "medium", "high"]
  - PRIORITY_ORDER: Record<string, number> = { high: 0, medium: 1, low: 2 }

## 4. File Structure
```text
src/
  index.js                 # CLI entry point and command routing
  task-store.js            # In-memory array and CRUD operations
  task-service.js          # Business logic for create/update/list/delete
  validators.js            # Input and enum validation helpers
  formatters.js            # CLI output formatting helpers
  constants.js             # Status and priority enums and sort mappings
  types.js                 # JSDoc typedefs for Task and option objects
```

## 5. Implementation Phases
1. Milestone 1: Project skeleton and core model
   - Create src structure and constants for statuses and priorities.
   - Define Task typedefs and shared utility helpers.
   - Implement in-memory task store module.

2. Milestone 2: CRUD service logic
   - Implement createTask, getTasks, updateTaskById, deleteTaskById.
   - Add default values and timestamp handling.
   - Add validation for required fields and enum values.

3. Milestone 3: Filtering and sorting
   - Add list options for status and priority filters.
   - Add sorting by priority and createdAt with selectable direction.
   - Ensure combined filter + sort behavior is deterministic.

4. Milestone 4: CLI command interface
   - Implement command parsing in index.js.
   - Map commands to service methods and print formatted output.
   - Add user-friendly error messages for invalid input and missing ids.

5. Milestone 5: Verification and documentation
   - Manually validate all user story acceptance criteria.
   - Add usage examples to README or exercise notes.
   - Confirm no external dependencies are used and runtime is Node.js 20+.
