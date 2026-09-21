import { useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { PostgrestError, RealtimeChannel } from '@supabase/supabase-js'

interface Options {
  orderBy?: { column: string; ascending?: boolean }
}

export function useRealtimeTable<T extends { id: string }>(table: string, options: Options = {}) {
  const [rows, setRows] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<PostgrestError | null>(null)
  const channelRef = useRef<RealtimeChannel | null>(null)

  const orderColumn = options.orderBy?.column
  const orderAscending = options.orderBy?.ascending ?? true

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      let query = supabase.from(table).select('*')
      if (orderColumn) query = query.order(orderColumn, { ascending: orderAscending })
      const { data, error } = await query
      if (cancelled) return
      if (error) setError(error)
      else setRows((data ?? []) as T[])
      setLoading(false)
    }
    load()

    const channel = supabase
      .channel(`realtime:${table}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table },
        (payload) => {
          setRows((prev) => {
            if (payload.eventType === 'INSERT') {
              const row = payload.new as T
              if (prev.some((r) => r.id === row.id)) return prev
              return [...prev, row]
            }
            if (payload.eventType === 'UPDATE') {
              const row = payload.new as T
              return prev.map((r) => (r.id === row.id ? row : r))
            }
            if (payload.eventType === 'DELETE') {
              const oldRow = payload.old as T
              return prev.filter((r) => r.id !== oldRow.id)
            }
            return prev
          })
        },
      )
      .subscribe()
    channelRef.current = channel

    return () => {
      cancelled = true
      supabase.removeChannel(channel)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [table, orderColumn, orderAscending])

  return { rows, setRows, loading, error }
}
