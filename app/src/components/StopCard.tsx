import { useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, MoreHorizontal, MapPin } from 'lucide-react'
import type { Day, Stop } from '../lib/types'
import { StopThumb } from './StopThumb'
import { TypeTag } from './TypeTag'
import { BookingFlag } from './BookingFlag'
import { PersonBadgeRow } from './PersonBadge'
import { StopActionSheet } from './StopActionSheet'

export function StopCard({
  stop,
  days,
  isFirst,
  isLast,
  onEdit,
  onDelete,
  onMove,
  onCopy,
  onReorder,
}: {
  stop: Stop
  days: Day[]
  isFirst: boolean
  isLast: boolean
  onEdit: () => void
  onDelete: () => void
  onMove: (targetDayId: string) => void
  onCopy: (targetDayId: string) => void
  onReorder: (direction: 'up' | 'down') => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: stop.id })
  const [menuOpen, setMenuOpen] = useState(false)

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`rounded-lg border border-hairline bg-card p-3 ${isDragging ? 'z-10 opacity-50' : ''}`}
    >
      <div className="flex gap-3">
        <button
          type="button"
          {...attributes}
          {...listeners}
          aria-label="拖曳排序"
          className="touch-none self-stretch px-1 text-muted/50"
        >
          <GripVertical size={18} strokeWidth={1.5} />
        </button>

        <StopThumb stop={stop} size="md" />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            {stop.time && <span className="text-xs tabular-nums text-muted">{stop.time}</span>}
            <TypeTag type={stop.type} />
            {stop.needs_booking && <BookingFlag />}
          </div>

          <div className="mt-1 flex items-baseline justify-between gap-2">
            <span className="truncate font-medium text-ink">{stop.name}</span>
            <PersonBadgeRow people={stop.who_wants} />
          </div>

          {stop.note && <div className="mt-0.5 whitespace-pre-line text-sm leading-relaxed text-muted">{stop.note}</div>}

          {stop.map_url && (
            <a
              href={stop.map_url.split('\n')[0]}
              target="_blank"
              rel="noreferrer"
              className="mt-1.5 inline-flex items-center gap-1 text-xs text-primary"
            >
              <MapPin size={13} strokeWidth={1.75} />
              地圖
            </a>
          )}
        </div>

        <button
          type="button"
          onClick={() => setMenuOpen(true)}
          aria-label="更多操作"
          className="self-start px-1 py-0.5 text-muted"
        >
          <MoreHorizontal size={18} strokeWidth={1.5} />
        </button>
      </div>

      {menuOpen && (
        <StopActionSheet
          days={days}
          currentDayId={stop.day_id}
          isFirst={isFirst}
          isLast={isLast}
          onEdit={() => {
            setMenuOpen(false)
            onEdit()
          }}
          onDelete={() => {
            setMenuOpen(false)
            onDelete()
          }}
          onMove={(id) => {
            setMenuOpen(false)
            onMove(id)
          }}
          onCopy={(id) => {
            setMenuOpen(false)
            onCopy(id)
          }}
          onReorder={(dir) => {
            setMenuOpen(false)
            onReorder(dir)
          }}
          onClose={() => setMenuOpen(false)}
        />
      )}
    </div>
  )
}
