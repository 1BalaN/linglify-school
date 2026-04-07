import { useTranslation } from 'react-i18next'
import type { PlacementQuestion } from '@/shared/types/placement'
import { Button } from '@/shared/ui'
import { Loader2, Volume2 } from 'lucide-react'
import AudioPlayer from 'react-h5-audio-player'
import 'react-h5-audio-player/lib/styles.css'

interface PlacementInProgressStepProps {
  question: PlacementQuestion
  questionIndex: number
  maxQuestions: number
  selectedOption: number | null
  submitting: boolean
  onSelectOption: (index: number) => void
  onSubmit: () => void
}

export const PlacementInProgressStep = ({
  question,
  questionIndex,
  maxQuestions,
  selectedOption,
  submitting,
  onSelectOption,
  onSubmit,
}: PlacementInProgressStepProps) => {
  const { t } = useTranslation('platform', { keyPrefix: 'placement.inProgress' })

  const skillLabel = (type: string) => {
    if (type === 'GRAMMAR') return t('skillGrammar')
    if (type === 'VOCAB') return t('skillLexical')
    if (type === 'READING') return t('skillReading')
    return t('skillListening')
  }

  const progressPercent =
    !maxQuestions || !questionIndex
      ? 0
      : Math.round((questionIndex / maxQuestions) * 100)

  return (
    <div className="glass-card rounded-2xl p-6 backdrop-blur-xl space-y-6">
      <div className="flex items-center justify-between">
        <div className="text-xs text-muted-foreground">
          {t('questionOf', { current: questionIndex, total: maxQuestions })}
        </div>
        <div className="h-2 w-40 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full bg-gradient-to-r from-cyan-500 to-blue-600 transition-all"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      <div className="space-y-3">
        <div className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
          {skillLabel(question.type)}
        </div>

        {question.context && (
          <div className="rounded-xl bg-muted/60 px-4 py-3 text-sm text-muted-foreground">
            {question.context}
          </div>
        )}

        <h2 className="text-lg font-semibold text-foreground">
          {question.prompt}
        </h2>

        {question.mediaUrl && (
          <div className="flex items-center gap-3 rounded-lg bg-primary/5 px-3 py-2 text-sm">
            <Volume2 className="h-4 w-4 text-primary" />
            <AudioPlayer
              src={question.mediaUrl}
              className="w-full max-w-xs rounded-lg overflow-hidden shadow-sm"
              showJumpControls={false}
              autoPlayAfterSrcChange={false}
              customAdditionalControls={[]}
              customVolumeControls={[]}
              layout="horizontal"
            />
          </div>
        )}
      </div>

      <div className="space-y-3">
        {question.options.map((option, index) => (
          <button
            key={index}
            type="button"
            onClick={() => onSelectOption(index)}
            className={`w-full rounded-xl border px-4 py-3 text-left text-sm transition-all ${
              selectedOption === index
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border bg-background/60 hover:border-primary/40 hover:bg-primary/5'
            }`}
          >
            {option}
          </button>
        ))}
      </div>

      <p className="text-[11px] text-muted-foreground">{t('singleChoiceHint')}</p>

      <div className="flex justify-end">
        <Button
          onClick={onSubmit}
          disabled={selectedOption === null || submitting}
        >
          {submitting && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          {questionIndex === maxQuestions ? t('finish') : t('next')}
        </Button>
      </div>
    </div>
  )
}

