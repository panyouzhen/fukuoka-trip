import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable'
import { useRealtimeTable } from '../hooks/useRealtimeTable'
import type { Day, Stop } from '../lib/types'
import { quickAddStop, updateStop, deleteStop, moveStopToDay, copyStopToDay, persistOrder } from '../lib/stopActions'
import { DayTabs } from '../components/DayTabs'
import { StopCard } from '../components/StopCard'
import { StopEditSheet } from '../components/StopEditSheet'

export function DayDetail() {
  const { dayId } = useParams<{ dayId: string }>()
  const navigate = useNavigate()

  const { rows: days, loading: loadingDays } = useRealtimeTable<Day>('days', { orderBy: { column: 'date' } })
  const { rows: stops, setRows: setStops, loading: loadingStops } = useRealtimeTable<Stop>('stops', {
    orderBy: { column: 'order_index' },
  })

  const [editingStop, setEditingStop] = useState<Stop | null>(null)
  const [quickText, setQuickText] = useState('')
  const touchStartX = useRef<number | null>(null)

  useEffect(() => {
    if (!dayId && days.length > 0) {
      navigate(`/day/${days[0].id}`, { replace: true })
    }
  }, [dayId, days, navigate])

  const dayStops = useMemo(
    () =>
      stops
        .filter((s) => s.day_id === dayId)
        .sort((a, b) => a.order_index - b.order_index),
    [stops, dayId],
  )

  const currentIndex = days.findIndex((d) => d.id === dayId)

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { delay: 200, tolerance: 8 } }))

  async function handleDragEnd(e: DragEndEvent) {
    const { active, over } = e
    if (!over || active.id === over.id) return
    const oldIndex = dayStops.findIndex((s) => s.id === active.id)
    const newIndex = dayStops.findIndex((s) => s.id === over.id)
    if (oldIndex === -1 || newIndex === -1) return
    const reordered = arrayMove(dayStops, oldIndex, newIndex).map((s, i) => ({ ...s, order_index: i }))

    setStops((prev) => {
      const others = prev.filter((s) => s.day_id !== dayId)
      return [...others, ...reordered]
    })
    try {
      await persistOrder(reordered)
    } catch (err) {
      console.error(err)
    }
  }

  function reorderStep(stop: Stop, direction: 'up' | 'down') {
    const idx = dayStops.findIndex((s) => s.id === stop.id)
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1
    if (swapIdx < 0 || swapIdx >= dayStops.length) return
    const reordered = [...dayStops]
    ;[reordered[idx], reordered[swapIdx]] = [reordered[swapIdx], reordered[idx]]
    const withOrder = reordered.map((s, i) => ({ ...s, order_index: i }))
    setStops((prev) => {
      const others = prev.filter((s) => s.day_id !== dayId)
      return [...others, ...withOrder]
    })
    persistOrder(withOrder).catch(console.error)
  }

  async function handleQuickAdd() {
    const name = quickText.trim()
    if (!name || !dayId) return
    setQuickText('')
    try {
      const nextIndex = dayStops.length
      const created = await quickAddStop(dayId, name, nextIndex)
      setStops((prev) => [...prev, created])
    } catch (err) {
      console.error(err)
      alert('新增失敗，請檢查網路後重試')
    }
  }

  async function handleSaveEdit(patch: Partial<Stop>) {
    if (!editingStop) return
    const id = editingStop.id
    setStops((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)))
    setEditingStop(null)
    try {
      await updateStop(id, patch)
    } catch (err) {
      console.error(err)
      alert('儲存失敗，請檢查網路後重試')
    }
  }

  async function handleDelete(stop: Stop) {
    if (!confirm(`確定要刪除「${stop.name}」嗎？`)) return
    setStops((prev) => prev.filter((s) => s.id !== stop.id))
    try {
      await deleteStop(stop.id)
    } catch (err) {
      console.error(err)
      alert('刪除失敗，請檢查網路後重試')
    }
  }

  async function handleMove(stop: Stop, targetDayId: string) {
    const targetCount = stops.filter((s) => s.day_id === targetDayId).length
    setStops((prev) => prev.map((s) => (s.id === stop.id ? { ...s, day_id: targetDayId, order_index: targetCount } : s)))
    try {
      await moveStopToDay(stop, targetDayId, targetCount)
    } catch (err) {
      console.error(err)
      alert('搬移失敗，請檢查網路後重試')
    }
  }

  async function handleCopy(stop: Stop, targetDayId: string) {
    const targetCount = stops.filter((s) => s.day_id === targetDayId).length
    try {
      const created = await copyStopToDay(stop, targetDayId, targetCount)
      setStops((prev) => [...prev, created])
    } catch (err) {
      console.error(err)
      alert('複製失敗，請檢查網路後重試')
    }
  }

  function onTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX
  }
  function onTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return
    const delta = e.changedTouches[0].clientX - touchStartX.current
    touchStartX.current = null
    if (Math.abs(delta) < 60) return
    if (delta < 0 && currentIndex < days.length - 1) navigate(`/day/${days[currentIndex + 1].id}`)
    if (delta > 0 && currentIndex > 0) navigate(`/day/${days[currentIndex - 1].id}`)
  }

  if (loadingDays || loadingStops || !dayId) {
    return <div className="py-20 text-center text-slate-400">載入中…</div>
  }

  return (
    <div className="-mt-4">
      <DayTabs days={days} activeId={dayId} onSelect={(id) => navigate(`/day/${id}`)} />

      <div onTouchStart={onTouchStart} onTouchEnd={onTouchEnd} className="space-y-2 pt-3">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={dayStops.map((s) => s.id)} strategy={verticalListSortingStrategy}>
            {dayStops.map((stop, i) => (
              <StopCard
                key={stop.id}
                stop={stop}
                days={days}
                isFirst={i === 0}
                isLast={i === dayStops.length - 1}
                onEdit={() => setEditingStop(stop)}
                onDelete={() => handleDelete(stop)}
                onMove={(targetId) => handleMove(stop, targetId)}
                onCopy={(targetId) => handleCopy(stop, targetId)}
                onReorder={(dir) => reorderStep(stop, dir)}
              />
            ))}
          </SortableContext>
        </DndContext>

        {dayStops.length === 0 && (
          <div className="py-10 text-center text-sm text-slate-300">這天還沒有安排行程</div>
        )}

        <div className="flex gap-2 pt-2">
          <input
            value={quickText}
            onChange={(e) => setQuickText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleQuickAdd()}
            placeholder="快速新增行程，輸入名稱後 Enter"
            className="flex-1 rounded-xl border border-slate-300 px-3 py-2.5 text-sm"
          />
          <button
            type="button"
            onClick={handleQuickAdd}
            className="rounded-xl bg-slate-900 px-4 text-sm font-medium text-white"
          >
            ＋ 新增
          </button>
        </div>
      </div>

      {editingStop && (
        <StopEditSheet stop={editingStop} onSave={handleSaveEdit} onClose={() => setEditingStop(null)} />
      )}
    </div>
  )
}
