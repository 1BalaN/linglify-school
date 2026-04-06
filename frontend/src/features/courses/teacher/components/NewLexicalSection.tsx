import { useTranslation } from 'react-i18next'
import { BookOpen, Plus, X } from 'lucide-react'
import { Button, Input, VideoUpload } from '@/shared/ui'

interface LexicalItem {
  id: string
  term: string
  translations: string
}

interface NewLexicalSectionProps {
  videoUrl: string
  items: LexicalItem[]
  onVideoChange: (url: string) => void
  onAddItem: () => void
  onUpdateItem: (id: string, patch: Partial<LexicalItem>) => void
  onRemoveItem: (id: string) => void
}

export const NewLexicalSection = ({
  videoUrl,
  items,
  onVideoChange,
  onAddItem,
  onUpdateItem,
  onRemoveItem,
}: NewLexicalSectionProps) => {
  const { t } = useTranslation('platform', { keyPrefix: 'lessonBuilder.lexical' })
  const { t: tv } = useTranslation('platform', { keyPrefix: 'lessonBuilder.optionalVideo' })
  return (
    <div className="space-y-4 rounded-xl border border-sky-200 bg-sky-50/50 p-4 dark:border-sky-900/30 dark:bg-sky-950/20">
      <div className="flex items-center gap-2 text-sm font-medium text-sky-700 dark:text-sky-400">
        <BookOpen className="h-4 w-4" />
        <span>{t('title')}</span>
      </div>

      <VideoUpload value={videoUrl} onChange={onVideoChange} label={tv('lexical')} />

      <div className="rounded-lg border border-sky-200/60 bg-sky-100/30 px-3 py-2 text-xs text-sky-700 dark:border-sky-800/30 dark:bg-sky-900/20 dark:text-sky-300">
        {t('intro')}
      </div>

      <div>
        <h4 className="mb-3 text-sm font-semibold">{t('words', { count: items.length })}</h4>
        <div className="max-h-[480px] space-y-4 overflow-y-auto pr-1 scroll-soft">
          {items.map((item, idx) => (
            <div key={item.id} className="rounded-lg border border-border bg-card p-4">
              <div className="mb-3 flex items-start gap-2">
                <span className="mt-2 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sky-500/10 text-xs font-bold text-sky-600 dark:text-sky-300">
                  {idx + 1}
                </span>
                <div className="flex-1 space-y-2">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-muted-foreground">
                      {t('term')}
                    </label>
                    <Input
                      value={item.term}
                      onChange={e => onUpdateItem(item.id, { term: e.target.value })}
                      placeholder="to book, make up, etc."
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-muted-foreground">
                      {t('translations')}
                    </label>
                    <Input
                      value={item.translations}
                      onChange={e => onUpdateItem(item.id, { translations: e.target.value })}
                      placeholder={t('translationsPh')}
                    />
                  </div>
                </div>
                {items.length > 1 ? (
                  <button
                    onClick={() => onRemoveItem(item.id)}
                    type="button"
                    className="mt-2 text-muted-foreground hover:text-red-500"
                  >
                    <X className="h-4 w-4" />
                  </button>
                ) : null}
              </div>
            </div>
          ))}
        </div>
        <Button variant="outline" size="sm" type="button" onClick={onAddItem} className="mt-3 w-full">
          <Plus className="mr-1 h-3 w-3" />
          {t('addWord')}
        </Button>
      </div>
    </div>
  )
}
