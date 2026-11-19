import { Suspense } from "react";
import { connection } from "next/server";
import { addTodo } from "./actions";
import { listTodos } from "@/lib/todos";
import { TODO_CATEGORIES, TODO_PRIORITIES } from "@/lib/todo-options";
import { getSeoulToday } from "@/lib/todo-view";
import { TodoListClient } from "./todo-list-client";

export default function Home() {
  return (
    <main className="page-shell">
      <section className="todo-card" aria-labelledby="page-title">
        <header className="page-header">
          <p className="eyebrow">MY DAILY LIST</p>
          <h1 id="page-title">오늘의 할 일</h1>
          <p className="subtitle">작은 한 걸음씩, 차근차근 해내봐요.</p>
        </header>

        <form action={addTodo} className="add-form">
          <label className="sr-only" htmlFor="todo-title">
            새로운 할 일
          </label>
          <input
            id="todo-title"
            name="title"
            type="text"
            placeholder="새로운 할 일을 입력하세요"
            maxLength={200}
            required
          />
          <div className="todo-options">
            <label className="option-field">
              <span>마감일</span>
              <input name="dueDate" type="date" />
            </label>
            <label className="option-field">
              <span>우선순위</span>
              <select name="priority" defaultValue="normal">
                {TODO_PRIORITIES.map((priority) => (
                  <option key={priority.value} value={priority.value}>{priority.label}</option>
                ))}
              </select>
            </label>
            <label className="option-field">
              <span>카테고리</span>
              <select name="category" defaultValue="other">
                {TODO_CATEGORIES.map((category) => (
                  <option key={category.value} value={category.value}>{category.label}</option>
                ))}
              </select>
            </label>
          </div>
          <button type="submit" className="add-button">
            <span aria-hidden="true">+</span> 추가
          </button>
        </form>

        <Suspense fallback={<TodoListFallback />}>
          <TodoList />
        </Suspense>

        <footer className="card-footer">오늘도 하나씩 해내면 충분해요 <span aria-hidden="true">🌱</span></footer>
      </section>
    </main>
  );
}

async function TodoList() {
  await connection();
  const todos = await listTodos();
  const today = getSeoulToday(new Date());

  return <TodoListClient todos={todos} today={today} />;
}

function TodoListFallback() {
  return (
    <>
      <div className="list-heading">
        <h2>할 일 목록</h2>
        <span className="remaining-count">불러오는 중</span>
      </div>
      <div className="empty-state" aria-live="polite">
        <p>할 일을 불러오고 있어요.</p>
      </div>
    </>
  );
}
