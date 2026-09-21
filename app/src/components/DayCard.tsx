import { useDraggable, useDroppable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { formatDateLabel } from '../lib/date'
import type { Day, Stop } from '../lib/types'
import { StopThumb } from './StopThumb'

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
      className={`relative rounded-2xl border bg-white p-4 shadow-sm transition ${
        isDragging ? 'z-10 opacity-40' : ''
      } ${isOver ? 'border-sky-400 ring-2 ring-sky-300' : 'border-slate-200'}`}
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        aria-label="拖曳交換這一天"
        className="absolute right-3 top-3 flex h-8 w-8 touch-none items-center justify-center rounded-lg text-slate-300 active:bg-slate-100 active:text-slate-500"
      >
        ☰
      </button>

      <button type="button" onClick={onOpen} className="block w-full text-left">
        <div className="pr-8">
          <div className="text-sm font-semibold text-sky-600">{formatDateLabel(day.date)}</div>
          <div className="mt-0.5 truncate text-base font-bold text-slate-800">{day.title || '（尚未命名）'}</div>
          {day.region && day.region !== day.title && (
            <div className="truncate text-xs text-slate-400">{day.region}</div>
          )}
        </div>

        <div className="mt-3 flex gap-2">
          {preview.length === 0 && <div className="text-xs text-slate-300">還沒有安排行程</div>}
          {preview.map((s) => (
            <StopThumb key={s.id} stop={s} size="sm" />
          ))}
        </div>

        <div className="mt-3 flex items-center justify-between">
          <span className="text-xs text-slate-400">{stops.length} 個行程</span>
          {bookingCount > 0 && (
            <span className="rounded-full bg-rose-100 px-2 py-0.5 text-xs font-medium text-rose-600">
              🔖 需訂位 x{bookingCount}
            </span>
          )}
        </div>
      </button>
    </div>
  )
}
