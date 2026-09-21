import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { DndContext, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core'
import { useRealtimeTable } from '../hooks/useRealtimeTable'
import type { Day, Flight, Stop } from '../lib/types'
import { swapDays } from '../lib/dayActions'
import { blankFlight, upsertFlight, deleteFlight } from '../lib/flightActions'
import { DayCard } from '../components/DayCard'
import { MonthCalendar } from '../components/MonthCalendar'
import { FlightCard } from '../components/FlightCard'
import { FlightEditSheet } from '../components/FlightEditSheet'

export function Overview() {
  const navigate = useNavigate()
  const { rows: days, setRows: setDays, loading: loadingDays } = useRealtimeTable<Day>('days', {
    orderBy: { column: 'date' },
  })
  const { rows: stops, setRows: setStops, loading: loadingStops } = useRealtimeTable<Stop>('stops', {
    orderBy: { column: 'order_index' },
  })

  const { rows: flights, setRows: setFlights, error: flightsError } = useRealtimeTable<Flight>('flights')
  const [editingFlight, setEditingFlight] = useState<Flight | null>(null)

  const [swapping, setSwapping] = useState(false)

  const stopsByDay = useMemo(() => {
    const map = new Map<string, Stop[]>()
    for (const s of stops) {
      if (!s.day_id) continue
      const arr = map.get(s.day_id) ?? []
      arr.push(s)
      map.set(s.day_id, arr)
    }
    for (const arr of map.values()) arr.sort((a, b) => a.order_index - b.order_index)
    return map
  }, [stops])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { delay: 200, tolerance: 8 } }),
  )

  async function handleDragEnd(e: DragEndEvent) {
    const { active, over } = e
    if (!over || active.id === over.id) return
    const dayA = days.find((d) => d.id === active.id)
    const dayB = days.find((d) => d.id === over.id)
    if (!dayA || !dayB) return

    setDays((prev) =>
      prev.map((d) => {
        if (d.id === dayA.id) return { ...d, title: dayB.title, region: dayB.region, note: dayB.note }
        if (d.id === dayB.id) return { ...d, title: dayA.title, region: dayA.region, note: dayA.note }
        return d
      }),
    )
    setStops((prev) =>
      prev.map((s) => {
        if (s.day_id === dayA.id) return { ...s, day_id: dayB.id }
        if (s.day_id === dayB.id) return { ...s, day_id: dayA.id }
        return s
      }),
    )

    setSwapping(true)
    try {
      await swapDays(dayA, dayB)
    } catch (err) {
      console.error(err)
      alert('交換失敗，請檢查網路後重試')
    } finally {
      setSwapping(false)
    }
  }

  async function handleSaveFlight(patch: Partial<Flight>) {
    if (!editingFlight) return
    const merged: Flight = { ...editingFlight, ...patch }
    setFlights((prev) =>
      prev.some((f) => f.id === merged.id) ? prev.map((f) => (f.id === merged.id ? merged : f)) : [...prev, merged],
    )
    setEditingFlight(null)
    try {
      await upsertFlight(merged)
    } catch (err) {
      console.error(err)
      alert('航班儲存失敗，請檢查網路後重試')
    }
  }

  async function handleDeleteFlight() {
    if (!editingFlight) return
    const id = editingFlight.id
    setFlights((prev) => prev.filter((f) => f.id !== id))
    setEditingFlight(null)
    try {
      await deleteFlight(id)
    } catch (err) {
      console.error(err)
    }
  }

  const departFlights = flights.filter((f) => f.direction === 'depart')
  const returnFlights = flights.filter((f) => f.direction === 'return')

  if (loadingDays || loadingStops) {
    return <div className="py-20 text-center text-sm text-muted">載入中…</div>
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <MonthCalendar days={days} />

        <div className="rounded-lg border border-hairline bg-card p-5">
          <div className="mb-3 font-serif text-base text-ink">航班資訊</div>
          {flightsError ? (
            <p className="text-xs leading-relaxed text-muted">
              航班資料表還沒建立，跑一下 <code className="rounded bg-thumb px-1">supabase/patch-2-flights.sql</code> 就會出現。
            </p>
          ) : (
            <div className="space-y-4">
              <div className="space-y-1.5">
                {departFlights.map((f) => (
                  <FlightCard key={f.id} flight={f} onEdit={() => setEditingFlight(f)} />
                ))}
                <button
                  type="button"
                  onClick={() => setEditingFlight(blankFlight('depart'))}
                  className="w-full rounded-md border border-dashed border-hairline py-2 text-xs text-muted"
                >
                  ＋ 新增去程班機
                </button>
              </div>
              <div className="space-y-1.5">
                {returnFlights.map((f) => (
                  <FlightCard key={f.id} flight={f} onEdit={() => setEditingFlight(f)} />
                ))}
                <button
                  type="button"
                  onClick={() => setEditingFlight(blankFlight('return'))}
                  className="w-full rounded-md border border-dashed border-hairline py-2 text-xs text-muted"
                >
                  ＋ 新增回程班機
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between">
          <h1 className="font-serif text-lg text-ink">每日行程</h1>
          {swapping && <span className="text-xs text-muted">同步中…</span>}
        </div>

        <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {days.map((day) => (
              <DayCard
                key={day.id}
                day={day}
                stops={stopsByDay.get(day.id) ?? []}
                onOpen={() => navigate(`/day/${day.id}`)}
              />
            ))}
          </div>
        </DndContext>

        <p className="mt-4 text-center text-xs text-muted">拖曳卡片右上角把手，可交換兩天內容</p>
      </div>

      {editingFlight && (
        <FlightEditSheet
          flight={editingFlight}
          onSave={handleSaveFlight}
          onDelete={handleDeleteFlight}
          onClose={() => setEditingFlight(null)}
        />
      )}
    </div>
  )
}
