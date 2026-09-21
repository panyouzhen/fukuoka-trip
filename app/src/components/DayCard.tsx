import { useEffect, useState } from 'react'
import { useDraggable, useDroppable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical } from 'lucide-react'
import { formatDateLabel } from '../lib/date'
import type { Day, Stop } from '../lib/types'
import { StopThumb } from './StopThumb'
import { BookingFlag } from './BookingFlag'

export function DayCard({
  day,
  stops,
  onOpen,
  onTitleChange,
}: {
  day: Day
  stops: Stop[]
  onOpen: () => void
  onTitleChange: (title: string) => void
}) {
  const { attributes, listeners, setNodeRef: setDragRef, transform, isDragging } = useDraggable({
    id: day.id,
  })
  const { setNodeRef: setDropRef, isOver } = useDroppable({ id: day.id })

  const setRefs = (node: HTMLElement | null) => {
    setDragRef(node)
    setDropRef(node)
  }

  const [editing, setEditing] = useState(false)
  const [titleText, setTitleText] = useState(day.title ?? '')

  useEffect(() => {
    if (!editing) setTitleText(day.title ?? '')
  }, [day.title, editing])

  function commitTitle() {
    setEditing(false)
    const trimmed = titleText.trim()
    if (trimmed !== (day.title ?? '').trim()) onTitleChange(trimmed)
  }

  const bookingCount = stops.filter((s) => s.needs_booking).length
  const preview = stops.slice(0, 3)

  return (
    <div
      ref={setRefs}
      className={`relative rounded-lg border bg-card p-5 transition ${isDragging ? 'z-10 opacity-40' : ''} ${
        isOver ? 'border-primary' : 'border-hairline'
      }`}
      style={{ transform: CSS.Translate.toString(transform) }}
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        aria-label="拖曳交換這一天"
        className="absolute right-3 top-3 flex h-8 w-8 touch-none items-center justify-center text-muted/50 active:text-muted"
      >
        <GripVertical size={18} strokeWidth={1.5} />
      </button>

      <div className="pr-8">
        <button type="button" onClick={onOpen} className="block font-serif text-2xl tabular-nums text-ink">
          {formatDateLabel(day.date)}
        </button>

        {editing ? (
          <input
            autoFocus
            value={titleText}
            onChange={(e) => setTitleText(e.target.value)}
            onBlur={commitTitle}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commitTitle()
              if (e.key === 'Escape') {
                setTitleText(day.title ?? '')
                setEditing(false)
              }
            }}
            className="mt-1 w-full rounded-md border border-primary bg-card px-1.5 py-0.5 text-sm text-ink focus:outline-none"
          />
        ) : (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              setEditing(true)
            }}
            className="mt-1 block w-full truncate text-left text-sm text-muted hover:text-ink"
          >
            {day.title || '點這裡輸入標題'}
          </button>
        )}
      </div>

      <button type="button" onClick={onOpen} className="mt-4 flex w-full gap-2">
        {preview.length === 0 && <div className="text-xs text-muted/70">還沒有安排行程</div>}
        {preview.map((s) => (
          <StopThumb key={s.id} stop={s} size="sm" />
        ))}
      </button>

      <button type="button" onClick={onOpen} className="mt-4 flex w-full items-center justify-between">
        <span className="text-xs text-muted">{stops.length} 個行程</span>
        {bookingCount > 0 && <BookingFlag />}
      </button>
    </div>
  )
}
