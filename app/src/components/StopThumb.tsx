import { STOP_VISUAL } from '../lib/stopVisual'
import type { Stop } from '../lib/types'

const SIZE_CLASS = {
  sm: 'h-10 w-10 text-base rounded-lg',
  md: 'h-14 w-14 text-2xl rounded-xl',
  lg: 'aspect-video w-full text-4xl rounded-xl',
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

  const v = STOP_VISUAL[stop.type]
  return (
    <div className={`${cls} bg-gradient-to-br ${v.gradient} text-white`}>
      <span>{v.emoji}</span>
    </div>
  )
}
