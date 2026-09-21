import { useState } from 'react'
import { ChevronLeft, Pencil, ArrowUp, ArrowDown, Copy, ArrowRightLeft, Trash2, MapPin } from 'lucide-react'
import type { Day } from '../lib/types'

interface Props {
  days: Day[]
  currentDayId: string | null
  isFirst: boolean
  isLast: boolean
  onEdit: () => void
  onDelete: () => void
  onMove: (targetDayId: string) => void
  onCopy: (targetDayId: string) => void
  onReorder: (direction: 'up' | 'down') => void
  onClose: () => void
}

type View = 'menu' | 'move' | 'copy'

function MenuRow({
  icon: Icon,
  label,
  onClick,
  disabled,
  danger,
}: {
  icon: typeof Pencil
  label: string
  onClick: () => void
  disabled?: boolean
  danger?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`flex w-full items-center gap-3 border-b border-hairline px-1 py-3.5 text-left text-[15px] last:border-b-0 disabled:opacity-30 ${
        danger ? 'text-warn' : 'text-ink'
      }`}
    >
      <Icon size={18} strokeWidth={1.5} />
      {label}
    </button>
  )
}

export function StopActionSheet({
  days,
  currentDayId,
  isFirst,
  isLast,
  onEdit,
  onDelete,
  onMove,
  onCopy,
  onReorder,
  onClose,
}: Props) {
  const [view, setView] = useState<View>('menu')
  const otherDays = days.filter((d) => d.id !== currentDayId)

  return (
    <div className="fixed inset-0 z-30 flex items-end justify-center bg-ink/30 sm:items-center" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="max-h-[80dvh] w-full max-w-sm overflow-y-auto rounded-t-lg border border-hairline bg-card p-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:rounded-lg"
      >
        {view === 'menu' && (
          <>
            <MenuRow icon={Pencil} label="編輯" onClick={onEdit} />
            <MenuRow icon={ArrowUp} label="上移" onClick={() => onReorder('up')} disabled={isFirst} />
            <MenuRow icon={ArrowDown} label="下移" onClick={() => onReorder('down')} disabled={isLast} />
            {otherDays.length > 0 && (
              <>
                <MenuRow icon={ArrowRightLeft} label="搬到別天" onClick={() => setView('move')} />
                <MenuRow icon={Copy} label="複製到別天" onClick={() => setView('copy')} />
              </>
            )}
            <MenuRow icon={Trash2} label="刪除" onClick={onDelete} danger />
          </>
        )}

        {(view === 'move' || view === 'copy') && (
          <>
            <button
              type="button"
              onClick={() => setView('menu')}
              className="mb-1 flex items-center gap-1 py-2 text-sm text-muted"
            >
              <ChevronLeft size={16} strokeWidth={1.75} />
              返回
            </button>
            {otherDays.map((d) => (
              <button
                key={d.id}
                type="button"
                onClick={() => (view === 'move' ? onMove(d.id) : onCopy(d.id))}
                className="flex w-full items-center gap-3 border-b border-hairline px-1 py-3.5 text-left text-[15px] text-ink last:border-b-0"
              >
                <MapPin size={18} strokeWidth={1.5} className="text-muted" />
                <span className="tabular-nums text-muted">{d.date.slice(5)}</span>
                {d.region}
              </button>
            ))}
          </>
        )}
      </div>
    </div>
  )
}
