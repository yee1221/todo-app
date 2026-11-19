import type { Client } from "@libsql/client";
import type { TodoCategory, TodoPriority } from "./todo-options.ts";

export type Todo = {
  id: number;
  title: string;
  done: boolean;
  createdAt: string;
  dueDate: string | null;
  priority: TodoPriority;
  category: TodoCategory;
};

export type NewTodo = Pick<Todo, "title" | "dueDate" | "priority" | "category">;

const TODO_TABLE_SQL = `
  CREATE TABLE IF NOT EXISTS todos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    done INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    due_date TEXT DEFAULT NULL,
    priority TEXT NOT NULL DEFAULT 'normal',
    category TEXT NOT NULL DEFAULT 'other'
  )
`;

const TODO_COLUMNS_TO_ADD = [
  { name: "due_date", definition: "TEXT DEFAULT NULL" },
  { name: "priority", definition: "TEXT NOT NULL DEFAULT 'normal'" },
  { name: "category", definition: "TEXT NOT NULL DEFAULT 'other'" },
] as const;

export function createTodoRepository(client: Client) {
  let initialization: Promise<void> | undefined;

  async function readColumnNames() {
    const result = await client.execute("PRAGMA table_info(todos)");
    return new Set(result.rows.map((row) => String(row.name)));
  }

  async function migrateTodoColumns() {
    let columns = await readColumnNames();

    for (const column of TODO_COLUMNS_TO_ADD) {
      if (columns.has(column.name)) continue;

      try {
        await client.execute(
          `ALTER TABLE todos ADD COLUMN ${column.name} ${column.definition}`,
        );
      } catch (error) {
        columns = await readColumnNames();
        if (!columns.has(column.name)) throw error;
      }

      columns.add(column.name);
    }
  }

  async function ensureTodosTable() {
    if (!initialization) {
      initialization = client
        .execute(TODO_TABLE_SQL)
        .then(migrateTodoColumns)
        .catch((error: unknown) => {
          initialization = undefined;
          throw error;
        });
    }

    await initialization;
  }

  return {
    async listTodos(): Promise<Todo[]> {
      await ensureTodosTable();

      const result = await client.execute(
        `SELECT id, title, done, created_at, due_date, priority, category
         FROM todos ORDER BY created_at DESC, id DESC`,
      );

      return result.rows.map((row) => ({
        id: Number(row.id),
        title: String(row.title),
        done: Number(row.done) === 1,
        createdAt: String(row.created_at),
        dueDate: row.due_date === null ? null : String(row.due_date),
        priority: String(row.priority) as TodoPriority,
        category: String(row.category) as TodoCategory,
      }));
    },

    async insertTodo(todo: NewTodo) {
      await ensureTodosTable();
      await client.execute({
        sql: `INSERT INTO todos (title, due_date, priority, category)
              VALUES (?, ?, ?, ?)`,
        args: [todo.title, todo.dueDate, todo.priority, todo.category],
      });
    },

    async toggleTodo(id: number) {
      await ensureTodosTable();
      await client.execute({
        sql: "UPDATE todos SET done = CASE WHEN done = 0 THEN 1 ELSE 0 END WHERE id = ?",
        args: [id],
      });
    },

    async removeTodo(id: number) {
      await ensureTodosTable();
      await client.execute({
        sql: "DELETE FROM todos WHERE id = ?",
        args: [id],
      });
    },
  };
}
