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
}: {
  day: Day
  stops: Stop[]
  onOpen: () => void
}) {
  const { attributes, listeners, setNodeRef: setDragRef, transform, isDragging } = useDraggable({
    id: day.id,
  })
  const { setNodeRef: setDropRef, isOver } = useDroppable({ id: day.id })

  const setRefs = (node: HTMLElement | null) => {
    setDragRef(node)
    setDropRef(node)
  }

  const bookingCount = stops.filter((s) => s.needs_booking).length
  const preview = stops.slice(0, 3)

  return (
    <div
      ref={setRefs}
      style={{ transform: CSS.Translate.toString(transform) }}
      className={`relative rounded-lg border bg-card p-5 transition ${isDragging ? 'z-10 opacity-40' : ''} ${
        isOver ? 'border-primary' : 'border-hairline'
      }`}
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

      <button type="button" onClick={onOpen} className="block w-full text-left">
        <div className="pr-8">
          <div className="font-serif text-2xl text-ink tabular-nums">{formatDateLabel(day.date)}</div>
          <div className="mt-1 truncate text-sm text-muted">{day.title || '尚未命名'}</div>
        </div>

        <div className="mt-4 flex gap-2">
          {preview.length === 0 && <div className="text-xs text-muted/70">還沒有安排行程</div>}
          {preview.map((s) => (
            <StopThumb key={s.id} stop={s} size="sm" />
          ))}
        </div>

        <div className="mt-4 flex items-center justify-between">
          <span className="text-xs text-muted">{stops.length} 個行程</span>
          {bookingCount > 0 && <BookingFlag />}
        </div>
      </button>
    </div>
  )
}
