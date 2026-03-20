/** Format cents as Belarusian rubles: 3000 → "30 Br" */
export function formatMoney(cents: number): string {
  return `${new Intl.NumberFormat('ru-BY', { maximumFractionDigits: 2 }).format(cents / 100)} Br`
}

/** Returns how many whole days remain until the given ISO date string. */
export function daysLeft(dateStr: string | null | undefined): number {
  if (!dateStr) return 0
  return Math.max(0, Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86400000))
}

/** Format ISO date as "dd.mm.yyyy[ hh:mm]" for display in Russian UI. */
export function formatDateRU(date: string | Date | null | undefined, includeTime = false): string {
  if (!date) return '—'
  const d = new Date(date)
  if (isNaN(d.getTime())) return '—'
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const yyyy = d.getFullYear()
  if (!includeTime) return `${dd}.${mm}.${yyyy}`
  const hh = String(d.getHours()).padStart(2, '0')
  const min = String(d.getMinutes()).padStart(2, '0')
  return `${dd}.${mm}.${yyyy} ${hh}:${min}`
}

/** Format ISO date in long Russian locale form: "15 марта 2026". */
export function formatDateLong(dateStr: string | null | undefined): string {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('ru-RU', { day: '2-digit', month: 'long', year: 'numeric' })
}
