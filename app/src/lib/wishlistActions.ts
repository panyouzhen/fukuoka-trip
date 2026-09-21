import { randomUUID } from './uuid'
import { supabase } from './supabase'
import type { WishlistItem } from './types'

export function blankWishlistItem(): WishlistItem {
  return {
    id: randomUUID(),
    item: '',
    who: null,
    store: null,
    stop_id: null,
    price_jpy: null,
    note: null,
    image_url: null,
    bought: false,
    created_at: new Date().toISOString(),
  }
}

export async function upsertWishlistItem(item: WishlistItem) {
  const { id, created_at, ...rest } = item
  void created_at
  const { data, error } = await supabase.from('wishlist').upsert({ id, ...rest }).select().single()
  if (error) throw error
  return data as WishlistItem
}

export async function deleteWishlistItem(id: string) {
  const { error } = await supabase.from('wishlist').delete().eq('id', id)
  if (error) throw error
}
