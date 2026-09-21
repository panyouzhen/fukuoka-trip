import { useNavigate } from 'react-router-dom'
import type { Day } from '../lib/types'

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六']

export function MonthCalendar({
  days,
  year = 2026,
  month = 11,
}: {
  days: Day[]
  year?: number
  month?: number
}) {
  const navigate = useNavigate()
  const first = new Date(year, month - 1, 1)
  const startWeekday = first.getDay()
  const daysInMonth = new Date(year, month, 0).getDate()

  const cells: (number | null)[] = Array(startWeekday).fill(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)
  while (cells.length % 7 !== 0) cells.push(null)

  const dayByDate = new Map(days.map((d) => [d.date, d]))

  return (
    <div className="rounded-lg border border-hairline bg-card p-5">
      <div className="mb-3 font-serif text-base text-ink tabular-nums">
        {year} 年 {month} 月
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs text-muted">
        {WEEKDAYS.map((w) => (
          <div key={w} className="py-1">
            {w}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((d, i) => {
          if (d === null) return <div key={i} />
          const iso = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`
          const tripDay = dayByDate.get(iso)
          return (
            <button
              key={i}
              type="button"
              disabled={!tripDay}
              onClick={() => tripDay && navigate(`/day/${tripDay.id}`)}
              className={`aspect-square rounded-md text-sm tabular-nums transition ${
                tripDay ? 'bg-primary text-card' : 'text-muted/50'
              }`}
            >
              {d}
            </button>
          )
        })}
      </div>
    </div>
  )
}
