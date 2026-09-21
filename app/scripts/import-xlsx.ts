// 福岡行程 Excel 匯入腳本
//
// 用法：
//   npm run import              -- 只解析 xlsx，輸出 scripts/seed.json 給你檢查
//   npm run import -- --push    -- 解析後直接寫進 Supabase（需要 app/.env.local 有
//                                   VITE_SUPABASE_URL 與 SUPABASE_SERVICE_ROLE_KEY）
//
// 來源檔案預設抓專案根目錄的 2026。服哭卡.xlsx（總覽 / 行程 / 想去的 / 要買的 四個分頁）。
// 分日表（行程分頁）內容若與總覽分頁衝突，一律以分日表為準。

import { writeFileSync, existsSync } from 'node:fs'
import { randomUUID } from 'node:crypto'
import path from 'node:path'
import XLSX from 'xlsx'
import { config as loadEnv } from 'dotenv'

loadEnv({ path: path.resolve(import.meta.dirname, '..', '.env.local') })

type Person = '潘' | '黑' | '劉'
const PEOPLE: Person[] = ['潘', '黑', '劉']
type StopType = 'eat' | 'see' | 'buy' | 'transport' | 'other'

interface DayRow {
  id: string
  date: string
  title: string
  region: string
  note: string | null
}

interface StopRow {
  id: string
  day_id: string | null
  order_index: number
  time: string | null
  name: string
  type: StopType
  note: string | null
  hours: string | null
  address: string | null
  region: string | null
  map_url: string | null
  needs_booking: boolean
  image_url: string | null
  who_wants: Person[]
}

interface TodoRow {
  id: string
  text: string
  due_date: string | null
  done: boolean
}

const ROOT = path.resolve(import.meta.dirname, '..', '..')
const XLSX_PATH = process.argv.find((a) => a.endsWith('.xlsx')) ?? path.join(ROOT, '2026。服哭卡.xlsx')
const OUT_PATH = path.join(import.meta.dirname, 'seed.json')
const PUSH = process.argv.includes('--push')

if (!existsSync(XLSX_PATH)) {
  console.error(`找不到 xlsx：${XLSX_PATH}`)
  process.exit(1)
}

const wb = XLSX.readFile(XLSX_PATH, { cellDates: true })

function sheetRows(name: string): unknown[][] {
  const sheet = wb.Sheets[name]
  if (!sheet) throw new Error(`找不到分頁：${name}`)
  return XLSX.utils.sheet_to_json(sheet, { header: 1, raw: true, defval: null }) as unknown[][]
}

function str(v: unknown): string | null {
  if (v === null || v === undefined) return null
  const s = String(v).replace(/\r\n/g, '\n').trim()
  return s === '' ? null : s
}

function flatten(v: unknown): string | null {
  const s = str(v)
  return s ? s.replace(/\n/g, ' ').trim() : null
}

function normalize(s: string): string {
  return s.replace(/[\s\n\r（）()【】「」]/g, '').toLowerCase()
}

function splitPeople(v: unknown): Person[] {
  const s = str(v)
  if (!s) return []
  return s
    .split(/[,，、\s]+/)
    .map((p) => p.trim())
    .filter((p): p is Person => (PEOPLE as string[]).includes(p))
}

