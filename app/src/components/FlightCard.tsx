import { PlaneTakeoff, PlaneLanding } from 'lucide-react'
import type { Flight } from '../lib/types'

export function FlightCard({ flight, onEdit }: { flight: Flight; onEdit: () => void }) {
  const hasInfo = flight.dep_time || flight.arr_time || flight.flight_no
  const Icon = flight.direction === 'depart' ? PlaneTakeoff : PlaneLanding

  return (
    <button
      type="button"
      onClick={onEdit}
      className="w-full rounded-md border border-hairline bg-card p-3 text-left transition hover:border-primary/40"
    >
      <div className="flex items-center justify-between">
        <span className="inline-flex items-center gap-1.5 text-xs text-muted">
          <Icon size={13} strokeWidth={1.5} />
          {flight.direction === 'depart' ? '去程' : '回程'}
          {flight.date && <span className="tabular-nums">・{flight.date.slice(5).replace('-', '/')}</span>}
        </span>
        {flight.who.length > 0 && <span className="text-xs text-muted">{flight.who.join('・')}</span>}
      </div>

      {hasInfo ? (
        <div className="mt-1.5 flex items-center gap-2 text-sm tabular-nums">
          <span className="font-medium text-ink">{flight.dep_airport ?? '?'}</span>
          <span className="text-muted">{flight.dep_time ?? '--:--'}</span>
          <span className="text-muted/50">→</span>
          <span className="font-medium text-ink">{flight.arr_airport ?? '?'}</span>
          <span className="text-muted">{flight.arr_time ?? '--:--'}</span>
        </div>
      ) : (
        <div className="mt-1.5 text-sm text-muted/70">點這裡補班機資訊</div>
      )}

      {(flight.airline || flight.flight_no) && (
        <div className="mt-1 text-xs text-muted">
          {flight.airline} {flight.flight_no}
        </div>
      )}
      {flight.note && <div className="mt-0.5 text-xs text-muted">{flight.note}</div>}
    </button>
  )
}
