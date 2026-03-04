//!/usr/bin/env node
/**
 * Task Manager CLI — Feature 1 (add + help)
 * Stores tasks in tasks.json at repo root.
 *
 * Usage:
 *   node src/index.js help
 *   node src/index.js add "Task title"
 */

const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'tasks.json');

function ensureDb() {
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, '[]', 'utf-8');
  }
}

function loadTasks() {
  ensureDb();
  const text = fs.readFileSync(DB_PATH, 'utf-8').trim() || '[]';
  return JSON.parse(text);
}

function saveTasks(tasks) {
  fs.writeFileSync(DB_PATH, JSON.stringify(tasks, null, 2), 'utf-8');
}

function nextId(tasks) {
  return tasks.reduce((max, t) => Math.max(max, t.id || 0), 0) + 1;
}

function addTask(title) {
  if (!title || !title.trim()) {
    console.error('❌ Please provide a task title, e.g.:');
    console.error('   node src/index.js add "Buy milk"');
    process.exit(1);
  }
  const tasks = loadTasks();
  const task = {
    id: nextId(tasks),
    title: title.trim(),
    done: false,
    createdAt: new Date().toISOString(),
  };
  tasks.push(task);
  saveTasks(tasks);
  console.log(`✅ Added task #${task.id}: ${task.title}`);
}

function showHelp() {
  console.log(`
Task Manager CLI

Commands:
  node src/index.js help
  node src/index.js add "Task title"

Examples:
  node src/index.js add "Buy groceries"
  node src/index.js add "Read 10 pages"
  `);
}

function main() {
  const [, , cmd, ...args] = process.argv;
  switch ((cmd || 'help').toLowerCase()) {
    case 'add':
      addTask(args.join(' '));
      break;
    case 'help':
    default:
      showHelp();
      break;
  }
}

main();
