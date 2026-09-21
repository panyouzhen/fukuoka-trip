import { STOP_TYPE_ICON } from '../lib/stopVisual'
import { STOP_TYPE_LABEL, type StopType } from '../lib/types'

export function TypeTag({ type, className = '' }: { type: StopType; className?: string }) {
  const Icon = STOP_TYPE_ICON[type]
  return (
    <span className={`inline-flex items-center gap-1 text-xs text-muted ${className}`}>
      <Icon size={13} strokeWidth={1.75} />
      {STOP_TYPE_LABEL[type]}
    </span>
  )
}
