import assert from "node:assert/strict";
import { test } from "node:test";
import { parseTodoInput } from "../lib/todo-input.ts";

function formWith(values) {
  const form = new FormData();
  for (const [name, value] of Object.entries(values)) {
    if (value !== null) form.set(name, value);
  }
  return form;
}

test("accepts valid todo fields and applies defaults for existing form callers", () => {
  assert.deepEqual(
    parseTodoInput(formWith({ title: "  과제 제출  ", dueDate: "2026-11-20", priority: "high", category: "study" })),
    {
      title: "과제 제출",
      dueDate: "2026-11-20",
      priority: "high",
      category: "study",
    },
  );

  assert.deepEqual(parseTodoInput(formWith({ title: "장보기" })), {
    title: "장보기",
    dueDate: null,
    priority: "normal",
    category: "other",
  });
});

test("rejects blank, oversized, malformed, or unsupported todo fields", () => {
  assert.equal(parseTodoInput(formWith({ title: " \t " })), null);
  assert.equal(parseTodoInput(formWith({ title: "a".repeat(201) })), null);
  assert.equal(parseTodoInput(formWith({ title: "날짜 오류", dueDate: "2026-02-30" })), null);
  assert.equal(parseTodoInput(formWith({ title: "우선순위 오류", priority: "urgent" })), null);
  assert.equal(parseTodoInput(formWith({ title: "분류 오류", category: "personal" })), null);
});
