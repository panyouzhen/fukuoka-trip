import { useMemo, useState } from 'react'
import { useRealtimeTable } from '../hooks/useRealtimeTable'
import type { Day, Person, Stop, StopType } from '../lib/types'
import { PEOPLE, STOP_TYPE_LABEL } from '../lib/types'
import { normalizeName } from '../lib/normalize'
import { copyStopToDay } from '../lib/stopActions'
import { CandidateCard } from '../components/CandidateCard'

const TYPES: StopType[] = ['eat', 'see', 'buy']

function Pill({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
        active ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'
      }`}
    >
      {children}
    </button>
  )
}

export function Candidates() {
  const { rows: days, loading: loadingDays } = useRealtimeTable<Day>('days', { orderBy: { column: 'date' } })
  const { rows: stops, setRows: setStops, loading: loadingStops } = useRealtimeTable<Stop>('stops', {
    orderBy: { column: 'order_index' },
  })

  const [type, setType] = useState<StopType | 'all'>('all')
  const [region, setRegion] = useState<string>('all')
  const [who, setWho] = useState<Person | 'all'>('all')

  const candidates = useMemo(() => stops.filter((s) => !s.day_id), [stops])
  const scheduled = useMemo(() => stops.filter((s) => s.day_id), [stops])

  const dayById = useMemo(() => new Map(days.map((d) => [d.id, d])), [days])

  const scheduledByName = useMemo(() => {
    const map = new Map<string, Day[]>()
    for (const s of scheduled) {
      const key = normalizeName(s.name)
      const day = s.day_id ? dayById.get(s.day_id) : undefined
      if (!day) continue
      const arr = map.get(key) ?? []
      if (!arr.some((d) => d.id === day.id)) arr.push(day)
      map.set(key, arr)
    }
    return map
  }, [scheduled, dayById])

  const regions = useMemo(() => {
    const set = new Set<string>()
    for (const c of candidates) if (c.region) set.add(c.region)
    return Array.from(set).sort()
  }, [candidates])

  const filtered = candidates.filter((c) => {
    if (type !== 'all' && c.type !== type) return false
    if (region !== 'all' && c.region !== region) return false
    if (who !== 'all' && !c.who_wants.includes(who)) return false
    return true
  })

  async function handleAdd(stop: Stop, targetDayId: string) {
    const nextIndex = stops.filter((s) => s.day_id === targetDayId).length
    try {
      const created = await copyStopToDay(stop, targetDayId, nextIndex)
      setStops((prev) => [...prev, created])
    } catch (err) {
      console.error(err)
      alert('加入失敗，請檢查網路後重試')
    }
  }

  if (loadingDays || loadingStops) {
    return <div className="py-20 text-center text-slate-400">載入中…</div>
  }

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-bold text-slate-800">候選清單</h1>

      <div className="space-y-2">
        <div className="flex flex-wrap gap-1.5">
          <Pill active={type === 'all'} onClick={() => setType('all')}>
            全部類型
          </Pill>
          {TYPES.map((t) => (
            <Pill key={t} active={type === t} onClick={() => setType(t)}>
              {STOP_TYPE_LABEL[t]}
            </Pill>
          ))}
        </div>
        <div className="flex flex-wrap gap-1.5">
          <Pill active={region === 'all'} onClick={() => setRegion('all')}>
            全部地區
          </Pill>
          {regions.map((r) => (
            <Pill key={r} active={region === r} onClick={() => setRegion(r)}>
              {r}
            </Pill>
          ))}
        </div>
        <div className="flex flex-wrap gap-1.5">
          <Pill active={who === 'all'} onClick={() => setWho('all')}>
            大家都看
          </Pill>
          {PEOPLE.map((p) => (
            <Pill key={p} active={who === p} onClick={() => setWho(p)}>
              {p}想去
            </Pill>
          ))}
        </div>
      </div>

      <div className="text-xs text-slate-400">{filtered.length} 個候選景點</div>

      <div className="space-y-2">
        {filtered.map((c) => (
          <CandidateCard
            key={c.id}
            stop={c}
            days={days}
            scheduledIn={scheduledByName.get(normalizeName(c.name)) ?? []}
            onAdd={(dayId) => handleAdd(c, dayId)}
          />
        ))}
        {filtered.length === 0 && <div className="py-10 text-center text-sm text-slate-300">沒有符合條件的景點</div>}
      </div>
    </div>
  )
}
