import { addTodo, deleteTodoAction, toggleTodoAction } from "./actions";
import { listTodos } from "@/lib/todos";

export default async function Home() {
  const todos = await listTodos();
  const remaining = todos.filter((todo) => !todo.done).length;

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
          <button type="submit" className="add-button">
            <span aria-hidden="true">+</span> 추가
          </button>
        </form>

        <div className="list-heading">
          <h2>할 일 목록</h2>
          <span className="remaining-count">남은 할 일 {remaining}개</span>
        </div>

        {todos.length > 0 ? (
          <ul className="todo-list">
            {todos.map((todo) => (
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
                <span className="todo-title">{todo.title}</span>
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
            ))}
          </ul>
        ) : (
          <div className="empty-state">
            <span className="empty-icon" aria-hidden="true">✦</span>
            <p>아직 할 일이 없어요.</p>
            <span>첫 번째 할 일을 추가해 보세요!</span>
          </div>
        )}

        <footer className="card-footer">오늘도 하나씩 해내면 충분해요 <span aria-hidden="true">🌱</span></footer>
      </section>
    </main>
  );
}
