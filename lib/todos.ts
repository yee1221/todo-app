import "server-only";
import { createClient, type Client } from "@libsql/client";
import {
  createTodoRepository,
  type NewTodo,
} from "@/lib/todo-repository";

let repository: ReturnType<typeof createTodoRepository> | undefined;

function getRepository() {
  if (!repository) {
    const url = process.env.TURSO_DATABASE_URL;
    const authToken = process.env.TURSO_AUTH_TOKEN;

    if (!url || !authToken) {
      throw new Error("Turso 환경변수가 설정되지 않았습니다.");
    }

    const client: Client = createClient({ url, authToken });
    repository = createTodoRepository(client);
  }

  return repository;
}

export function listTodos() {
  return getRepository().listTodos();
}

export function insertTodo(todo: NewTodo) {
  return getRepository().insertTodo(todo);
}

export function toggleTodo(id: number) {
  return getRepository().toggleTodo(id);
}

export function removeTodo(id: number) {
  return getRepository().removeTodo(id);
}
