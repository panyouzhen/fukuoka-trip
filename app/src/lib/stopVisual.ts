import { UtensilsCrossed, Landmark, ShoppingBag, TrainFront, MapPin, type LucideIcon } from 'lucide-react'
import type { StopType } from './types'

export const STOP_TYPE_ICON: Record<StopType, LucideIcon> = {
  eat: UtensilsCrossed,
  see: Landmark,
  buy: ShoppingBag,
  transport: TrainFront,
  other: MapPin,
}
