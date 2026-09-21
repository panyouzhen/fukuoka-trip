import { useMemo, useState } from 'react'
import { X } from 'lucide-react'
import { PEOPLE, type Person, type Stop, type WishlistItem } from '../lib/types'

const FIELD =
  'w-full rounded-md border border-hairline bg-card px-2.5 py-2 text-sm text-ink placeholder:text-muted/60 focus:outline-none focus:border-primary'
const LABEL = 'mb-1 block text-xs text-muted'

export function WishlistEditSheet({
  item,
  stops,
  onSave,
  onDelete,
  onClose,
}: {
  item: WishlistItem
  stops: Stop[]
  onSave: (patch: Partial<WishlistItem>) => void
  onDelete?: () => void
  onClose: () => void
}) {
  const [form, setForm] = useState({
    item: item.item,
    who: (item.who ? item.who.split(/[、,，\s]+/).filter(Boolean) : []) as Person[],
    store: item.store ?? '',
    stop_id: item.stop_id,
    price_jpy: item.price_jpy?.toString() ?? '',
    note: item.note ?? '',
    image_url: item.image_url ?? '',
    bought: item.bought,
  })

  const stopByName = useMemo(() => new Map(stops.map((s) => [s.name, s])), [stops])

  function togglePerson(p: Person) {
    setForm((f) => ({ ...f, who: f.who.includes(p) ? f.who.filter((x) => x !== p) : [...f.who, p] }))
  }

  function submit() {
    if (!form.item.trim()) return
    const matchedStop = stopByName.get(form.store.trim())
    onSave({
      item: form.item.trim(),
      who: form.who.length ? form.who.join('、') : null,
      store: form.store.trim() || null,
      stop_id: matchedStop ? matchedStop.id : form.store.trim() ? form.stop_id : null,
      price_jpy: form.price_jpy.trim() ? Math.round(Number(form.price_jpy)) : null,
      note: form.note.trim() || null,
      image_url: form.image_url.trim() || null,
      bought: form.bought,
    })
  }

  return (
    <div className="fixed inset-0 z-30 flex items-end justify-center bg-ink/30 sm:items-center" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="max-h-[90dvh] w-full max-w-lg overflow-y-auto rounded-t-lg border border-hairline bg-card p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:rounded-lg"
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-serif text-lg font-semibold text-ink">想買項目</h2>
          <button type="button" onClick={onClose} className="text-muted">
            <X size={18} strokeWidth={1.5} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className={LABEL}>品項</label>
            <input
              value={form.item}
              onChange={(e) => setForm((f) => ({ ...f, item: e.target.value }))}
              placeholder="例如：Kapital 牛仔外套"
              className={FIELD}
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="text-sm text-muted">誰想買</label>
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
            <label className={LABEL}>店家（可打字連結景點，會自動比對名稱）</label>
            <input
              list="wishlist-stop-options"
              value={form.store}
              onChange={(e) => setForm((f) => ({ ...f, store: e.target.value, stop_id: null }))}
              placeholder="店名"
              className={FIELD}
            />
            <datalist id="wishlist-stop-options">
              {stops.map((s) => (
                <option key={s.id} value={s.name} />
              ))}
            </datalist>
          </div>

          <div>
            <label className={LABEL}>預估價格（日圓）</label>
            <input
              type="number"
              inputMode="numeric"
              value={form.price_jpy}
              onChange={(e) => setForm((f) => ({ ...f, price_jpy: e.target.value }))}
              placeholder="0"
              className={`${FIELD} tabular-nums`}
            />
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
            <label className={LABEL}>圖片網址（上傳／自動找圖之後補）</label>
            <input
              value={form.image_url}
              onChange={(e) => setForm((f) => ({ ...f, image_url: e.target.value }))}
              placeholder="https://..."
              className={FIELD}
            />
          </div>

          <label className="flex items-center gap-2 text-sm text-ink">
            <input
              type="checkbox"
              checked={form.bought}
              onChange={(e) => setForm((f) => ({ ...f, bought: e.target.checked }))}
              className="h-4 w-4 accent-primary"
            />
            已購買
          </label>
        </div>

        <div className="mt-6 flex gap-2">
          {onDelete && (
            <button
              type="button"
              onClick={onDelete}
              className="rounded-md border border-hairline px-4 py-3 text-sm text-muted"
            >
              刪除
            </button>
          )}
          <button type="button" onClick={submit} className="flex-1 rounded-md bg-primary py-3 text-sm font-medium text-card">
            儲存
          </button>
        </div>
      </div>
    </div>
  )
}
