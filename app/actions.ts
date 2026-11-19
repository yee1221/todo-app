"use server";

import { revalidatePath } from "next/cache";
import { insertTodo, removeTodo, toggleTodo } from "@/lib/todos";
import { parseTodoInput } from "@/lib/todo-input";

function readTodoId(formData: FormData) {
  const id = Number(formData.get("id"));
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

export async function addTodo(formData: FormData) {
  const todo = parseTodoInput(formData);
  if (!todo) return;

  await insertTodo(todo);
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
