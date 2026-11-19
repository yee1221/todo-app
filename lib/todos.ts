import "server-only";
import { createClient, type Client } from "@libsql/client";

export type Todo = {
  id: number;
  title: string;
  done: boolean;
  createdAt: string;
};

let client: Client | undefined;
let initialization: Promise<void> | undefined;

function getClient() {
  if (!client) {
    const url = process.env.TURSO_DATABASE_URL;
    const authToken = process.env.TURSO_AUTH_TOKEN;

    if (!url || !authToken) {
      throw new Error("Turso 환경변수가 설정되지 않았습니다.");
    }

    client = createClient({ url, authToken });
  }

  return client;
}

async function ensureTodosTable() {
  if (!initialization) {
    initialization = getClient()
      .execute(`
        CREATE TABLE IF NOT EXISTS todos (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          done INTEGER NOT NULL DEFAULT 0,
          created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
      `)
      .then(() => undefined)
      .catch((error: unknown) => {
        initialization = undefined;
        throw error;
      });
  }

  await initialization;
}

export async function listTodos(): Promise<Todo[]> {
  await ensureTodosTable();

  const result = await getClient().execute(
    "SELECT id, title, done, created_at FROM todos ORDER BY created_at DESC, id DESC",
  );

  return result.rows.map((row) => ({
    id: Number(row.id),
    title: String(row.title),
    done: Number(row.done) === 1,
    createdAt: String(row.created_at),
  }));
}

export async function insertTodo(title: string) {
  await ensureTodosTable();
  await getClient().execute({
    sql: "INSERT INTO todos (title) VALUES (?)",
    args: [title],
  });
}

export async function toggleTodo(id: number) {
  await ensureTodosTable();
  await getClient().execute({
    sql: "UPDATE todos SET done = CASE WHEN done = 0 THEN 1 ELSE 0 END WHERE id = ?",
    args: [id],
  });
}

export async function removeTodo(id: number) {
  await ensureTodosTable();
  await getClient().execute({
    sql: "DELETE FROM todos WHERE id = ?",
    args: [id],
  });
}
