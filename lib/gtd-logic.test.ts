import test from 'node:test';
import assert from 'node:assert/strict';
import {
  filterTasks,
  calculateProjectProgress,
  calculateContextCounts,
  toggleTaskCompleted,
  processChaosItem,
  isTaskOverdue,
  INITIAL_TASKS,
  INITIAL_CONTEXTS,
} from './gtd-logic';
import { Task } from './types';

test('filterTasks correctly filters inbox items', () => {
  const tasks: Task[] = [
    { id: '1', title: 'Idea 1', status: 'inbox', priority: 'medium', createdAt: '2026-01-01' },
    { id: '2', title: 'Action 1', status: 'next_action', priority: 'high', createdAt: '2026-01-01' },
  ];
  const inbox = filterTasks(tasks, 'inbox');
  assert.equal(inbox.length, 1);
  assert.equal(inbox[0].id, '1');
});

test('filterTasks correctly filters today and overdue items', () => {
  const today = '2026-11-09';
  const tomorrow = '2026-11-10';
  const yesterday = '2026-11-08';

  const tasks: Task[] = [
    { id: '1', title: 'Due today', status: 'next_action', dueDate: today, priority: 'urgent', createdAt: '2026-01-01' },
    { id: '2', title: 'Overdue task', status: 'next_action', dueDate: yesterday, priority: 'high', createdAt: '2026-01-01' },
    { id: '3', title: 'Due tomorrow', status: 'next_action', dueDate: tomorrow, priority: 'medium', createdAt: '2026-01-01' },
    { id: '4', title: 'Inbox item today', status: 'inbox', dueDate: today, priority: 'low', createdAt: '2026-01-01' },
  ];

  const todayTasks = filterTasks(tasks, 'today', { todayStr: today, tomorrowStr: tomorrow });
  // Should include due today and overdue, but exclude inbox items
  assert.equal(todayTasks.length, 2);
  assert.deepEqual(todayTasks.map((t) => t.id), ['1', '2']);
});

test('calculateProjectProgress computes correct percentages', () => {
  const tasks: Task[] = [
    { id: '1', title: 'Task 1', status: 'completed', projectId: 'p1', priority: 'medium', createdAt: '2026-01-01' },
    { id: '2', title: 'Task 2', status: 'next_action', projectId: 'p1', priority: 'medium', createdAt: '2026-01-01' },
    { id: '3', title: 'Task 3', status: 'next_action', projectId: 'p2', priority: 'medium', createdAt: '2026-01-01' },
  ];

  const progressP1 = calculateProjectProgress('p1', tasks);
  assert.equal(progressP1.total, 2);
  assert.equal(progressP1.completed, 1);
  assert.equal(progressP1.percentage, 50);

  const progressEmpty = calculateProjectProgress('non-existent', tasks);
  assert.equal(progressEmpty.total, 0);
  assert.equal(progressEmpty.percentage, 0);
});

test('calculateContextCounts maps active tasks to contexts', () => {
  const counts = calculateContextCounts(INITIAL_CONTEXTS, INITIAL_TASKS);
  assert.equal(typeof counts['ctx-comp'], 'number');
  assert.ok(counts['ctx-comp'] >= 1);
});

test('toggleTaskCompleted toggles between completed and previous/next_action', () => {
  const task: Task = {
    id: 't1',
    title: 'Test',
    status: 'next_action',
    projectId: 'p1',
    priority: 'high',
    createdAt: '2026-01-01',
  };

  const completed = toggleTaskCompleted(task, '2026-11-09T10:00:00Z');
  assert.equal(completed.status, 'completed');
  assert.equal(completed.completedAt, '2026-11-09T10:00:00Z');

  const uncompleted = toggleTaskCompleted(completed);
  assert.equal(uncompleted.status, 'next_action');
  assert.equal(uncompleted.completedAt, undefined);
});

test('processChaosItem transforms inbox item to next action with project', () => {
  const inboxTask: Task = {
    id: 'i1',
    title: 'Raw thought',
    status: 'inbox',
    priority: 'medium',
    createdAt: '2026-01-01',
  };

  const processed = processChaosItem(inboxTask, {
    projectId: 'proj-1',
    contextId: 'ctx-comp',
    dueDate: '2026-11-09',
    priority: 'urgent',
  });

  assert.equal(processed.status, 'next_action');
  assert.equal(processed.projectId, 'proj-1');
  assert.equal(processed.contextId, 'ctx-comp');
  assert.equal(processed.priority, 'urgent');
});

test('isTaskOverdue properly flags dates before today', () => {
  const taskOverdue: Task = {
    id: 't-old',
    title: 'Old task',
    status: 'next_action',
    dueDate: '2026-11-01',
    priority: 'high',
    createdAt: '2026-01-01',
  };
  const taskToday: Task = {
    id: 't-now',
    title: 'Today task',
    status: 'next_action',
    dueDate: '2026-11-09',
    priority: 'high',
    createdAt: '2026-01-01',
  };

  assert.equal(isTaskOverdue(taskOverdue, '2026-11-09'), true);
  assert.equal(isTaskOverdue(taskToday, '2026-11-09'), false);
});
