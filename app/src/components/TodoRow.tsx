import { useState } from 'react'
import type { Todo } from '../lib/types'

function isOverdue(dueDate: string | null, done: boolean) {
  if (!dueDate || done) return false
  const today = new Date().toISOString().slice(0, 10)
  return dueDate < today
}

export function TodoRow({
  todo,
  onToggle,
  onUpdate,
  onDelete,
}: {
  todo: Todo
  onToggle: () => void
  onUpdate: (patch: Partial<Todo>) => void
  onDelete: () => void
}) {
  const [editing, setEditing] = useState(false)
  const [text, setText] = useState(todo.text)

  function commitText() {
    setEditing(false)
    const trimmed = text.trim()
    if (trimmed && trimmed !== todo.text) onUpdate({ text: trimmed })
    else setText(todo.text)
  }

  const overdue = isOverdue(todo.due_date, todo.done)

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
      <button
        type="button"
        onClick={onToggle}
        aria-label="切換完成"
        className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold ${
          todo.done ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-slate-300 text-transparent'
        }`}
      >
        ✓
      </button>

      <div className="min-w-0 flex-1">
        {editing ? (
          <input
            autoFocus
            value={text}
            onChange={(e) => setText(e.target.value)}
            onBlur={commitText}
            onKeyDown={(e) => e.key === 'Enter' && commitText()}
            className="w-full rounded-lg border border-slate-300 px-2 py-1 text-sm"
          />
        ) : (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className={`block truncate text-left text-sm font-medium ${
              todo.done ? 'text-slate-400 line-through' : 'text-slate-800'
            }`}
          >
            {todo.text}
          </button>
        )}
      </div>

      <input
        type="date"
        value={todo.due_date ?? ''}
        onChange={(e) => onUpdate({ due_date: e.target.value || null })}
        className={`w-[9.5rem] flex-shrink-0 rounded-lg border px-1.5 py-1 text-xs ${
          overdue ? 'border-rose-300 bg-rose-50 text-rose-600' : 'border-slate-200 text-slate-500'
        }`}
      />

      <button type="button" onClick={onDelete} className="flex-shrink-0 text-slate-300 hover:text-rose-500">
        ✕
      </button>
    </div>
  )
}
