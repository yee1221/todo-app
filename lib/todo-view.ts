import type { Todo } from "./todo-repository.ts";

export type TodoStatusFilter = "all" | "active" | "done";

export type TodoFilters = {
  status: TodoStatusFilter;
  search: string;
  dueToday: boolean;
  today: string;
};

export function getSeoulToday(now: Date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));

  return `${values.year}-${values.month}-${values.day}`;
}

export function getDdayLabel(dueDate: string | null, today: string) {
  if (!dueDate) return null;

  const dueTimestamp = Date.parse(`${dueDate}T00:00:00.000Z`);
  const todayTimestamp = Date.parse(`${today}T00:00:00.000Z`);
  if (!Number.isFinite(dueTimestamp) || !Number.isFinite(todayTimestamp)) return null;

  const days = (dueTimestamp - todayTimestamp) / 86_400_000;
  if (days === 0) return "D-Day";
  return days > 0 ? `D-${days}` : `D+${Math.abs(days)}`;
}

export function filterTodos(todos: Todo[], filters: TodoFilters) {
  const search = filters.search.trim().toLocaleLowerCase("ko-KR");

  return todos.filter((todo) => {
    if (filters.status === "active" && todo.done) return false;
    if (filters.status === "done" && !todo.done) return false;
    if (filters.dueToday && todo.dueDate !== filters.today) return false;
    if (search && !todo.title.toLocaleLowerCase("ko-KR").includes(search)) return false;
    return true;
  });
}

export function getTodoProgress(todos: Todo[]) {
  const completed = todos.filter((todo) => todo.done).length;
  const total = todos.length;

  return {
    completed,
    total,
    percent: total === 0 ? 0 : Math.round((completed / total) * 100),
  };
}
