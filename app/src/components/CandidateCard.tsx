import { MapPin, CircleCheck } from 'lucide-react'
import type { Day, Stop } from '../lib/types'
import { StopThumb } from './StopThumb'
import { TypeTag } from './TypeTag'
import { PersonBadgeRow } from './PersonBadge'

export function CandidateCard({
  stop,
  days,
  scheduledIn,
  onAdd,
}: {
  stop: Stop
  days: Day[]
  scheduledIn: Day[]
  onAdd: (targetDayId: string) => void
}) {
  return (
    <div className="flex gap-3 rounded-lg border border-hairline bg-card p-3">
      <StopThumb stop={stop} size="md" />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <TypeTag type={stop.type} />
          {stop.region && <span className="text-xs text-muted">{stop.region}</span>}
        </div>

        <div className="mt-1 flex items-baseline justify-between gap-2">
          <span className="truncate font-medium text-ink">{stop.name}</span>
          <PersonBadgeRow people={stop.who_wants} />
        </div>

        {stop.note && <div className="mt-0.5 line-clamp-2 text-sm text-muted">{stop.note}</div>}

        {scheduledIn.length > 0 && (
          <div className="mt-1.5 inline-flex items-center gap-1.5 text-xs text-primary">
            <CircleCheck size={13} strokeWidth={1.5} />
            已排入 {scheduledIn.map((d) => d.date.slice(5)).join('、')}
          </div>
        )}

        <div className="mt-2 flex flex-wrap items-center gap-3">
          {stop.map_url && (
            <a
              href={stop.map_url.split('\n')[0]}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-xs text-primary"
            >
              <MapPin size={13} strokeWidth={1.75} />
              地圖
            </a>
          )}
          <select
            value=""
            onChange={(e) => {
              if (e.target.value) onAdd(e.target.value)
              e.target.value = ''
            }}
            className="rounded-md border border-hairline bg-card px-2 py-1 text-xs text-ink"
          >
            <option value="">加入某一天</option>
            {days.map((d) => (
              <option key={d.id} value={d.id}>
                {d.date.slice(5)} {d.region}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )
}
