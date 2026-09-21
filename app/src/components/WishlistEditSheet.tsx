import { useMemo, useState } from 'react'
import { PEOPLE, type Person, type Stop, type WishlistItem } from '../lib/types'

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
    <div className="fixed inset-0 z-30 flex items-end justify-center bg-black/40 sm:items-center" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="max-h-[90dvh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-white p-5 sm:rounded-2xl"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-800">想買項目</h2>
          <button type="button" onClick={onClose} className="text-slate-400">
            ✕
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-xs text-slate-500">品項</label>
            <input
              value={form.item}
              onChange={(e) => setForm((f) => ({ ...f, item: e.target.value }))}
              placeholder="例如：Kapital 牛仔外套"
              className="w-full rounded-lg border border-slate-300 px-2 py-2 text-sm"
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="text-sm text-slate-600">誰想買</label>
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
            <label className="mb-1 block text-xs text-slate-500">店家（可打字連結景點，會自動比對名稱）</label>
            <input
              list="wishlist-stop-options"
              value={form.store}
              onChange={(e) => setForm((f) => ({ ...f, store: e.target.value, stop_id: null }))}
              placeholder="店名"
              className="w-full rounded-lg border border-slate-300 px-2 py-2 text-sm"
            />
            <datalist id="wishlist-stop-options">
              {stops.map((s) => (
                <option key={s.id} value={s.name} />
              ))}
            </datalist>
          </div>

          <div>
            <label className="mb-1 block text-xs text-slate-500">預估價格（日圓）</label>
            <input
              type="number"
              inputMode="numeric"
              value={form.price_jpy}
              onChange={(e) => setForm((f) => ({ ...f, price_jpy: e.target.value }))}
              placeholder="0"
              className="w-full rounded-lg border border-slate-300 px-2 py-2 text-sm"
            />
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
            <label className="mb-1 block text-xs text-slate-500">圖片網址（上傳／自動找圖之後補）</label>
            <input
              value={form.image_url}
              onChange={(e) => setForm((f) => ({ ...f, image_url: e.target.value }))}
              placeholder="https://..."
              className="w-full rounded-lg border border-slate-300 px-2 py-2 text-sm"
            />
          </div>

          <label className="flex items-center gap-2 text-sm text-slate-600">
            <input
              type="checkbox"
              checked={form.bought}
              onChange={(e) => setForm((f) => ({ ...f, bought: e.target.checked }))}
              className="h-4 w-4"
            />
            已購買
          </label>
        </div>

        <div className="mt-5 flex gap-2">
          {onDelete && (
            <button
              type="button"
              onClick={onDelete}
              className="rounded-xl bg-slate-100 px-4 py-3 text-sm font-medium text-slate-500"
            >
              刪除
            </button>
          )}
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
