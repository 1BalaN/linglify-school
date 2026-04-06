import type { PlacementQuestionType } from '@/shared/types/placement'
import { Button, Input } from '@/shared/ui'
import { ChevronDown, X } from 'lucide-react'
import { useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import type { AdminPlacementQuestion } from '../types'
import { typeOptions } from '../types'

interface PlacementQuestionsListProps {
  items: AdminPlacementQuestion[]
  isLoading: boolean
  page: number
  languageFilter: string
  typeFilter: PlacementQuestionType | 'ALL'
  onLanguageFilterChange: (value: string) => void
  onTypeFilterChange: (value: PlacementQuestionType | 'ALL') => void
  onPageChange: (page: number) => void
  pagination?: {
    page: number
    totalPages: number
  }
  onEdit: (id: string) => void
  onDelete: (id: string) => void
}

export const PlacementQuestionsList = ({
  items,
  isLoading,
  page,
  languageFilter,
  typeFilter,
  onLanguageFilterChange,
  onTypeFilterChange,
  onPageChange,
  pagination,
  onEdit,
  onDelete,
}: PlacementQuestionsListProps) => {
  const { t: tBank } = useTranslation('platform', { keyPrefix: 'admin.placementBank' })
  const { t: ts } = useTranslation('platform', { keyPrefix: 'placement.inProgress' })

  const typeLabel = useCallback(
    (type: PlacementQuestionType) => {
      switch (type) {
        case 'GRAMMAR':
          return ts('skillGrammar')
        case 'VOCAB':
          return ts('skillLexical')
        case 'READING':
          return ts('skillReading')
        case 'LISTENING':
          return ts('skillListening')
        default:
          return type
      }
    },
    [ts],
  )

  const typeSelectLabels = useMemo(
    () => ({
      ALL: tBank('typeAll'),
      GRAMMAR: ts('skillGrammar'),
      VOCAB: ts('skillLexical'),
      READING: ts('skillReading'),
      LISTENING: ts('skillListening'),
    }),
    [tBank, ts],
  )

  return (
    <div className="glass-card rounded-2xl p-6 backdrop-blur-xl">
      <div className="mb-4 flex items-center justify-between gap-4">
        <h2 className="text-lg font-semibold text-foreground whitespace-nowrap">
          {tBank('title')}
        </h2>
        <div className="flex flex-1 items-center justify-end gap-2 text-xs">
          <div className="relative max-w-[220px] w-full">
            <Input
              placeholder={tBank('langFilterPh')}
              value={languageFilter}
              onChange={e => {
                onLanguageFilterChange(e.target.value)
                onPageChange(1)
              }}
              className="h-8 w-full pr-7 text-xs"
            />
            {languageFilter ? (
              <button
                type="button"
                onClick={() => {
                  onLanguageFilterChange('')
                  onPageChange(1)
                }}
                className="absolute right-1 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition"
                aria-label={tBank('clearLangAria')}
              >
                <X className="h-3 w-3" />
              </button>
            ) : null}
          </div>
          <div className="relative max-w-[180px] w-full">
            <select
              value={typeFilter}
              onChange={e => {
                onTypeFilterChange(e.target.value as PlacementQuestionType | 'ALL')
                onPageChange(1)
              }}
              className="h-8 w-full appearance-none rounded-md border border-border bg-background px-2 pr-7 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
            >
              {typeOptions.map(opt => (
                <option key={opt.value} value={opt.value}>
                  {opt.value === 'ALL'
                    ? typeSelectLabels.ALL
                    : typeSelectLabels[opt.value as PlacementQuestionType]}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground" />
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="py-8 text-center text-muted-foreground text-sm">
          {tBank('loading')}
        </div>
      ) : items.length === 0 ? (
        <div className="py-8 text-center text-muted-foreground text-sm">
          {tBank('empty')}
        </div>
      ) : (
        <div className="space-y-3">
          {items.map(q => (
            <div
              key={q.id}
              className="rounded-xl border border-border bg-background/60 p-4 text-sm flex flex-col gap-2"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 font-medium text-primary">
                    {q.language}
                  </span>
                  <span className="inline-flex items-center rounded-full bg-secondary/10 px-2 py-0.5 font-medium text-secondary-foreground">
                    {typeLabel(q.type)}
                  </span>
                  <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 font-medium">
                    {tBank('difficulty', { n: q.difficulty })}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <Button size="sm" variant="outline" onClick={() => onEdit(q.id)}>
                    {tBank('edit')}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => onDelete(q.id)}>
                    {tBank('delete')}
                  </Button>
                </div>
              </div>
              <div className="font-medium text-foreground">{q.prompt}</div>
              {q.context ? (
                <div className="text-xs text-muted-foreground line-clamp-2">{q.context}</div>
              ) : null}
              <div className="mt-1 text-xs text-muted-foreground">
                {tBank('optionsCount', { count: q.options.length })}
              </div>
            </div>
          ))}

          {pagination && pagination.totalPages > 1 ? (
            <div className="mt-4 flex items-center justify-center gap-2 text-xs">
              <Button
                size="sm"
                variant="outline"
                disabled={page <= 1}
                onClick={() => onPageChange(Math.max(1, page - 1))}
              >
                {tBank('back')}
              </Button>
              <span className="px-2 py-1 text-muted-foreground">
                {tBank('pageOf', { page: pagination.page, totalPages: pagination.totalPages })}
              </span>
              <Button
                size="sm"
                variant="outline"
                disabled={page >= pagination.totalPages}
                onClick={() => onPageChange(Math.min(pagination.totalPages, page + 1))}
              >
                {tBank('forward')}
              </Button>
            </div>
          ) : null}
        </div>
      )}
    </div>
  )
}
