import type { Flight } from '../lib/types'

export function FlightCard({ flight, onEdit }: { flight: Flight; onEdit: () => void }) {
  const hasInfo = flight.dep_time || flight.arr_time || flight.flight_no
  return (
    <button
      type="button"
      onClick={onEdit}
      className="w-full rounded-xl border border-slate-200 bg-white p-3 text-left transition hover:bg-slate-50"
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-500">
          {flight.direction === 'depart' ? '✈️ 去程' : '🛬 回程'}
          {flight.date && ` ・ ${flight.date.slice(5).replace('-', '/')}`}
        </span>
        {flight.who.length > 0 && <span className="text-xs text-slate-400">{flight.who.join('・')}</span>}
      </div>

      {hasInfo ? (
        <div className="mt-1 flex items-center gap-2 text-sm">
          <span className="font-semibold text-slate-800">{flight.dep_airport ?? '?'}</span>
          <span className="text-slate-400">{flight.dep_time ?? '--:--'}</span>
          <span className="text-slate-300">→</span>
          <span className="font-semibold text-slate-800">{flight.arr_airport ?? '?'}</span>
          <span className="text-slate-400">{flight.arr_time ?? '--:--'}</span>
        </div>
      ) : (
        <div className="mt-1 text-sm text-slate-300">點這裡補班機資訊</div>
      )}

      {(flight.airline || flight.flight_no) && (
        <div className="mt-0.5 text-xs text-slate-400">
          {flight.airline} {flight.flight_no}
        </div>
      )}
      {flight.note && <div className="mt-0.5 text-xs text-slate-400">{flight.note}</div>}
    </button>
  )
}
