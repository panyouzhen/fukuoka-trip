import type { Stop, WishlistItem } from '../lib/types'

const PLACEHOLDER_GRADIENT = 'from-fuchsia-300 to-purple-400'

export function WishlistRow({
  item,
  linkedStop,
  onToggleBought,
  onEdit,
}: {
  item: WishlistItem
  linkedStop: Stop | undefined
  onToggleBought: () => void
  onEdit: () => void
}) {
  return (
    <div className={`flex gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm ${item.bought ? 'opacity-60' : ''}`}>
      <button
        type="button"
        onClick={onToggleBought}
        aria-label="切換已購買"
        className={`mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold ${
          item.bought ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-slate-300 text-transparent'
        }`}
      >
        ✓
      </button>

      {item.image_url ? (
        <img src={item.image_url} alt={item.item} className="h-14 w-14 flex-shrink-0 rounded-xl object-cover" />
      ) : (
        <div
          className={`flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-2xl text-white ${PLACEHOLDER_GRADIENT}`}
        >
          🛍️
        </div>
      )}

      <button type="button" onClick={onEdit} className="min-w-0 flex-1 text-left">
        <div className={`truncate font-semibold text-slate-800 ${item.bought ? 'line-through' : ''}`}>
          {item.item}
        </div>
        <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs text-slate-400">
          {item.who && <span className="rounded-md bg-amber-100 px-1.5 py-0.5 font-medium text-amber-700">{item.who}</span>}
          {item.store && <span>{item.store}</span>}
        </div>
        {item.note && <div className="mt-0.5 line-clamp-2 text-sm text-slate-500">{item.note}</div>}
        {linkedStop?.map_url && (
          <a
            href={linkedStop.map_url.split('\n')[0]}
            target="_blank"
            rel="noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="mt-1 inline-block rounded-lg bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700"
          >
            🗺️ 地圖
          </a>
        )}
      </button>

      <div className="flex-shrink-0 self-center text-right text-sm font-semibold text-slate-700">
        {item.price_jpy != null ? `¥${item.price_jpy.toLocaleString()}` : ''}
      </div>
    </div>
  )
}
