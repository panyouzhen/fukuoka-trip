import { useMemo, useState } from 'react'
import { useRealtimeTable } from '../hooks/useRealtimeTable'
import type { Todo } from '../lib/types'
import { addTodo, deleteTodo, updateTodo } from '../lib/todoActions'
import { TodoRow } from '../components/TodoRow'

export function Todos() {
  const { rows: todos, setRows: setTodos, loading } = useRealtimeTable<Todo>('todos', {
    orderBy: { column: 'created_at' },
  })

  const [text, setText] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [showDone, setShowDone] = useState(false)

  const { pending, done } = useMemo(() => {
    const pending = todos
      .filter((t) => !t.done)
      .sort((a, b) => {
        if (a.due_date && b.due_date) return a.due_date.localeCompare(b.due_date)
        if (a.due_date) return -1
        if (b.due_date) return 1
        return a.created_at.localeCompare(b.created_at)
      })
    const done = todos.filter((t) => t.done).sort((a, b) => b.created_at.localeCompare(a.created_at))
    return { pending, done }
  }, [todos])

  async function handleAdd() {
    const trimmed = text.trim()
    if (!trimmed) return
    setText('')
    const due = dueDate || null
    setDueDate('')
    try {
      const created = await addTodo(trimmed, due)
      setTodos((prev) => [...prev, created])
    } catch (err) {
      console.error(err)
      alert('新增失敗，請檢查網路後重試')
    }
  }

  async function handleToggle(todo: Todo) {
    setTodos((prev) => prev.map((t) => (t.id === todo.id ? { ...t, done: !t.done } : t)))
    try {
      await updateTodo(todo.id, { done: !todo.done })
    } catch (err) {
      console.error(err)
    }
  }

  async function handleUpdate(todo: Todo, patch: Partial<Todo>) {
    setTodos((prev) => prev.map((t) => (t.id === todo.id ? { ...t, ...patch } : t)))
    try {
      await updateTodo(todo.id, patch)
    } catch (err) {
      console.error(err)
    }
  }

  async function handleDelete(todo: Todo) {
    setTodos((prev) => prev.filter((t) => t.id !== todo.id))
    try {
      await deleteTodo(todo.id)
    } catch (err) {
      console.error(err)
    }
  }

  if (loading) {
    return <div className="py-20 text-center text-sm text-muted">載入中…</div>
  }

  return (
    <div className="space-y-5">
      <h1 className="font-serif text-lg text-ink">待辦提醒</h1>

      <div className="flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          placeholder="新增待辦事項"
          className="flex-1 rounded-md border border-hairline bg-card px-3 py-2.5 text-sm text-ink placeholder:text-muted/60 focus:outline-none focus:border-primary"
        />
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="w-36 rounded-md border border-hairline bg-card px-2 py-2.5 text-sm tabular-nums text-ink focus:outline-none focus:border-primary"
        />
        <button
          type="button"
          onClick={handleAdd}
          className="rounded-md bg-primary px-4 text-sm font-medium text-card"
        >
          新增
        </button>
      </div>

      <div className="space-y-2">
        {pending.map((t) => (
          <TodoRow
            key={t.id}
            todo={t}
            onToggle={() => handleToggle(t)}
            onUpdate={(patch) => handleUpdate(t, patch)}
            onDelete={() => handleDelete(t)}
          />
        ))}
        {pending.length === 0 && <div className="py-10 text-center text-sm text-muted">目前沒有待辦事項</div>}
      </div>

      {done.length > 0 && (
        <div className="space-y-2">
          <button type="button" onClick={() => setShowDone((v) => !v)} className="text-xs text-muted">
            {showDone ? '隱藏' : '顯示'}已完成（{done.length}）
          </button>
          {showDone &&
            done.map((t) => (
              <TodoRow
                key={t.id}
                todo={t}
                onToggle={() => handleToggle(t)}
                onUpdate={(patch) => handleUpdate(t, patch)}
                onDelete={() => handleDelete(t)}
              />
            ))}
        </div>
      )}
    </div>
  )
}
