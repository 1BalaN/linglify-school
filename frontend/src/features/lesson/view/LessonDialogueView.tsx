import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { MessageCircle, User } from 'lucide-react'
import { Button } from '@/shared/ui'
import type { Question, QuestionOption, Answer } from '@/shared/types/course'
import { useSubmitAnswerMutation } from '@/entities/lesson'

interface LessonDialogueViewProps {
  questions: Question[]
  onComplete: (score: number) => void
  initialCompleted?: boolean
  initialScore?: number | null
  initialAnswers?: Record<string, Answer> | null
}

interface DialogueStepResult {
  questionId: string
  isCorrect: boolean
  userAnswerIds: string[]
}

function buildInitialDialogueState(
  steps: Question[],
  initialCompleted?: boolean,
  initialScore?: number | null,
  initialAnswers?: Record<string, Answer> | null,
) {
  const results: DialogueStepResult[] = []

  if (initialCompleted && initialAnswers) {
    for (const step of steps) {
      const ans = initialAnswers[step.id]
      if (!ans) continue

      const answerId =
        typeof ans.answer === 'string'
          ? ans.answer
          : Array.isArray(ans.answer) && ans.answer.length > 0
            ? String(ans.answer[0])
            : ''

      if (!answerId) continue

      const options = step.options as QuestionOption[]
      const correctOpt = options.find(o => o.isCorrect)
      const isCorrect = !!correctOpt && correctOpt.id === answerId

      results.push({
        questionId: step.id,
        isCorrect,
        userAnswerIds: [answerId],
      })
    }
  }

  const finished = initialCompleted && results.length > 0
  const score =
    finished && typeof initialScore === 'number'
      ? initialScore
      : 0

  return {
    currentIndex: finished ? steps.length : 0,
    results,
    finished,
    score,
  }
}

