import { formatDateLabel } from '../lib/date'
import type { Day } from '../lib/types'

export function DayTabs({
  days,
  activeId,
  onSelect,
}: {
  days: Day[]
  activeId: string | null
  onSelect: (id: string) => void
}) {
  return (
    <div className="sticky top-[57px] z-10 -mx-4 flex gap-1 overflow-x-auto border-b border-hairline bg-paper px-4 py-2 sm:-mx-6 sm:px-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {days.map((day) => {
        const active = day.id === activeId
        return (
          <button
            key={day.id}
            type="button"
            data-day-id={day.id}
            onClick={() => onSelect(day.id)}
            className={`flex flex-shrink-0 flex-col items-center border-b-2 px-2.5 py-1.5 transition ${
              active ? 'border-primary' : 'border-transparent'
            }`}
          >
            <span className={`text-sm tabular-nums ${active ? 'font-medium text-ink' : 'text-muted'}`}>
              {formatDateLabel(day.date)}
            </span>
            <span className="max-w-20 truncate text-[11px] text-muted">{day.region || '未命名'}</span>
          </button>
        )
      })}
    </div>
  )
}
