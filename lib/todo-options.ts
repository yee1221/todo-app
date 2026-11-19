export const TODO_PRIORITIES = [
  { value: "high", label: "높음" },
  { value: "normal", label: "보통" },
  { value: "low", label: "낮음" },
] as const;

export const TODO_CATEGORIES = [
  { value: "study", label: "공부" },
  { value: "daily", label: "일상" },
  { value: "work", label: "업무" },
  { value: "other", label: "기타" },
] as const;

export type TodoPriority = (typeof TODO_PRIORITIES)[number]["value"];
export type TodoCategory = (typeof TODO_CATEGORIES)[number]["value"];

export function isTodoPriority(value: string): value is TodoPriority {
  return TODO_PRIORITIES.some((priority) => priority.value === value);
}

export function isTodoCategory(value: string): value is TodoCategory {
  return TODO_CATEGORIES.some((category) => category.value === value);
}
