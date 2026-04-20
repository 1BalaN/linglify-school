import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import i18n from '@/shared/i18n/config'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Разбирает строку языков, хранящуюся в БД как comma-separated значение
 * (например "Английский, Испанский"), в массив строк.
 * Возвращает пустой массив для null/undefined/пустой строки.
 *
 * @note preferredLanguage хранится в Postgres как String?, что является
 *   известным архитектурным ограничением. При рефакторинге схемы следует
 *   заменить на String[] / Json-массив.
 */
export function parseLanguages(raw: string | null | undefined): string[] {
  if (!raw?.trim()) return []
  return raw
    .split(',')
    .map(s => s.trim())
    .filter(Boolean)
}

/** First language from comma-separated profile value, or default teaching language for the active locale. */
export function firstLanguage(raw: string | null | undefined): string {
  return parseLanguages(raw)[0] ?? i18n.t('defaults.teachingLanguage', { ns: 'platform' })
}
