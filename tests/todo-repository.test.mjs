import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { createClient } from "@libsql/client";
import { createTodoRepository } from "../lib/todo-repository.ts";

const clients = [];

function createTestClient() {
  const client = createClient({ url: ":memory:" });
  clients.push(client);
  return client;
}

afterEach(() => {
  for (const client of clients.splice(0)) client.close();
});

test("migrates existing todos additively and preserves their stored values", async () => {
  const client = createTestClient();
  await client.execute(`
    CREATE TABLE todos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      done INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);
  await client.execute({
    sql: "INSERT INTO todos (title, done, created_at) VALUES (?, ?, ?)",
    args: ["기존 할 일", 1, "2025-01-02 03:04:05"],
  });

  const repository = createTodoRepository(client);
  const todos = await repository.listTodos();

  assert.deepEqual(todos, [
    {
      id: 1,
      title: "기존 할 일",
      done: true,
      createdAt: "2025-01-02 03:04:05",
      dueDate: null,
      priority: "normal",
      category: "other",
    },
  ]);
});

test("persists todo metadata and preserves create, toggle, delete, and ordering", async () => {
  const repository = createTodoRepository(createTestClient());

  await repository.insertTodo({
    title: "내일 제출",
    dueDate: "2026-11-20",
    priority: "high",
    category: "study",
  });
  await repository.insertTodo({
    title: "장보기",
    dueDate: null,
    priority: "low",
    category: "daily",
  });

  const [newest, older] = await repository.listTodos();
  assert.equal(newest.title, "장보기");
  assert.equal(newest.dueDate, null);
  assert.equal(newest.priority, "low");
  assert.equal(newest.category, "daily");
  assert.equal(older.title, "내일 제출");
  assert.equal(older.dueDate, "2026-11-20");
  assert.equal(older.priority, "high");
  assert.equal(older.category, "study");

  await repository.toggleTodo(older.id);
  assert.equal((await repository.listTodos()).find((todo) => todo.id === older.id).done, true);

  await repository.removeTodo(newest.id);
  assert.deepEqual((await repository.listTodos()).map((todo) => todo.title), ["내일 제출"]);
});
