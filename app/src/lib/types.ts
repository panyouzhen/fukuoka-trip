export type Person = '潘' | '黑' | '劉'
export const PEOPLE: Person[] = ['潘', '黑', '劉']

export type StopType = 'eat' | 'see' | 'buy' | 'transport' | 'other'

export const STOP_TYPE_LABEL: Record<StopType, string> = {
  eat: '吃',
  see: '看',
  buy: '買',
  transport: '交通',
  other: '其他',
}

export interface Day {
  id: string
  date: string // YYYY-MM-DD
  title: string | null
  region: string | null
  note: string | null
}

export interface Stop {
  id: string
  day_id: string | null
  order_index: number
  time: string | null
  name: string
  type: StopType
  region: string | null
  address: string | null
  note: string | null
  hours: string | null
  map_url: string | null
  needs_booking: boolean
  image_url: string | null
  who_wants: Person[]
  created_at: string
  updated_at: string
}

export interface WishlistItem {
  id: string
  item: string
  who: string | null
  store: string | null
  stop_id: string | null
  price_jpy: number | null
  note: string | null
  image_url: string | null
  bought: boolean
  created_at: string
}

export type FlightDirection = 'depart' | 'return'

export interface Flight {
  id: string
  direction: FlightDirection
  who: Person[]
  date: string | null
  airline: string | null
  flight_no: string | null
  dep_airport: string | null
  dep_time: string | null
  arr_airport: string | null
  arr_time: string | null
  note: string | null
  created_at: string
  updated_at: string
}

export interface Todo {
  id: string
  text: string
  due_date: string | null
  done: boolean
  created_at: string
}
