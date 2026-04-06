import type { PlacementQuestionType } from '@/shared/types/placement'
import { Button, Input, AudioUpload } from '@/shared/ui'
import { PlusCircle, ChevronDown } from 'lucide-react'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import type { QuestionFormState, ErrorFormState } from '../types'
import { typeOptions } from '../types'

interface PlacementQuestionFormProps {
  form: QuestionFormState
  errors: ErrorFormState
  editingId: string | null
  onChangeLanguage: (value: string) => void
  onChangeType: (value: PlacementQuestionType) => void
  onChangeDifficulty: (value: number) => void
  onChangePrompt: (value: string) => void
  onChangeContext: (value: string) => void
  onChangeMediaUrl: (url: string) => void
  onChangeExplanation: (value: string) => void
  onChangeOption: (index: number, value: string) => void
  onAddOption: () => void
  onRemoveOption: (index: number) => void
  onChangeCorrectIndex: (index: number) => void
  onSubmit: (e: React.FormEvent) => void
  onReset: () => void
}

export const PlacementQuestionForm = ({
  form,
  errors,
  editingId,
  onChangeLanguage,
  onChangeType,
  onChangeDifficulty,
  onChangePrompt,
  onChangeContext,
  onChangeMediaUrl,
  onChangeExplanation,
  onChangeOption,
  onAddOption,
  onRemoveOption,
  onChangeCorrectIndex,
  onSubmit,
  onReset,
}: PlacementQuestionFormProps) => {
  const { t } = useTranslation('platform', { keyPrefix: 'admin.placementBank.form' })
  const { t: ts } = useTranslation('platform', { keyPrefix: 'placement.inProgress' })

  const typeLabels = useMemo(
    () => ({
      GRAMMAR: ts('skillGrammar'),
      VOCAB: ts('skillLexical'),
      READING: ts('skillReading'),
      LISTENING: ts('skillListening'),
    }),
    [ts],
  )

  return (
    <form
      onSubmit={onSubmit}
      className="glass-card rounded-2xl p-6 backdrop-blur-xl space-y-4"
    >
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-semibold text-foreground">
          {editingId ? t('editTitle') : t('newTitle')}
        </h2>
        {editingId ? (
          <Button type="button" size="sm" variant="ghost" onClick={onReset}>
            {t('reset')}
          </Button>
        ) : null}
      </div>

      <div className="space-y-2">
        <label className="block text-xs font-medium text-foreground">{t('language')}</label>
        <Input value={form.language} onChange={e => onChangeLanguage(e.target.value)} />
        {errors.language ? (
          <p className="text-[11px] text-red-600 mt-0.5">{errors.language}</p>
        ) : null}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <label className="block text-xs font-medium text-foreground">{t('type')}</label>
          <div className="relative">
            <select
              value={form.type}
              onChange={e => onChangeType(e.target.value as PlacementQuestionType)}
              className="h-9 w-full appearance-none rounded-md border border-border bg-background px-2 pr-7 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
            >
              {typeOptions
                .filter(opt => opt.value !== 'ALL')
                .map(opt => (
                  <option key={opt.value} value={opt.value}>
                    {typeLabels[opt.value as keyof typeof typeLabels]}
                  </option>
                ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground" />
          </div>
        </div>
        <div className="space-y-2">
          <label className="block text-xs font-medium text-foreground">{t('difficulty')}</label>
          <Input
            type="number"
            min={1}
            max={6}
            value={form.difficulty}
            onChange={e => onChangeDifficulty(Number(e.target.value) || 1)}
            className="[&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none text-sm"
          />
          {errors.difficulty ? (
            <p className="text-[11px] text-red-600 mt-0.5">{errors.difficulty}</p>
          ) : null}
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-xs font-medium text-foreground">{t('prompt')}</label>
        <textarea
          value={form.prompt}
          onChange={e => onChangePrompt(e.target.value)}
          className="min-h-[80px] w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
        />
        {errors.prompt ? (
          <p className="text-[11px] text-red-600 mt-0.5">{errors.prompt}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <label className="block text-xs font-medium text-foreground">{t('context')}</label>
        <textarea
          value={form.context}
          onChange={e => onChangeContext(e.target.value)}
          className="min-h-[80px] w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
        />
      </div>

      <div className="space-y-2">
        <AudioUpload value={form.mediaUrl} onChange={onChangeMediaUrl} label={t('audioLabel')} />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-medium text-foreground">{t('options')}</label>
          <Button type="button" size="sm" variant="ghost" onClick={onAddOption}>
            <PlusCircle className="mr-1 h-3 w-3" />
            {t('addOption')}
          </Button>
        </div>
        <div className="space-y-2">
          {form.options.map((opt, index) => (
            <div key={index} className="flex items-center gap-2">
              <input
                type="radio"
                name="correctOption"
                checked={form.correctOptionIndex === index}
                onChange={() => onChangeCorrectIndex(index)}
                className="h-3 w-3"
              />
              <Input
                value={opt}
                onChange={e => onChangeOption(index, e.target.value)}
                placeholder={t('optionPh', { n: index + 1 })}
              />
              {form.options.length > 2 ? (
                <Button type="button" size="sm" variant="ghost" onClick={() => onRemoveOption(index)}>
                  ×
                </Button>
              ) : null}
            </div>
          ))}
        </div>
        {errors.options ? <p className="text-[11px] text-red-600 mt-1">{errors.options}</p> : null}
      </div>

      <div className="space-y-2">
        <label className="block text-xs font-medium text-foreground">{t('explanation')}</label>
        <textarea
          value={form.explanation}
          onChange={e => onChangeExplanation(e.target.value)}
          className="min-h-[60px] w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
        />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onReset}>
          {t('cancel')}
        </Button>
        <Button type="submit">{editingId ? t('saveEdit') : t('create')}</Button>
      </div>
    </form>
  )
}
