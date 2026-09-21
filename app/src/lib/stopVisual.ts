import type { StopType } from './types'

export const STOP_VISUAL: Record<StopType, { gradient: string; emoji: string }> = {
  eat: { gradient: 'from-orange-300 to-rose-400', emoji: '🍜' },
  see: { gradient: 'from-sky-300 to-indigo-400', emoji: '🏯' },
  buy: { gradient: 'from-fuchsia-300 to-purple-400', emoji: '🛍️' },
  transport: { gradient: 'from-slate-300 to-slate-500', emoji: '🚃' },
  other: { gradient: 'from-emerald-300 to-teal-400', emoji: '📍' },
}
