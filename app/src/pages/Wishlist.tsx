import { useMemo, useState } from 'react'
import { useRealtimeTable } from '../hooks/useRealtimeTable'
import type { Stop, WishlistItem } from '../lib/types'
import { blankWishlistItem, deleteWishlistItem, upsertWishlistItem } from '../lib/wishlistActions'
import { WishlistRow } from '../components/WishlistRow'
import { WishlistEditSheet } from '../components/WishlistEditSheet'

type GroupBy = 'none' | 'who' | 'store'

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

export function Wishlist() {
  const { rows: items, setRows: setItems, loading } = useRealtimeTable<WishlistItem>('wishlist', {
    orderBy: { column: 'created_at' },
  })
  const { rows: stops } = useRealtimeTable<Stop>('stops')

  const [groupBy, setGroupBy] = useState<GroupBy>('none')
  const [editingItem, setEditingItem] = useState<WishlistItem | null>(null)
  const [isNew, setIsNew] = useState(false)

  const stopById = useMemo(() => new Map(stops.map((s) => [s.id, s])), [stops])

  const total = items.reduce((sum, i) => sum + (i.price_jpy ?? 0), 0)
  const boughtTotal = items.filter((i) => i.bought).reduce((sum, i) => sum + (i.price_jpy ?? 0), 0)

  const groups = useMemo(() => {
    if (groupBy === 'none') return [{ key: '', label: '', items }]
    const map = new Map<string, WishlistItem[]>()
    for (const item of items) {
      const key = groupBy === 'who' ? item.who || '未指定' : item.store || '未指定店家'
      const arr = map.get(key) ?? []
      arr.push(item)
      map.set(key, arr)
    }
    return Array.from(map.entries())
      .map(([key, its]) => ({ key, label: key, items: its }))
      .sort((a, b) => a.label.localeCompare(b.label, 'zh-Hant'))
  }, [items, groupBy])

  async function handleSave(patch: Partial<WishlistItem>) {
    if (!editingItem) return
    const merged: WishlistItem = { ...editingItem, ...patch }
    setItems((prev) =>
      prev.some((i) => i.id === merged.id) ? prev.map((i) => (i.id === merged.id ? merged : i)) : [...prev, merged],
    )
    setEditingItem(null)
    setIsNew(false)
    try {
      await upsertWishlistItem(merged)
    } catch (err) {
      console.error(err)
      alert('儲存失敗，請檢查網路後重試')
    }
  }

  async function handleDelete() {
    if (!editingItem) return
    const id = editingItem.id
    setItems((prev) => prev.filter((i) => i.id !== id))
    setEditingItem(null)
    setIsNew(false)
    try {
      await deleteWishlistItem(id)
    } catch (err) {
      console.error(err)
    }
  }

  async function handleToggleBought(item: WishlistItem) {
    const patch = { bought: !item.bought }
    setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, ...patch } : i)))
    try {
      await upsertWishlistItem({ ...item, ...patch })
    } catch (err) {
      console.error(err)
    }
  }

  if (loading) {
    return <div className="py-20 text-center text-slate-400">載入中…</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-slate-800">想買清單</h1>
        <button
          type="button"
          onClick={() => {
            setEditingItem(blankWishlistItem())
            setIsNew(true)
          }}
          className="rounded-xl bg-slate-900 px-3 py-1.5 text-sm font-medium text-white"
        >
          ＋ 新增
        </button>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-500">預算小計</span>
          <span className="font-bold text-slate-800">¥{total.toLocaleString()}</span>
        </div>
        <div className="mt-0.5 flex items-center justify-between text-xs text-slate-400">
          <span>已購買</span>
          <span>¥{boughtTotal.toLocaleString()}</span>
        </div>
      </div>

      <div className="flex gap-1.5">
        <Pill active={groupBy === 'none'} onClick={() => setGroupBy('none')}>
          全部
        </Pill>
        <Pill active={groupBy === 'who'} onClick={() => setGroupBy('who')}>
          依人分組
        </Pill>
        <Pill active={groupBy === 'store'} onClick={() => setGroupBy('store')}>
          依店家分組
        </Pill>
      </div>

      <div className="space-y-5">
        {groups.map((group) => {
          const subtotal = group.items.reduce((sum, i) => sum + (i.price_jpy ?? 0), 0)
          return (
            <div key={group.key || 'all'} className="space-y-2">
              {groupBy !== 'none' && (
                <div className="flex items-center justify-between px-1 text-sm">
                  <span className="font-semibold text-slate-600">{group.label}</span>
                  <span className="text-slate-400">¥{subtotal.toLocaleString()}</span>
                </div>
              )}
              {group.items.map((item) => (
                <WishlistRow
                  key={item.id}
                  item={item}
                  linkedStop={item.stop_id ? stopById.get(item.stop_id) : undefined}
                  onToggleBought={() => handleToggleBought(item)}
                  onEdit={() => {
                    setEditingItem(item)
                    setIsNew(false)
                  }}
                />
              ))}
            </div>
          )
        })}
        {items.length === 0 && <div className="py-10 text-center text-sm text-slate-300">還沒有想買的東西</div>}
      </div>

      {editingItem && (
        <WishlistEditSheet
          item={editingItem}
          stops={stops}
          onSave={handleSave}
          onDelete={isNew ? undefined : handleDelete}
          onClose={() => {
            setEditingItem(null)
            setIsNew(false)
          }}
        />
      )}
    </div>
  )
}
