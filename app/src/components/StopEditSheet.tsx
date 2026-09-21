import { useState } from 'react'
import { PEOPLE, STOP_TYPE_LABEL, type Person, type Stop, type StopType } from '../lib/types'

const TYPES = Object.keys(STOP_TYPE_LABEL) as StopType[]

export function StopEditSheet({
  stop,
  onSave,
  onClose,
}: {
  stop: Stop
  onSave: (patch: Partial<Stop>) => void
  onClose: () => void
}) {
  const [form, setForm] = useState({
    time: stop.time ?? '',
    name: stop.name,
    type: stop.type,
    note: stop.note ?? '',
    hours: stop.hours ?? '',
    map_url: stop.map_url ?? '',
    image_url: stop.image_url ?? '',
    needs_booking: stop.needs_booking,
    who_wants: stop.who_wants,
  })

  function togglePerson(p: Person) {
    setForm((f) => ({
      ...f,
      who_wants: f.who_wants.includes(p) ? f.who_wants.filter((x) => x !== p) : [...f.who_wants, p],
    }))
  }

  function submit() {
    if (!form.name.trim()) return
    onSave({
      time: form.time.trim() || null,
      name: form.name.trim(),
      type: form.type,
      note: form.note.trim() || null,
      hours: form.hours.trim() || null,
      map_url: form.map_url.trim() || null,
      image_url: form.image_url.trim() || null,
      needs_booking: form.needs_booking,
      who_wants: form.who_wants,
    })
  }

  return (
    <div className="fixed inset-0 z-30 flex items-end justify-center bg-black/40 sm:items-center" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="max-h-[90dvh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-white p-5 sm:rounded-2xl"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-800">編輯行程</h2>
          <button type="button" onClick={onClose} className="text-slate-400">
            ✕
          </button>
        </div>

        <div className="space-y-3">
          <div className="flex gap-2">
            <div className="w-28">
              <label className="mb-1 block text-xs text-slate-500">時間（可空白）</label>
              <input
                value={form.time}
                onChange={(e) => setForm((f) => ({ ...f, time: e.target.value }))}
                placeholder="10:00"
                className="w-full rounded-lg border border-slate-300 px-2 py-2 text-sm"
              />
            </div>
            <div className="flex-1">
              <label className="mb-1 block text-xs text-slate-500">名稱</label>
              <input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="w-full rounded-lg border border-slate-300 px-2 py-2 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs text-slate-500">類型</label>
            <div className="flex gap-1.5">
              {TYPES.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, type: t }))}
                  className={`flex-1 rounded-lg py-1.5 text-sm font-medium ${
                    form.type === t ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {STOP_TYPE_LABEL[t]}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs text-slate-500">備註</label>
            <textarea
              value={form.note}
              onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
              rows={2}
              className="w-full rounded-lg border border-slate-300 px-2 py-2 text-sm"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs text-slate-500">營業時間</label>
            <input
              value={form.hours}
              onChange={(e) => setForm((f) => ({ ...f, hours: e.target.value }))}
              placeholder="10:00~20:00"
              className="w-full rounded-lg border border-slate-300 px-2 py-2 text-sm"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs text-slate-500">Google Maps 連結</label>
            <input
              value={form.map_url}
              onChange={(e) => setForm((f) => ({ ...f, map_url: e.target.value }))}
              placeholder="https://maps.app.goo.gl/..."
              className="w-full rounded-lg border border-slate-300 px-2 py-2 text-sm"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs text-slate-500">圖片網址（上傳／自動找圖之後補）</label>
            <input
              value={form.image_url}
              onChange={(e) => setForm((f) => ({ ...f, image_url: e.target.value }))}
              placeholder="https://..."
              className="w-full rounded-lg border border-slate-300 px-2 py-2 text-sm"
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="text-sm text-slate-600">誰想去</label>
            <div className="flex gap-1.5">
              {PEOPLE.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => togglePerson(p)}
                  className={`rounded-lg px-3 py-1 text-sm font-medium ${
                    form.who_wants.includes(p) ? 'bg-sky-500 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm text-slate-600">
            <input
              type="checkbox"
              checked={form.needs_booking}
              onChange={(e) => setForm((f) => ({ ...f, needs_booking: e.target.checked }))}
              className="h-4 w-4"
            />
            需訂位
          </label>
        </div>

        <button
          type="button"
          onClick={submit}
          className="mt-5 w-full rounded-xl bg-slate-900 py-3 font-medium text-white active:scale-[0.98]"
        >
          儲存
        </button>
      </div>
    </div>
  )
}
