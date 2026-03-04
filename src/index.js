
//!/usr/bin/env node
/**
 * Task Manager CLI — Feature 2 (list + filters)
 * Commands:
 *   node src/index.js help
 *   node src/index.js add "Task title"
 *   node src/index.js list [--all|--open|--done]
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
  try {
    return JSON.parse(text);
  } catch (e) {
    console.error('❌ tasks.json is not valid JSON. Fix or delete it to reset.');
    process.exit(1);
  }
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

function formatRow(id, status, title) {
  const col1 = String(id).padEnd(4);
  const col2 = status.padEnd(6);
  return `${col1} ${col2} ${title}`;
}

function listTasks(flag = '--open') {
  const tasks = loadTasks();
  let filtered = tasks;

  switch (flag) {
    case '--all':
      filtered = tasks;
      break;
    case '--done':
      filtered = tasks.filter(t => !!t.done);
      break;
    case '--open':
    default:
      filtered = tasks.filter(t => !t.done);
      break;
  }

  if (tasks.length === 0) {
    console.log('ℹ️  No tasks yet. Add one:');
    console.log('   node src/index.js add "Your first task"');
    return;
  }

  if (filtered.length === 0) {
    console.log('ℹ️  No tasks match this filter.');
    return;
  }

  console.log('\nID   STAT  TITLE');
  console.log('---- ----- --------------------------------');
  for (const t of filtered) {
    const status = t.done ? '✓' : '·';
    console.log(formatRow(t.id, status, t.title));
  }
  console.log('');
}

function showHelp() {
  console.log(`
Task Manager CLI

Commands:
  node src/index.js help
  node src/index.js add "Task title"
  node src/index.js list [--all|--open|--done]

Examples:
  node src/index.js add "Buy groceries"
  node src/index.js list
  node src/index.js list --done
  `);
}

function main() {
  const [, , cmd, ...args] = process.argv;
  switch ((cmd || 'help').toLowerCase()) {
    case 'add':
      addTask(args.join(' '));
      break;
    case 'list': {
      // default to --open if no flag provided
      const flag = args[0] || '--open';
      listTasks(flag);
      break;
    }
    case 'help':
    default:
      showHelp();
      break;
  }
}

main();
