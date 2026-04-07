import { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Globe2, Check } from 'lucide-react'
import { cn } from '@/shared/lib/utils'

type LanguageOption = 'ru' | 'en'

const LANG_OPTIONS: { code: LanguageOption; labelKey: string }[] = [
  { code: 'ru', labelKey: 'language.ru' },
  { code: 'en', labelKey: 'language.en' },
]

export const LanguageSwitcher = () => {
  const { i18n, t } = useTranslation('common')
  const currentLanguage: LanguageOption = i18n.language.startsWith('en') ? 'en' : 'ru'
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement | null>(null)

  const handleSelect = (code: LanguageOption) => {
    void i18n.changeLanguage(code)
    setOpen(false)
  }

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!ref.current) return
      if (!ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false)
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open])

  return (
    <div ref={ref} className="relative inline-flex">
      <button
        type="button"
        onClick={() => setOpen(prev => !prev)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={t('language.label')}
        className={cn(
          'inline-flex h-9 w-9 items-center justify-center rounded-full border bg-card/80 shadow-sm backdrop-blur-sm transition-all duration-150',
          open
            ? 'border-primary/40 bg-primary/10 text-primary'
            : 'border-border/60 text-muted-foreground hover:text-foreground'
        )}
      >
        <Globe2 className="h-4 w-4" />
      </button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 top-10 z-50 min-w-[120px] animate-in fade-in slide-in-from-top-1 duration-150 rounded-xl border border-border/60 bg-card/95 p-1 shadow-lg backdrop-blur-md"
        >
          {LANG_OPTIONS.map(option => {
            const isActive = option.code === currentLanguage
            return (
              <button
                key={option.code}
                type="button"
                role="menuitem"
                onClick={() => handleSelect(option.code)}
                className={cn(
                  'flex w-full items-center justify-between rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                )}
              >
                <span>{option.code.toUpperCase()}</span>
                {isActive && <Check className="h-3 w-3" />}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
