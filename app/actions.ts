"use server";

import { revalidatePath } from "next/cache";
import { insertTodo, removeTodo, toggleTodo } from "@/lib/todos";

const MAX_TODO_TITLE_LENGTH = 200;

function readTodoId(formData: FormData) {
  const id = Number(formData.get("id"));
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

export async function addTodo(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  if (!title || title.length > MAX_TODO_TITLE_LENGTH) return;

  await insertTodo(title);
  revalidatePath("/");
}

export async function toggleTodoAction(formData: FormData) {
  const id = readTodoId(formData);
  if (id === null) return;

  await toggleTodo(id);
  revalidatePath("/");
}

export async function deleteTodoAction(formData: FormData) {
  const id = readTodoId(formData);
  if (id === null) return;

  await removeTodo(id);
  revalidatePath("/");
}
