import { useState } from 'react'
import { Check, X } from 'lucide-react'
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
    <div className="flex items-center gap-3 rounded-lg border border-hairline bg-card p-3">
      <button
        type="button"
        onClick={onToggle}
        aria-label="切換完成"
        className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border ${
          todo.done ? 'border-primary bg-primary text-card' : 'border-hairline text-transparent'
        }`}
      >
        <Check size={13} strokeWidth={2} />
      </button>

      <div className="min-w-0 flex-1">
        {editing ? (
          <input
            autoFocus
            value={text}
            onChange={(e) => setText(e.target.value)}
            onBlur={commitText}
            onKeyDown={(e) => e.key === 'Enter' && commitText()}
            className="w-full rounded-md border border-hairline bg-card px-2 py-1 text-sm text-ink focus:outline-none focus:border-primary"
          />
        ) : (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className={`block truncate text-left text-sm ${todo.done ? 'text-muted line-through' : 'text-ink'}`}
          >
            {todo.text}
          </button>
        )}
      </div>

      <input
        type="date"
        value={todo.due_date ?? ''}
        onChange={(e) => onUpdate({ due_date: e.target.value || null })}
        className={`w-[9.5rem] flex-shrink-0 rounded-md border px-1.5 py-1 text-xs tabular-nums ${
          overdue ? 'border-warn/40 text-warn' : 'border-hairline text-muted'
        }`}
      />

      <button type="button" onClick={onDelete} className="flex-shrink-0 text-muted/60 hover:text-warn">
        <X size={16} strokeWidth={1.5} />
      </button>
    </div>
  )
}
