export function normalizeName(s: string): string {
  return s.replace(/[\s\n\r（）()【】「」]/g, '').toLowerCase()
}
