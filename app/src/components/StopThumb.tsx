import { STOP_TYPE_ICON } from '../lib/stopVisual'
import type { Stop } from '../lib/types'

const SIZE_CLASS = {
  sm: 'h-10 w-10 rounded-md',
  md: 'h-14 w-14 rounded-lg',
  lg: 'aspect-video w-full rounded-lg',
} as const

const ICON_SIZE = {
  sm: 16,
  md: 20,
  lg: 32,
} as const

export function StopThumb({
  stop,
  size = 'md',
}: {
  stop: Pick<Stop, 'type' | 'image_url' | 'name'>
  size?: keyof typeof SIZE_CLASS
}) {
  const cls = `flex-shrink-0 flex items-center justify-center overflow-hidden ${SIZE_CLASS[size]}`

  if (stop.image_url) {
    return <img src={stop.image_url} alt={stop.name} className={`${cls} object-cover`} />
  }

  const Icon = STOP_TYPE_ICON[stop.type]
  return (
    <div className={`${cls} bg-thumb`}>
      <Icon size={ICON_SIZE[size]} strokeWidth={1.5} className="text-muted/70" />
    </div>
  )
}