function excelDateToISO(v: unknown): string | null {
  if (v instanceof Date) {
    const y = v.getFullYear()
    const m = String(v.getMonth() + 1).padStart(2, '0')
    const d = String(v.getDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
  }
  return null
}

// ---------- 想去的（候選清單，也是分日表 cross-reference 的資料源） ----------

const TYPE_MAP: Record<string, StopType> = { 吃的: 'eat', 看的: 'see', 買的: 'buy' }
const BOOKING_RE = /訂位|預約/

const candidateRows = sheetRows('想去的').slice(1) // 去表頭
const candidates: StopRow[] = []
const lookup = new Map<string, StopRow>() // normalized name -> candidate

let candidateOrder = 0
for (const row of candidateRows) {
  const name = flatten(row[1])
  if (!name) continue
  const typeRaw = str(row[0])
  const note = str(row[7])
  const address = str(row[3])
  const region = str(row[4])
  const mapUrl = str(row[6])
  const who = splitPeople(row[5])
  const c: StopRow = {
    id: randomUUID(),
    day_id: null,
    order_index: candidateOrder++,
    time: null,
    name,
    type: (typeRaw && TYPE_MAP[typeRaw]) || 'other',
    note,
    hours: null,
    address,
    region,
    map_url: mapUrl,
    needs_booking: !!(note && BOOKING_RE.test(note)),
    image_url: null,
    who_wants: who,
  }
  candidates.push(c)
  lookup.set(normalize(name), c)
}

// ---------- 總覽（只拿 day 標題/地區 + 待辦種子，行程分頁內容才是準的） ----------

const overviewRows = sheetRows('總覽')
const dayMeta = new Map<string, { title: string }>() // ISO date -> meta
const seedTodos: TodoRow[] = []

for (const row of overviewRows) {
  const iso = excelDateToISO(row[1])
  const title = flatten(row[2])
  if (iso && title) dayMeta.set(iso, { title })

  // M/N 欄：待辦種子（文字 + 勾選狀態）
  const todoText = str(row[12])
  const done = row[13]
  if (todoText && typeof done === 'boolean') {
    seedTodos.push({ id: randomUUID(), text: todoText, due_date: null, done })
  }
}

// 從行程分頁得知：Robata no Ito Okashi 10/10 開放預約，明確補一筆待辦
seedTodos.push({
  id: randomUUID(),
  text: '預約 Robata no Ito Okashi（10/10 開放預約）',
  due_date: '2026-10-10',
  done: false,
})

// ---------- 行程（逐日分頁，權威資料源） ----------

const itineraryRows = sheetRows('行程')
const DAY_HEADER_RE = /^(\d{1,2})\/(\d{1,2})/

const days: DayRow[] = []
const stops: StopRow[] = []

const FOOD_KW = /午餐|晚餐|早餐|咖啡|拉麵|丼|燒肉|牛|壽司|麵|甜點|可麗露|布丁|可樂餅|立食|屋台|鍋|餅|抹茶|パン/
const TRANSPORT_KW = /站|機場|出發|抵達|check ?in|回程|班機|的船|港|新幹線|ＪＲ|JR|巴士|地鐵/i
const SHOP_KW = /PARCO|岩田屋|三越|AMU|Yodobashi|友都八喜|運河城|ONE FUKUOKA|Mina|百貨|免稅|購物/i
const MAP_DOMAIN_RE = /(maps\.app\.goo\.gl|google\.[a-z.]+\/maps|goo\.gl\/maps)/i
const URL_RE = /^https?:\/\//i
const HOURS_RE = /\d{1,2}:\d{2}.{0,3}[~〜～-].{0,3}\d{1,2}:\d{2}/

function classify(name: string, note: string | null): StopType {
  const s = `${name} ${note ?? ''}`
  if (FOOD_KW.test(s)) return 'eat'
  if (TRANSPORT_KW.test(s)) return 'transport'
  if (SHOP_KW.test(s)) return 'buy'
  return 'other'
}

let currentDayId: string | null = null
let currentDayIso: string | null = null
let orderInDay = 0

for (const row of itineraryRows) {
  const a = str(row[0])
  if (a && DAY_HEADER_RE.test(a)) {
    const m = a.match(DAY_HEADER_RE)!
    const mo = m[1].padStart(2, '0')
    const da = m[2].padStart(2, '0')
    const iso = `2026-${mo}-${da}`
    const meta = dayMeta.get(iso)
    const rawTitle = meta?.title ?? ''
    const region = rawTitle.replace(/[（(].*?[）)]/g, '').trim() || rawTitle
    const id = randomUUID()
    days.push({ id, date: iso, title: rawTitle, region, note: null })
    currentDayId = id
    currentDayIso = iso
    orderInDay = 0
    continue
  }
  // 時間/目的地/備註 表頭列，略過
  if (a === '時間' && str(row[1]) === '目的地') continue
  if (!currentDayId) continue

  const name = flatten(row[1])
  if (!name) continue
  if (name === 'check in' || name === 'check-in') {
    // 純住宿標記，保留但歸類為 other/交通皆可，這裡當作行程項目留著讓使用者編輯
  }

  const time = str(row[0])
  let note = str(row[2])
  const col3 = str(row[3])
  const col4 = str(row[4])

  let hours: string | null = null
  let mapUrlFromRow: string | null = null

  if (col3 && URL_RE.test(col3.split('\n')[0])) {
    const links = col3.split('\n').filter(Boolean)
    const mapLink = links.find((l) => MAP_DOMAIN_RE.test(l))
    if (mapLink) mapUrlFromRow = mapLink
    const refLinks = links.filter((l) => l !== mapLink)
    if (refLinks.length) {
      note = [note, `參考連結：${refLinks.join(' ')}`].filter(Boolean).join('\n')
    }
  } else if (col3) {
    hours = col4 ? `${col3}\n${col4}` : col3
  } else if (col4) {
    hours = col4
  }

  if (!hours && !HOURS_RE.test('') && col3 && !URL_RE.test(col3)) {
    // 已在上面處理，這段只是防呆保留
  }

  const match = lookup.get(normalize(name))

  const stop: StopRow = {
    id: randomUUID(),
    day_id: currentDayId,
    order_index: orderInDay++,
    time,
    name,
    type: match?.type ?? classify(name, note),
    note,
    hours,
    address: match?.address ?? null,
    region: match?.region ?? null,
    map_url: match?.map_url ?? mapUrlFromRow,
    needs_booking: !!(note && BOOKING_RE.test(note)) || !!match?.needs_booking,
    image_url: null,
    who_wants: match?.who_wants ?? [],
  }
  stops.push(stop)
  void currentDayIso
}

// 候選清單本身也要輸出成 stops（day_id: null）
const allStops = [...stops, ...candidates]

const seed = {
  days,
  stops: allStops,
  wishlist: [] as unknown[],
  todos: seedTodos,
}

writeFileSync(OUT_PATH, JSON.stringify(seed, null, 2), 'utf-8')

console.log(`解析完成 → ${OUT_PATH}`)
console.log(`  天數: ${days.length}`)
console.log(`  分日行程項目: ${stops.length}`)
console.log(`  候選清單項目: ${candidates.length}`)
console.log(`  待辦: ${seedTodos.length}`)

const unmatchedTransport = stops.filter((s) => s.type === 'other')
if (unmatchedTransport.length) {
  console.log(`\n有 ${unmatchedTransport.length} 筆無法判斷類型，先歸類為「其他」，之後可在頁面上手動調整：`)
  for (const s of unmatchedTransport) console.log(`  - ${s.name}`)
}

if (!PUSH) {
  console.log('\n只輸出了 JSON，沒有寫入 Supabase。確認 seed.json 內容沒問題後，加上 --push 參數即可寫入。')
  process.exit(0)
}

// ---------- 寫入 Supabase ----------

const SUPABASE_URL = process.env.VITE_SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('\n缺少 VITE_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY，請先在 app/.env.local 設定。')
  process.exit(1)
}

const { createClient } = await import('@supabase/supabase-js')
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

async function guardEmpty(table: string) {
  const { count, error } = await supabase.from(table).select('*', { count: 'exact', head: true })
  if (error) throw error
  if (count && count > 0) {
    console.error(`\n資料庫的 ${table} 已經有 ${count} 筆資料，為了避免蓋掉現有編輯，中止匯入。`)
    console.error(`若確定要重新匯入，請先到 Supabase 手動清空這幾張表：days, stops, wishlist, todos`)
    process.exit(1)
  }
}

async function insertAll(table: string, rows: unknown[]) {
  if (!rows.length) return
  const chunkSize = 500
  for (let i = 0; i < rows.length; i += chunkSize) {
    const chunk = rows.slice(i, i + chunkSize)
    const { error } = await supabase.from(table).insert(chunk)
    if (error) throw error
  }
  console.log(`  ${table}: 寫入 ${rows.length} 筆`)
}

for (const t of ['days', 'stops', 'wishlist', 'todos']) await guardEmpty(t)

console.log('\n寫入 Supabase...')
await insertAll('days', days)
await insertAll('stops', allStops)
await insertAll('todos', seedTodos)
console.log('完成！')
