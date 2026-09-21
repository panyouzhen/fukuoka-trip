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
    <div className="sticky top-[57px] z-10 -mx-4 flex gap-2 overflow-x-auto border-b border-slate-200 bg-slate-50/95 px-4 py-2 backdrop-blur [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {days.map((day) => {
        const active = day.id === activeId
        return (
          <button
            key={day.id}
            type="button"
            data-day-id={day.id}
            onClick={() => onSelect(day.id)}
            className={`flex flex-shrink-0 scroll-mx-4 snap-start flex-col items-center rounded-xl px-3 py-1.5 transition ${
              active ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 hover:bg-slate-100'
            }`}
          >
            <span className="text-sm font-semibold">{formatDateLabel(day.date)}</span>
            <span className={`max-w-20 truncate text-[11px] ${active ? 'text-slate-300' : 'text-slate-400'}`}>
              {day.region || '未命名'}
            </span>
          </button>
        )
      })}
    </div>
  )
}
