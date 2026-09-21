import { supabase } from './supabase'
import type { Day } from './types'

// 地區是從標題自動推導（去掉括號內容），編輯標題時保持兩者一致，
// 這樣分日行程頁的日期 tab 小字才會跟著總覽頁改的標題同步。
export function deriveRegion(title: string): string {
  const stripped = title.replace(/[（(].*?[）)]/g, '').trim()
  return stripped || title
}

export async function updateDay(id: string, patch: Partial<Day>) {
  const { error } = await supabase.from('days').update(patch).eq('id', id)
  if (error) throw error
}

// 兩天的日期是固定的（行程表訂死 11/6–11/13），「調整整天順序」在這裡的意思是
// 交換兩張卡片的內容（標題/地區/當天所有 stops），卡片本身的日期位置不動。
export async function swapDays(dayA: Day, dayB: Day) {
  const [{ data: stopsA }, { data: stopsB }] = await Promise.all([
    supabase.from('stops').select('id').eq('day_id', dayA.id),
    supabase.from('stops').select('id').eq('day_id', dayB.id),
  ])
  const idsA = (stopsA ?? []).map((s) => s.id)
  const idsB = (stopsB ?? []).map((s) => s.id)

  await Promise.all([
    supabase.from('days').update({ title: dayB.title, region: dayB.region, note: dayB.note }).eq('id', dayA.id),
    supabase.from('days').update({ title: dayA.title, region: dayA.region, note: dayA.note }).eq('id', dayB.id),
  ])

  await Promise.all([
    idsA.length ? supabase.from('stops').update({ day_id: dayB.id }).in('id', idsA) : Promise.resolve(),
    idsB.length ? supabase.from('stops').update({ day_id: dayA.id }).in('id', idsB) : Promise.resolve(),
  ])
}
