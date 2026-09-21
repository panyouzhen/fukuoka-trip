import { randomUUID } from './uuid'
import { supabase } from './supabase'
import type { Stop } from './types'

export async function quickAddStop(dayId: string, name: string, nextOrderIndex: number) {
  const row: Partial<Stop> = {
    id: randomUUID(),
    day_id: dayId,
    order_index: nextOrderIndex,
    time: null,
    name,
    type: 'other',
    note: null,
    hours: null,
    address: null,
    region: null,
    map_url: null,
    needs_booking: false,
    image_url: null,
    who_wants: [],
  }
  const { data, error } = await supabase.from('stops').insert(row).select().single()
  if (error) throw error
  return data as Stop
}

export async function updateStop(id: string, patch: Partial<Stop>) {
  const { error } = await supabase.from('stops').update(patch).eq('id', id)
  if (error) throw error
}

export async function deleteStop(id: string) {
  const { error } = await supabase.from('stops').delete().eq('id', id)
  if (error) throw error
}

export async function moveStopToDay(stop: Stop, targetDayId: string, nextOrderIndex: number) {
  await updateStop(stop.id, { day_id: targetDayId, order_index: nextOrderIndex })
}

export async function copyStopToDay(stop: Stop, targetDayId: string, nextOrderIndex: number) {
  const row: Partial<Stop> = {
    ...stop,
    id: randomUUID(),
    day_id: targetDayId,
    order_index: nextOrderIndex,
  }
  const { data, error } = await supabase.from('stops').insert(row).select().single()
  if (error) throw error
  return data as Stop
}

export async function persistOrder(stops: Stop[]) {
  await Promise.all(
    stops.map((s, i) =>
      s.order_index === i ? Promise.resolve() : supabase.from('stops').update({ order_index: i }).eq('id', s.id),
    ),
  )
}
