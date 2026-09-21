import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { STOP_TYPE_LABEL } from '../lib/types'
import type { Day, Stop } from '../lib/types'
import { StopThumb } from './StopThumb'

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

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const otherDays = days.filter((d) => d.id !== stop.day_id)

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`rounded-2xl border border-slate-200 bg-white p-3 shadow-sm ${isDragging ? 'z-10 opacity-50' : ''}`}
    >
      <div className="flex gap-3">
        <button
          type="button"
          {...attributes}
          {...listeners}
          aria-label="拖曳排序"
          className="touch-none self-stretch px-1 text-slate-300 active:text-slate-500"
        >
          ☰
        </button>

        <StopThumb stop={stop} size="md" />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            {stop.time && (
              <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-xs font-medium text-slate-600">
                {stop.time}
              </span>
            )}
            <span className="rounded-md bg-sky-100 px-1.5 py-0.5 text-xs font-medium text-sky-700">
              {STOP_TYPE_LABEL[stop.type]}
            </span>
            {stop.needs_booking && (
              <span className="rounded-md bg-rose-100 px-1.5 py-0.5 text-xs font-medium text-rose-600">🔖 需訂位</span>
            )}
            {stop.who_wants.length > 0 && (
              <span className="text-xs text-slate-400">{stop.who_wants.join('・')}</span>
            )}
          </div>

          <div className="mt-1 truncate font-semibold text-slate-800">{stop.name}</div>
          {stop.note && <div className="mt-0.5 whitespace-pre-line text-sm text-slate-500">{stop.note}</div>}
          {stop.hours && <div className="mt-0.5 whitespace-pre-line text-xs text-slate-400">🕐 {stop.hours}</div>}

          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            {stop.map_url && (
              <a
                href={stop.map_url.split('\n')[0]}
                target="_blank"
                rel="noreferrer"
                className="rounded-lg bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700"
              >
                🗺️ 地圖
              </a>
            )}
            <button
              type="button"
              onClick={onEdit}
              className="rounded-lg bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600"
            >
              ✏️ 編輯
            </button>
            <button
              type="button"
              onClick={onDelete}
              className="rounded-lg bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600"
            >
              🗑️ 刪除
            </button>

            {otherDays.length > 0 && (
              <>
                <select
                  value=""
                  onChange={(e) => {
                    if (e.target.value) onMove(e.target.value)
                    e.target.value = ''
                  }}
                  className="rounded-lg bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600"
                >
                  <option value="">➡️ 搬到...</option>
                  {otherDays.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.date.slice(5)} {d.region}
                    </option>
                  ))}
                </select>
                <select
                  value=""
                  onChange={(e) => {
                    if (e.target.value) onCopy(e.target.value)
                    e.target.value = ''
                  }}
                  className="rounded-lg bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600"
                >
                  <option value="">📋 複製到...</option>
                  {otherDays.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.date.slice(5)} {d.region}
                    </option>
                  ))}
                </select>
              </>
            )}

            <div className="ml-auto flex gap-1">
              <button
                type="button"
                disabled={isFirst}
                onClick={() => onReorder('up')}
                className="rounded-lg bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600 disabled:opacity-30"
              >
                ▲
              </button>
              <button
                type="button"
                disabled={isLast}
                onClick={() => onReorder('down')}
                className="rounded-lg bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600 disabled:opacity-30"
              >
                ▼
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
