import assert from "node:assert/strict";
import { test } from "node:test";
import {
  filterTodos,
  getDdayLabel,
  getSeoulToday,
  getTodoProgress,
} from "../lib/todo-view.ts";

const today = "2026-11-20";
const todos = [
  { id: 1, title: "수학 과제", done: false, dueDate: today, priority: "high", category: "study" },
  { id: 2, title: "수학 복습", done: true, dueDate: today, priority: "normal", category: "study" },
  { id: 3, title: "장보기", done: false, dueDate: null, priority: "low", category: "daily" },
  { id: 4, title: "회의 자료", done: false, dueDate: "2026-11-21", priority: "normal", category: "work" },
];

test("calculates D-day labels using calendar dates and the Seoul timezone", () => {
  assert.equal(getSeoulToday(new Date("2026-11-19T15:30:00.000Z")), today);
  assert.equal(getSeoulToday(new Date("2026-11-19T14:59:00.000Z")), "2026-11-19");
  assert.equal(getDdayLabel(today, today), "D-Day");
  assert.equal(getDdayLabel("2026-11-21", today), "D-1");
  assert.equal(getDdayLabel("2026-11-19", today), "D+1");
  assert.equal(getDdayLabel(null, today), null);
});

test("combines status, title search, and due-today filters", () => {
  assert.deepEqual(
    filterTodos(todos, { status: "active", search: "수학", dueToday: true, today }),
    [todos[0]],
  );
  assert.deepEqual(
    filterTodos(todos, { status: "done", search: "", dueToday: true, today }),
    [todos[1]],
  );
  assert.deepEqual(
    filterTodos(todos, { status: "all", search: "회의", dueToday: false, today }),
    [todos[3]],
  );
});

test("calculates completion progress from the full todo list", () => {
  assert.deepEqual(getTodoProgress(todos), { completed: 1, total: 4, percent: 25 });
  assert.deepEqual(getTodoProgress([]), { completed: 0, total: 0, percent: 0 });
});
