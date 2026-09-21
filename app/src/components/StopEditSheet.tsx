import { useState } from 'react'
import { X } from 'lucide-react'
import { PEOPLE, STOP_TYPE_LABEL, type Person, type Stop, type StopType } from '../lib/types'
import { STOP_TYPE_ICON } from '../lib/stopVisual'

const TYPES = Object.keys(STOP_TYPE_LABEL) as StopType[]

const FIELD =
  'w-full rounded-md border border-hairline bg-card px-2.5 py-2 text-sm text-ink placeholder:text-muted/60 focus:outline-none focus:border-primary'
const LABEL = 'mb-1 block text-xs text-muted'

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
    <div className="fixed inset-0 z-30 flex items-end justify-center bg-ink/30 sm:items-center" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="max-h-[90dvh] w-full max-w-lg overflow-y-auto rounded-t-lg border border-hairline bg-card p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:rounded-lg"
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-serif text-lg font-semibold text-ink">編輯行程</h2>
          <button type="button" onClick={onClose} className="text-muted">
            <X size={18} strokeWidth={1.5} />
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex gap-2">
            <div className="w-28">
              <label className={LABEL}>時間（可空白）</label>
              <input
                value={form.time}
                onChange={(e) => setForm((f) => ({ ...f, time: e.target.value }))}
                placeholder="10:00"
                className={`${FIELD} tabular-nums`}
              />
            </div>
            <div className="flex-1">
              <label className={LABEL}>名稱</label>
              <input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className={FIELD}
              />
            </div>
          </div>

          <div>
            <label className={LABEL}>類型</label>
            <div className="flex gap-1">
              {TYPES.map((t) => {
                const Icon = STOP_TYPE_ICON[t]
                const active = form.type === t
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, type: t }))}
                    className={`flex flex-1 flex-col items-center gap-1 rounded-md border py-2 text-xs ${
                      active ? 'border-primary text-primary' : 'border-hairline text-muted'
                    }`}
                  >
                    <Icon size={16} strokeWidth={1.5} />
                    {STOP_TYPE_LABEL[t]}
                  </button>
                )
              })}
            </div>
          </div>

          <div>
            <label className={LABEL}>備註</label>
            <textarea
              value={form.note}
              onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
              rows={2}
              className={FIELD}
            />
          </div>

          <div>
            <label className={LABEL}>營業時間</label>
            <input
              value={form.hours}
              onChange={(e) => setForm((f) => ({ ...f, hours: e.target.value }))}
              placeholder="10:00~20:00"
              className={`${FIELD} tabular-nums`}
            />
          </div>

          <div>
            <label className={LABEL}>Google Maps 連結</label>
            <input
              value={form.map_url}
              onChange={(e) => setForm((f) => ({ ...f, map_url: e.target.value }))}
              placeholder="https://maps.app.goo.gl/..."
              className={FIELD}
            />
          </div>

          <div>
            <label className={LABEL}>圖片網址（上傳／自動找圖之後補）</label>
            <input
              value={form.image_url}
              onChange={(e) => setForm((f) => ({ ...f, image_url: e.target.value }))}
              placeholder="https://..."
              className={FIELD}
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="text-sm text-muted">誰想去</label>
            <div className="flex gap-1.5">
              {PEOPLE.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => togglePerson(p)}
                  className={`flex h-8 w-8 items-center justify-center rounded-full border text-sm ${
                    form.who_wants.includes(p)
                      ? 'border-primary bg-primary text-card'
                      : 'border-hairline text-muted'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm text-ink">
            <input
              type="checkbox"
              checked={form.needs_booking}
              onChange={(e) => setForm((f) => ({ ...f, needs_booking: e.target.checked }))}
              className="h-4 w-4 accent-warn"
            />
            需訂位
          </label>
        </div>

        <button
          type="button"
          onClick={submit}
          className="mt-6 w-full rounded-md bg-primary py-3 text-sm font-medium text-card"
        >
          儲存
        </button>
      </div>
    </div>
  )
}
