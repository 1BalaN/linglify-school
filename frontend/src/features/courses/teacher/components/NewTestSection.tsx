import { useTranslation } from 'react-i18next'
import { ClipboardCheck, Plus, X } from 'lucide-react'
import { Button, Input, VideoUpload } from '@/shared/ui'

interface TestOption {
  id: string
  text: string
  isCorrect: boolean
}

interface TestQuestion {
  id: string
  text: string
  explanation: string
  isMultiple: boolean
  options: TestOption[]
}

interface NewTestSectionProps {
  videoUrl: string
  passThreshold: string
  testTimeLimit: string
  testShuffleQuestions: boolean
  testShuffleOptions: boolean
  isFinalTest: boolean
  questions: TestQuestion[]
  onVideoChange: (url: string) => void
  onThresholdChange: (val: string) => void
  onTimeLimitChange: (val: string) => void
  onShuffleQuestionsChange: (val: boolean) => void
  onShuffleOptionsChange: (val: boolean) => void
  onFinalTestChange: (val: boolean) => void
  onAddQuestion: () => void
  onRemoveQuestion: (qId: string) => void
  onUpdateQuestion: (qId: string, patch: Partial<TestQuestion>) => void
  onAddOption: (qId: string) => void
  onRemoveOption: (qId: string, oId: string) => void
  onUpdateOption: (qId: string, oId: string, patch: Partial<TestOption>) => void
}

export const NewTestSection = ({
  videoUrl,
  passThreshold,
  testTimeLimit,
  testShuffleQuestions,
  testShuffleOptions,
  isFinalTest,
  questions,
  onVideoChange,
  onThresholdChange,
  onTimeLimitChange,
  onShuffleQuestionsChange,
  onShuffleOptionsChange,
  onFinalTestChange,
  onAddQuestion,
  onRemoveQuestion,
  onUpdateQuestion,
  onAddOption,
  onRemoveOption,
  onUpdateOption,
}: NewTestSectionProps) => {
  const { t } = useTranslation('platform', { keyPrefix: 'lessonBuilder.test' })
  const { t: tv } = useTranslation('platform', { keyPrefix: 'lessonBuilder.optionalVideo' })
  return (
    <div className="space-y-4 rounded-xl border border-amber-200 bg-amber-50/50 p-4 dark:border-amber-900/30 dark:bg-amber-950/20">
      <div className="flex items-center justify-between gap-2 text-sm font-medium text-amber-700 dark:text-amber-400">
        <div className="flex items-center gap-2">
          <ClipboardCheck className="h-4 w-4" />
          <span>{t('settings')}</span>
        </div>
        <label className="flex cursor-pointer items-center gap-2 text-xs font-medium text-amber-800 dark:text-amber-300">
          <input
            type="checkbox"
            checked={isFinalTest}
            onChange={e => onFinalTestChange(e.target.checked)}
            className="h-4 w-4 rounded border-amber-400 text-amber-600 focus:ring-amber-500"
          />
          <span>{t('finalTest')}</span>
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <VideoUpload value={videoUrl} onChange={onVideoChange} label={tv('test')} />
        <div>
          <label className="mb-1 block text-sm font-medium">{t('passThreshold')}</label>
          <Input
            type="number"
            value={passThreshold}
            onChange={e => onThresholdChange(e.target.value)}
            placeholder="70"
            min={1}
            max={100}
          />
          <p className="mt-1 text-xs text-muted-foreground">
            {t('minPass', { pct: passThreshold || '?' })}
          </p>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">{t('timer')}</label>
          <Input
            type="number"
            value={testTimeLimit}
            onChange={e => onTimeLimitChange(e.target.value)}
            min={1}
            placeholder={t('timerPh')}
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-4">
        <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
          <input
            type="checkbox"
            checked={testShuffleQuestions}
            onChange={e => onShuffleQuestionsChange(e.target.checked)}
            className="h-4 w-4 rounded text-amber-600"
          />
          {t('shuffleQ')}
        </label>
        <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
          <input
            type="checkbox"
            checked={testShuffleOptions}
            onChange={e => onShuffleOptionsChange(e.target.checked)}
            className="h-4 w-4 rounded text-amber-600"
          />
          {t('shuffleO')}
        </label>
      </div>

      <div>
        <h4 className="mb-3 text-sm font-semibold">{t('questions', { count: questions.length })}</h4>
        <div className="max-h-[480px] space-y-4 overflow-y-auto pr-1 scroll-soft">
          {questions.map((q, qi) => (
            <div key={q.id} className="rounded-lg border border-border bg-card p-4">
              <div className="mb-3 flex items-start gap-2">
                <span className="mt-2 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                  {qi + 1}
                </span>
                <div className="flex-1">
                  <textarea
                    value={q.text}
                    onChange={e => onUpdateQuestion(q.id, { text: e.target.value })}
                    placeholder={t('qTextPh')}
                    className="min-h-[60px] w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none scroll-soft"
                  />
                </div>
                <button
                  onClick={() => onRemoveQuestion(q.id)}
                  type="button"
                  className="mt-2 text-muted-foreground hover:text-red-500"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="mb-2">
                <label className="mb-1 block text-xs font-medium text-muted-foreground">
                  {t('explanation')}
                </label>
                <textarea
                  value={q.explanation}
                  onChange={e => onUpdateQuestion(q.id, { explanation: e.target.value })}
                  placeholder={t('explanationPh')}
                  className="min-h-[50px] w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none scroll-soft"
                />
              </div>

              <div className="mb-2">
                <label className="flex cursor-pointer items-center gap-1.5 text-xs text-muted-foreground">
                  <input
                    type="checkbox"
                    checked={q.isMultiple}
                    onChange={e => onUpdateQuestion(q.id, { isMultiple: e.target.checked })}
                    className="h-3.5 w-3.5 rounded"
                  />
                  {t('multipleCorrect')}
                </label>
              </div>

              <div className="space-y-2">
                {q.options.map(opt => (
                  <div key={opt.id} className="flex items-center gap-2">
                    <input
                      type={q.isMultiple ? 'checkbox' : 'radio'}
                      checked={opt.isCorrect}
                      onChange={e => {
                        if (!q.isMultiple) {
                          q.options.forEach(o => onUpdateOption(q.id, o.id, { isCorrect: false }))
                        }
                        onUpdateOption(q.id, opt.id, { isCorrect: e.target.checked })
                      }}
                      className="h-4 w-4 shrink-0 text-primary"
                      name={`q-${q.id}`}
                    />
                    <Input
                      value={opt.text}
                      onChange={e => onUpdateOption(q.id, opt.id, { text: e.target.value })}
                      placeholder={t('optionPh', { n: q.options.indexOf(opt) + 1 })}
                      className="flex-1 text-sm"
                    />
                    {q.options.length > 2 ? (
                      <button
                        onClick={() => onRemoveOption(q.id, opt.id)}
                        type="button"
                        className="text-muted-foreground hover:text-red-500"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    ) : null}
                  </div>
                ))}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onAddOption(q.id)}
                  type="button"
                  className="text-xs"
                >
                  <Plus className="mr-1 h-3 w-3" />
                  {t('addOption')}
                </Button>
              </div>
            </div>
          ))}
        </div>
        <Button variant="outline" size="sm" onClick={onAddQuestion} type="button" className="mt-3 w-full">
          <Plus className="mr-1 h-3 w-3" />
          {t('addQuestion')}
        </Button>
      </div>
    </div>
  )
}
