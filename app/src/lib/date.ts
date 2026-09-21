const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六']

export function formatDateLabel(iso: string): string {
  const d = new Date(`${iso}T00:00:00`)
  return `${d.getMonth() + 1}/${d.getDate()}（${WEEKDAYS[d.getDay()]}）`
}

export function formatWeekday(iso: string): string {
  const d = new Date(`${iso}T00:00:00`)
  return WEEKDAYS[d.getDay()]
}
