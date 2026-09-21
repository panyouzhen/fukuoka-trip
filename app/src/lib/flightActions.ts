import { randomUUID } from './uuid'
import { supabase } from './supabase'
import type { Flight } from './types'

export function blankFlight(direction: Flight['direction']): Flight {
  return {
    id: randomUUID(),
    direction,
    who: [],
    date: null,
    airline: null,
    flight_no: null,
    dep_airport: null,
    dep_time: null,
    arr_airport: null,
    arr_time: null,
    note: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
}

export async function upsertFlight(flight: Flight) {
  const { id, created_at, updated_at, ...rest } = flight
  void created_at
  void updated_at
  const { data, error } = await supabase.from('flights').upsert({ id, ...rest }).select().single()
  if (error) throw error
  return data as Flight
}

export async function deleteFlight(id: string) {
  const { error } = await supabase.from('flights').delete().eq('id', id)
  if (error) throw error
}
