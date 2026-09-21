import { useState } from 'react'
import { PEOPLE, type Flight, type Person } from '../lib/types'

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
    <div className="fixed inset-0 z-30 flex items-end justify-center bg-black/40 sm:items-center" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="max-h-[90dvh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-white p-5 sm:rounded-2xl"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-800">
            {flight.direction === 'depart' ? '去程班機' : '回程班機'}
          </h2>
          <button type="button" onClick={onClose} className="text-slate-400">
            ✕
          </button>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm text-slate-600">誰搭這班</label>
            <div className="flex gap-1.5">
              {PEOPLE.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => togglePerson(p)}
                  className={`rounded-lg px-3 py-1 text-sm font-medium ${
                    form.who.includes(p) ? 'bg-sky-500 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs text-slate-500">日期</label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
              className="w-full rounded-lg border border-slate-300 px-2 py-2 text-sm"
            />
          </div>

          <div className="flex gap-2">
            <div className="flex-1">
              <label className="mb-1 block text-xs text-slate-500">航空公司</label>
              <input
                value={form.airline}
                onChange={(e) => setForm((f) => ({ ...f, airline: e.target.value }))}
                className="w-full rounded-lg border border-slate-300 px-2 py-2 text-sm"
              />
            </div>
            <div className="flex-1">
              <label className="mb-1 block text-xs text-slate-500">班機編號</label>
              <input
                value={form.flight_no}
                onChange={(e) => setForm((f) => ({ ...f, flight_no: e.target.value }))}
                placeholder="JX123"
                className="w-full rounded-lg border border-slate-300 px-2 py-2 text-sm"
              />
            </div>
          </div>

          <div className="flex items-end gap-2">
            <div className="flex-1">
              <label className="mb-1 block text-xs text-slate-500">出發機場</label>
              <input
                value={form.dep_airport}
                onChange={(e) => setForm((f) => ({ ...f, dep_airport: e.target.value }))}
                placeholder="TPE"
                className="w-full rounded-lg border border-slate-300 px-2 py-2 text-sm"
              />
            </div>
            <div className="w-24">
              <label className="mb-1 block text-xs text-slate-500">時間</label>
              <input
                value={form.dep_time}
                onChange={(e) => setForm((f) => ({ ...f, dep_time: e.target.value }))}
                placeholder="06:45"
                className="w-full rounded-lg border border-slate-300 px-2 py-2 text-sm"
              />
            </div>
          </div>

          <div className="flex items-end gap-2">
            <div className="flex-1">
              <label className="mb-1 block text-xs text-slate-500">抵達機場</label>
              <input
                value={form.arr_airport}
                onChange={(e) => setForm((f) => ({ ...f, arr_airport: e.target.value }))}
                placeholder="FUK"
                className="w-full rounded-lg border border-slate-300 px-2 py-2 text-sm"
              />
            </div>
            <div className="w-24">
              <label className="mb-1 block text-xs text-slate-500">時間</label>
              <input
                value={form.arr_time}
                onChange={(e) => setForm((f) => ({ ...f, arr_time: e.target.value }))}
                placeholder="10:00"
                className="w-full rounded-lg border border-slate-300 px-2 py-2 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs text-slate-500">備註</label>
            <input
              value={form.note}
              onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
              className="w-full rounded-lg border border-slate-300 px-2 py-2 text-sm"
            />
          </div>
        </div>

        <div className="mt-5 flex gap-2">
          <button
            type="button"
            onClick={onDelete}
            className="rounded-xl bg-slate-100 px-4 py-3 text-sm font-medium text-slate-500"
          >
            刪除
          </button>
          <button
            type="button"
            onClick={submit}
            className="flex-1 rounded-xl bg-slate-900 py-3 font-medium text-white active:scale-[0.98]"
          >
            儲存
          </button>
        </div>
      </div>
    </div>
  )
}