export const LessonDialogueView = ({
  questions,
  onComplete,
  initialCompleted,
  initialScore,
  initialAnswers,
}: LessonDialogueViewProps) => {
  const { t } = useTranslation('platform', { keyPrefix: 'lessonTaking.dialogue' })
  const steps = questions
    .filter(q => q.type === 'SINGLE_CHOICE')
    .sort((a, b) => a.order - b.order)

  const initialState = buildInitialDialogueState(
    steps,
    initialCompleted,
    initialScore,
    initialAnswers,
  )

  const [currentIndex, setCurrentIndex] = useState(initialState.currentIndex)
  const [results, setResults] = useState<DialogueStepResult[]>(initialState.results)
  const [finished, setFinished] = useState(initialState.finished)
  const [score, setScore] = useState(initialState.score)
  const historyRef = useRef<HTMLDivElement | null>(null)
  const [submitAnswer] = useSubmitAnswerMutation()

  const noSteps = steps.length === 0

  const currentStep = finished ? null : steps[currentIndex]

  const handleAnswer = (step: Question, optionId: string) => {
    if (finished) return

    const options = step.options as QuestionOption[]
    const correctOpt = options.find(o => o.isCorrect)
    const isCorrect = !!correctOpt && correctOpt.id === optionId

    // Persist selected answer
    submitAnswer({ questionId: step.id, answer: optionId }).catch(() => {})

    const nextResults: DialogueStepResult[] = [
      ...results,
      {
        questionId: step.id,
        isCorrect,
        userAnswerIds: [optionId],
      },
    ]
    setResults(nextResults)

    const nextIndex = currentIndex + 1
    if (nextIndex >= steps.length) {
      const correctCount = nextResults.filter(r => r.isCorrect).length
      const newScore = steps.length > 0 ? Math.round((correctCount / steps.length) * 100) : 0
      setScore(newScore)
      setFinished(true)
      if (newScore >= 60) {
        onComplete(newScore)
      }
    } else {
      setCurrentIndex(nextIndex)
    }
  }

  const handleRetryAll = () => {
    setCurrentIndex(0)
    setResults([])
    setFinished(false)
    setScore(0)
  }

  const getResultFor = (id: string) => results.find(r => r.questionId === id)

  const correctCount = results.filter(r => r.isCorrect).length

  useEffect(() => {
    if (!historyRef.current) return
    historyRef.current.scrollTo({
      top: historyRef.current.scrollHeight,
      behavior: 'smooth',
    })
  }, [results, finished])

  if (noSteps) {
    return (
      <div className="rounded-2xl border border-border bg-card p-8 text-center text-muted-foreground">
        {t('notConfigured')}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-sky-50 px-4 py-3 text-xs text-sky-800 dark:bg-sky-950/40 dark:text-sky-200">
        <span>
          {t('lineProgress', {
            current: Math.min(currentIndex + 1, steps.length),
            total: steps.length,
          })}
        </span>
        <span>
          {t('correctLine')} <span className="font-semibold">{correctCount}</span>
        </span>
      </div>

      {/* Summary after completion */}
      {finished && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-center dark:border-emerald-900/30 dark:bg-emerald-950/20">
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-300">
            {t('finished')}
          </p>
          <p className="mt-1 text-3xl font-bold text-primary">{score}%</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {t('scoreLine', {
              correct: results.filter(r => r.isCorrect).length,
              total: steps.length,
            })}
          </p>
          <div className="mt-3 flex flex-wrap justify-center gap-2">
            <Button variant="ghost" size="sm" onClick={handleRetryAll}>
              {t('retry')}
            </Button>
          </div>
        </div>
      )}

      {/* Dialogue history */}
      <div
        ref={historyRef}
        className="space-y-3 rounded-2xl border border-border bg-card/60 p-4 max-h-[420px] overflow-y-auto scroll-soft"
      >
        {steps.slice(0, finished ? steps.length : currentIndex).map(step => {
          const options = step.options as QuestionOption[]
          const res = getResultFor(step.id)
          const userOption = res
            ? options.find(o => res.userAnswerIds.includes(o.id))
            : null
          const correctOption = options.find(o => o.isCorrect)

          return (
            <div key={step.id} className="space-y-2 rounded-2xl border border-border bg-card p-4">
              {/* Partner line */}
              <div className="flex items-start gap-2">
                <div className="mt-1 flex h-7 w-7 items-center justify-center rounded-full bg-muted">
                  <MessageCircle className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <div className="inline-block max-w-[80%] rounded-2xl bg-muted px-3 py-2 text-sm text-foreground">
                    {step.question}
                  </div>
                </div>
              </div>

              {/* Student reply */}
              {res && (
                <div className="flex items-start justify-end gap-2">
                  <div className="flex-1 text-right">
                    <div
                      className={`inline-block max-w-[80%] rounded-2xl px-3 py-2 text-sm ${
                        res.isCorrect
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200'
                          : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200'
                      }`}
                    >
                      {userOption ? userOption.text : '—'}
                    </div>
                    {!res.isCorrect && correctOption && (
                      <div className="mt-1 text-xs text-muted-foreground">
                        {t('correctWas')} <span className="font-medium">{correctOption.text}</span>
                      </div>
                    )}
                  </div>
                  <div className="mt-1 flex h-7 w-7 items-center justify-center rounded-full bg-primary/10">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Active step */}
      {currentStep && !finished && (
        <div className="space-y-3 rounded-2xl border border-primary/20 bg-primary/5 p-4">
          <div className="flex items-start gap-2">
            <div className="mt-1 flex h-7 w-7 items-center justify-center rounded-full bg-primary/10">
              <MessageCircle className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">{currentStep.question}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {t('pickReply')}
              </p>
            </div>
          </div>
          <div className="space-y-2">
            {(currentStep.options as QuestionOption[]).map((opt, idx) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => handleAnswer(currentStep, opt.id)}
                className="flex w-full items-center justify-between rounded-xl border border-border bg-background px-3 py-2 text-left text-sm font-medium transition-all hover:-translate-y-0.5 hover:border-primary/50 hover:bg-primary/5"
              >
                <span className="mr-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs text-primary">
                  {String.fromCharCode(65 + idx)}
                </span>
                <span className="flex-1">{opt.text}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

