import i18n from '@/shared/i18n/config'

function appLocaleTag(): 'en-US' | 'ru-RU' {
  const lng = (i18n.language || 'ru').split('-')[0]
  return lng === 'en' ? 'en-US' : 'ru-RU'
}

const EM_DASH = '—'

/** Format cents as Belarusian rubles using the active UI locale. */
export function formatMoney(cents: number): string {
  const locale = appLocaleTag()
  const amount = cents / 100
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: 'BYN',
      maximumFractionDigits: 2,
    }).format(amount)
  } catch {
    return `${new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }).format(amount)} BYN`
  }
}

/** Returns how many whole days remain until the given ISO date string. */
export function daysLeft(dateStr: string | null | undefined): number {
  if (!dateStr) return 0
  return Math.max(0, Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86400000))
}

/** Format ISO date in short numeric form for the active UI locale. */
export function formatDateShort(
  date: string | Date | null | undefined,
  includeTime = false,
): string {
  if (!date) return EM_DASH
  const d = new Date(date)
  if (isNaN(d.getTime())) return EM_DASH
  const locale = appLocaleTag()
  const opts: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }
  if (includeTime) {
    opts.hour = '2-digit'
    opts.minute = '2-digit'
  }
  return new Intl.DateTimeFormat(locale, opts).format(d)
}

/**
 * @deprecated Use {@link formatDateShort} — same behavior, locale follows UI language.
 */
export const formatDateRU = formatDateShort

/** Format ISO date in long form for the active UI locale. */
export function formatDateLong(dateStr: string | null | undefined): string {
  if (!dateStr) return EM_DASH
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return EM_DASH
  const locale = appLocaleTag()
  return d.toLocaleDateString(locale, {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}
