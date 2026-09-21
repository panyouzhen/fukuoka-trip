import { Check, MapPin, ShoppingBag } from 'lucide-react'
import type { Stop, WishlistItem } from '../lib/types'

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
    <div className={`flex gap-3 rounded-lg border border-hairline bg-card p-3 ${item.bought ? 'opacity-50' : ''}`}>
      <button
        type="button"
        onClick={onToggleBought}
        aria-label="切換已購買"
        className={`mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border ${
          item.bought ? 'border-primary bg-primary text-card' : 'border-hairline text-transparent'
        }`}
      >
        <Check size={13} strokeWidth={2} />
      </button>

      {item.image_url ? (
        <img src={item.image_url} alt={item.item} className="h-14 w-14 flex-shrink-0 rounded-lg object-cover" />
      ) : (
        <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-lg bg-thumb">
          <ShoppingBag size={20} strokeWidth={1.5} className="text-muted/70" />
        </div>
      )}

      <button type="button" onClick={onEdit} className="min-w-0 flex-1 text-left">
        <div className={`truncate font-medium text-ink ${item.bought ? 'line-through' : ''}`}>{item.item}</div>
        <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted">
          {item.who && <span>{item.who}</span>}
          {item.store && <span>{item.store}</span>}
        </div>
        {item.note && <div className="mt-0.5 line-clamp-2 text-sm text-muted">{item.note}</div>}
        {linkedStop?.map_url && (
          <a
            href={linkedStop.map_url.split('\n')[0]}
            target="_blank"
            rel="noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="mt-1 inline-flex items-center gap-1 text-xs text-primary"
          >
            <MapPin size={12} strokeWidth={1.75} />
            地圖
          </a>
        )}
      </button>

      <div className="flex-shrink-0 self-center text-right text-sm tabular-nums text-ink">
        {item.price_jpy != null ? `¥${item.price_jpy.toLocaleString()}` : ''}
      </div>
    </div>
  )
}
