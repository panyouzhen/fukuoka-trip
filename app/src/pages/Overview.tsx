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
    return <div className="py-20 text-center text-slate-400">載入中…</div>
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <MonthCalendar days={days} />

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-2 text-sm font-bold text-slate-700">✈️ 航班資訊</div>
          {flightsError ? (
            <p className="text-xs text-slate-400">
              航班資料表還沒建立，跑一下 <code className="rounded bg-slate-100 px-1">supabase/patch-2-flights.sql</code> 就會出現。
            </p>
          ) : (
            <div className="space-y-3">
              <div className="space-y-1.5">
                {departFlights.map((f) => (
                  <FlightCard key={f.id} flight={f} onEdit={() => setEditingFlight(f)} />
                ))}
                <button
                  type="button"
                  onClick={() => setEditingFlight(blankFlight('depart'))}
                  className="w-full rounded-xl border border-dashed border-slate-300 py-2 text-xs text-slate-400"
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
                  className="w-full rounded-xl border border-dashed border-slate-300 py-2 text-xs text-slate-400"
                >
                  ＋ 新增回程班機
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-slate-800">每日行程</h1>
        {swapping && <span className="text-xs text-slate-400">同步中…</span>}
      </div>

      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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

      <p className="pt-2 text-center text-xs text-slate-400">長按卡片右上角 ☰ 可拖曳交換兩天內容</p>

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
