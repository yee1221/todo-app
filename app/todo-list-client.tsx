"use client";

import { useState } from "react";
import { deleteTodoAction, toggleTodoAction } from "./actions";
import { TODO_CATEGORIES, TODO_PRIORITIES } from "@/lib/todo-options";
import type { Todo } from "@/lib/todo-repository";
import {
  filterTodos,
  getDdayLabel,
  getTodoProgress,
  type TodoStatusFilter,
} from "@/lib/todo-view";

type TodoListClientProps = {
  todos: Todo[];
  today: string;
};

const STATUS_FILTERS: { value: TodoStatusFilter; label: string }[] = [
  { value: "all", label: "전체" },
  { value: "active", label: "진행 중" },
  { value: "done", label: "완료" },
];

function formatDueDate(date: string) {
  const [year, month, day] = date.split("-");
  return `${year}.${month}.${day}`;
}

export function TodoListClient({ todos, today }: TodoListClientProps) {
  const [status, setStatus] = useState<TodoStatusFilter>("all");
  const [search, setSearch] = useState("");
  const [dueToday, setDueToday] = useState(false);
  const progress = getTodoProgress(todos);
  const visibleTodos = filterTodos(todos, { status, search, dueToday, today });

  return (
    <>
      <section className="progress-panel" aria-label="전체 할 일 진행률">
        <div className="progress-copy">
          <span>전체 완료율</span>
          <strong>{progress.percent}%</strong>
        </div>
        <div
          className="progress-track"
          role="progressbar"
          aria-label="전체 할 일 완료율"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progress.percent}
        >
          <span className="progress-value" style={{ width: `${progress.percent}%` }} />
        </div>
        <span className="progress-count">{progress.completed} / {progress.total}개 완료</span>
      </section>

      <div className="list-heading">
        <h2>할 일 목록</h2>
        <span className="remaining-count">남은 할 일 {todos.length - progress.completed}개</span>
      </div>

      <section className="todo-tools" aria-label="할 일 검색 및 필터">
        <label className="search-field">
          <span className="sr-only">제목 검색</span>
          <svg aria-hidden="true" viewBox="0 0 20 20" fill="none">
            <circle cx="8.7" cy="8.7" r="5.7" />
            <path d="m13 13 4 4" />
          </svg>
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="할 일 검색"
          />
        </label>
        <div className="filter-row">
          <div className="status-filters" aria-label="완료 상태">
            {STATUS_FILTERS.map((filter) => (
              <button
                key={filter.value}
                type="button"
                className={`filter-button${status === filter.value ? " is-selected" : ""}`}
                aria-pressed={status === filter.value}
                onClick={() => setStatus(filter.value)}
              >
                {filter.label}
              </button>
            ))}
          </div>
          <button
            type="button"
            className={`today-filter${dueToday ? " is-selected" : ""}`}
            aria-pressed={dueToday}
            onClick={() => setDueToday((selected) => !selected)}
          >
            <svg aria-hidden="true" viewBox="0 0 20 20" fill="none">
              <rect x="3" y="4.5" width="14" height="12.5" rx="2" />
              <path d="M6.5 3v3M13.5 3v3M3 8h14" />
            </svg>
            오늘 마감
          </button>
        </div>
      </section>

      <p className="result-count" aria-live="polite">
        {visibleTodos.length === todos.length
          ? `전체 ${todos.length}개`
          : `${visibleTodos.length}개 표시 중`}
      </p>

      {visibleTodos.length > 0 ? (
        <ul className="todo-list">
          {visibleTodos.map((todo) => {
            const priority = TODO_PRIORITIES.find((option) => option.value === todo.priority);
            const category = TODO_CATEGORIES.find((option) => option.value === todo.category);
            const dday = getDdayLabel(todo.dueDate, today);

            return (
              <li className={`todo-item${todo.done ? " is-done" : ""}`} key={todo.id}>
                <form action={toggleTodoAction}>
                  <input type="hidden" name="id" value={todo.id} />
                  <button
                    type="submit"
                    className="check-button"
                    aria-label={todo.done ? `${todo.title} 완료 취소` : `${todo.title} 완료`}
                    title={todo.done ? "완료 취소" : "완료"}
                  >
                    {todo.done ? <span aria-hidden="true">✓</span> : null}
                  </button>
                </form>
                <div className="todo-copy">
                  <span className="todo-title">{todo.title}</span>
                  <div className="todo-metadata">
                    <span className={`priority-tag priority-${todo.priority}`}>
                      {priority?.label ?? "보통"}
                    </span>
                    <span className="category-tag">{category?.label ?? "기타"}</span>
                    {todo.dueDate ? (
                      <span className={`due-date${dday?.startsWith("D+") ? " is-overdue" : ""}`}>
                        <time dateTime={todo.dueDate}>{formatDueDate(todo.dueDate)}</time>
                        <span>{dday}</span>
                      </span>
                    ) : null}
                  </div>
                </div>
                <form action={deleteTodoAction}>
                  <input type="hidden" name="id" value={todo.id} />
                  <button
                    type="submit"
                    className="delete-button"
                    aria-label={`${todo.title} 삭제`}
                    title="삭제"
                  >
                    <svg aria-hidden="true" viewBox="0 0 20 20" fill="none">
                      <path d="M4.5 6h11m-9.5 0 .6 10h6.8L14 6m-6.5 0V4.5h5V6m-4 2.5v5m3-5v5" />
                    </svg>
                  </button>
                </form>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="empty-state">
          <span className="empty-icon" aria-hidden="true">✦</span>
          <p>{todos.length === 0 ? "아직 할 일이 없어요." : "조건에 맞는 할 일이 없어요."}</p>
          <span>
            {todos.length === 0 ? "첫 번째 할 일을 추가해 보세요!" : "검색어나 필터를 바꿔 보세요."}
          </span>
        </div>
      )}
    </>
  );
}
