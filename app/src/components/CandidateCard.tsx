import { STOP_TYPE_LABEL } from '../lib/types'
import type { Day, Stop } from '../lib/types'
import { StopThumb } from './StopThumb'

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
    <div className="flex gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
      <StopThumb stop={stop} size="md" />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="rounded-md bg-sky-100 px-1.5 py-0.5 text-xs font-medium text-sky-700">
            {STOP_TYPE_LABEL[stop.type]}
          </span>
          {stop.region && <span className="text-xs text-slate-400">{stop.region}</span>}
        </div>

        <div className="mt-1 truncate font-semibold text-slate-800">{stop.name}</div>
        {stop.note && <div className="mt-0.5 line-clamp-2 text-sm text-slate-500">{stop.note}</div>}

        {stop.who_wants.length > 0 && (
          <div className="mt-1 flex gap-1">
            {stop.who_wants.map((p) => (
              <span key={p} className="rounded-md bg-amber-100 px-1.5 py-0.5 text-xs font-medium text-amber-700">
                {p}
              </span>
            ))}
          </div>
        )}

        {scheduledIn.length > 0 && (
          <div className="mt-1.5 text-xs font-medium text-emerald-600">
            ✅ 已排入 {scheduledIn.map((d) => d.date.slice(5)).join('、')}
          </div>
        )}

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
          <select
            value=""
            onChange={(e) => {
              if (e.target.value) onAdd(e.target.value)
              e.target.value = ''
            }}
            className="rounded-lg bg-slate-900 px-2 py-1 text-xs font-medium text-white"
          >
            <option value="">＋ 加入某一天</option>
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
