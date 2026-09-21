import { useState } from 'react'
import { X } from 'lucide-react'
import { PEOPLE, type Flight, type Person } from '../lib/types'

const FIELD =
  'w-full rounded-md border border-hairline bg-card px-2.5 py-2 text-sm text-ink placeholder:text-muted/60 focus:outline-none focus:border-primary'
const LABEL = 'mb-1 block text-xs text-muted'

export function FlightEditSheet({
  flight,
  onSave,
  onDelete,
  onClose,
}: {
  flight: Flight
  onSave: (patch: Partial<Flight>) => void
  onDelete: () => void
  onClose: () => void
}) {
  const [form, setForm] = useState({
    who: flight.who,
    date: flight.date ?? '',
    airline: flight.airline ?? '',
    flight_no: flight.flight_no ?? '',
    dep_airport: flight.dep_airport ?? '',
    dep_time: flight.dep_time ?? '',
    arr_airport: flight.arr_airport ?? '',
    arr_time: flight.arr_time ?? '',
    note: flight.note ?? '',
  })

  function togglePerson(p: Person) {
    setForm((f) => ({ ...f, who: f.who.includes(p) ? f.who.filter((x) => x !== p) : [...f.who, p] }))
  }

  function submit() {
    onSave({
      who: form.who,
      date: form.date || null,
      airline: form.airline.trim() || null,
      flight_no: form.flight_no.trim() || null,
      dep_airport: form.dep_airport.trim() || null,
      dep_time: form.dep_time.trim() || null,
      arr_airport: form.arr_airport.trim() || null,
      arr_time: form.arr_time.trim() || null,
      note: form.note.trim() || null,
    })
  }

  return (
    <div className="fixed inset-0 z-30 flex items-end justify-center bg-ink/30 sm:items-center" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="max-h-[90dvh] w-full max-w-lg overflow-y-auto rounded-t-lg border border-hairline bg-card p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:rounded-lg"
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-serif text-lg font-semibold text-ink">
            {flight.direction === 'depart' ? '去程班機' : '回程班機'}
          </h2>
          <button type="button" onClick={onClose} className="text-muted">
            <X size={18} strokeWidth={1.5} />
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm text-muted">誰搭這班</label>
            <div className="flex gap-1.5">
              {PEOPLE.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => togglePerson(p)}
                  className={`flex h-8 w-8 items-center justify-center rounded-full border text-sm ${
                    form.who.includes(p) ? 'border-primary bg-primary text-card' : 'border-hairline text-muted'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className={LABEL}>日期</label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
              className={`${FIELD} tabular-nums`}
            />
          </div>

          <div className="flex gap-2">
            <div className="flex-1">
              <label className={LABEL}>航空公司</label>
              <input
                value={form.airline}
                onChange={(e) => setForm((f) => ({ ...f, airline: e.target.value }))}
                className={FIELD}
              />
            </div>
            <div className="flex-1">
              <label className={LABEL}>班機編號</label>
              <input
                value={form.flight_no}
                onChange={(e) => setForm((f) => ({ ...f, flight_no: e.target.value }))}
                placeholder="JX123"
                className={`${FIELD} tabular-nums`}
              />
            </div>
          </div>

          <div className="flex items-end gap-2">
            <div className="flex-1">
              <label className={LABEL}>出發機場</label>
              <input
                value={form.dep_airport}
                onChange={(e) => setForm((f) => ({ ...f, dep_airport: e.target.value }))}
                placeholder="TPE"
                className={FIELD}
              />
            </div>
            <div className="w-24">
              <label className={LABEL}>時間</label>
              <input
                value={form.dep_time}
                onChange={(e) => setForm((f) => ({ ...f, dep_time: e.target.value }))}
                placeholder="06:45"
                className={`${FIELD} tabular-nums`}
              />
            </div>
          </div>

          <div className="flex items-end gap-2">
            <div className="flex-1">
              <label className={LABEL}>抵達機場</label>
              <input
                value={form.arr_airport}
                onChange={(e) => setForm((f) => ({ ...f, arr_airport: e.target.value }))}
                placeholder="FUK"
                className={FIELD}
              />
            </div>
            <div className="w-24">
              <label className={LABEL}>時間</label>
              <input
                value={form.arr_time}
                onChange={(e) => setForm((f) => ({ ...f, arr_time: e.target.value }))}
                placeholder="10:00"
                className={`${FIELD} tabular-nums`}
              />
            </div>
          </div>

          <div>
            <label className={LABEL}>備註</label>
            <input
              value={form.note}
              onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
              className={FIELD}
            />
          </div>
        </div>

        <div className="mt-6 flex gap-2">
          <button
            type="button"
            onClick={onDelete}
            className="rounded-md border border-hairline px-4 py-3 text-sm text-muted"
          >
            刪除
          </button>
          <button type="button" onClick={submit} className="flex-1 rounded-md bg-primary py-3 text-sm font-medium text-card">
            儲存
          </button>
        </div>
      </div>
    </div>
  )
}
