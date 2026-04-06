import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { MessageSquare, RefreshCw, Lightbulb } from 'lucide-react'
import { Button } from '@/shared/ui'
import type { Question, QuestionOption, Answer } from '@/shared/types/course'
import { useSubmitAnswerMutation } from '@/entities/lesson'

type OptionWithBlank = QuestionOption & { blankIndex?: number }

function getCorrectTextsByBlank(options: OptionWithBlank[]): Record<number, string[]> {
  const byBlank: Record<number, string[]> = {}
  options
    .filter(o => o.isCorrect && o.text?.trim())
    .forEach(o => {
      const bi = o.blankIndex ?? 0
      if (!byBlank[bi]) byBlank[bi] = []
      byBlank[bi].push((o.text || '').trim().toLowerCase())
    })
  return byBlank
}

function countBlanks(questionText: string): number {
  const parts = questionText.split('___')
  return Math.max(0, parts.length - 1)
}

function isExerciseCorrect(
  q: Question,
  answers: Record<string, string>,
  correctByBlank: Record<number, string[]>
): boolean {
  const n = countBlanks(q.question)
  if (n === 0) return true
  for (let bi = 0; bi < n; bi++) {
    const key = `${q.id}_${bi}`
    const user = (answers[key] || '').trim().toLowerCase()
    const correct = correctByBlank[bi] || []
    if (!correct.length || !correct.some(c => c === user)) return false
  }
  return true
}

function countRequiredAnswers(questions: Question[]): number {
  return questions.reduce((sum, q) => sum + Math.max(1, countBlanks(q.question)), 0)
}

function buildInitialInteractiveState(
  questions: Question[],
  initialCompleted?: boolean,
  initialScore?: number | null,
  initialAnswers?: Record<string, Answer> | null,
) {
  const answers: Record<string, string> = {}
  const cumulativeResults: Record<string, boolean> = {}

  if (initialCompleted && initialAnswers) {
    for (const q of questions) {
      const ans = initialAnswers[q.id]
      if (!ans) continue

      // Interactive answers: array of values per blank
      if (Array.isArray(ans.answer)) {
        (ans.answer as string[]).forEach((val, idx) => {
          answers[`${q.id}_${idx}`] = String(val ?? '')
        })
      } else if (typeof ans.answer === 'string') {
        answers[`${q.id}_0`] = ans.answer
      }

      const correctByBlank = getCorrectTextsByBlank((q.options || []) as OptionWithBlank[])
      cumulativeResults[q.id] = isExerciseCorrect(q, answers, correctByBlank)
    }
  }

  const score =
    initialCompleted && typeof initialScore === 'number'
      ? initialScore
      : 0

  return {
    answers,
    cumulativeResults,
    submitted: !!initialCompleted && Object.keys(answers).length > 0,
    score,
  }
}

interface LessonInteractiveViewProps {
  questions: Question[]
  onComplete: (score: number) => void
  initialCompleted?: boolean
  initialScore?: number | null
  initialAnswers?: Record<string, Answer> | null
}

export const LessonInteractiveView = ({
  questions,
  onComplete,
  initialCompleted,
  initialScore,
  initialAnswers,
}: LessonInteractiveViewProps) => {
  const { t } = useTranslation('platform', { keyPrefix: 'lessonTaking.interactive' })
  const initialState = buildInitialInteractiveState(
    questions,
    initialCompleted,
    initialScore,
    initialAnswers,
  )

  const [phase, setPhase] = useState<'first' | 'retry'>('first')
  const [displayedQuestions, setDisplayedQuestions] = useState<Question[]>(questions)
  const [cumulativeResults, setCumulativeResults] = useState<Record<string, boolean>>(
    initialState.cumulativeResults,
  )
  const [answers, setAnswers] = useState<Record<string, string>>(initialState.answers)
  const [submitted, setSubmitted] = useState(initialState.submitted)
  const [score, setScore] = useState(initialState.score)
  const [hintsRevealed, setHintsRevealed] = useState<Record<string, boolean>>({})
  const [submitAnswer] = useSubmitAnswerMutation()

  const totalQuestions = questions.length
  const requiredAnswerCount = countRequiredAnswers(displayedQuestions)

  const handleInput = (key: string, value: string) => {
    if (submitted) return
    setAnswers(prev => ({ ...prev, [key]: value }))
  }

  const handleSubmit = () => {
    const optionsList = displayedQuestions.map(q => ({
      q,
      options: (q.options || []) as OptionWithBlank[],
    }))
    const results: Record<string, boolean> = {}
    for (const { q, options } of optionsList) {
      const correctByBlank = getCorrectTextsByBlank(options)
      results[q.id] = isExerciseCorrect(q, answers, correctByBlank)
    }

    // Persist answers per question
    questions.forEach(q => {
      const blanksCount = countBlanks(q.question)
      if (blanksCount === 0) return
      const values: string[] = []
      for (let bi = 0; bi < blanksCount; bi++) {
        values.push(answers[`${q.id}_${bi}`] ?? '')
      }
      submitAnswer({ questionId: q.id, answer: values }).catch(() => {})
    })

    if (phase === 'first') {
      setCumulativeResults(results)
      setSubmitted(true)
      const correctCount = Object.values(results).filter(Boolean).length
      const newScore = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0
      setScore(newScore)
      if (newScore >= 60) {
        onComplete(newScore)
      }
      return
    }

    const merged = { ...cumulativeResults, ...results }
    setCumulativeResults(merged)
    const correctCount = Object.values(merged).filter(Boolean).length
    const newScore = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0
    setScore(newScore)
    setSubmitted(true)
    if (newScore >= 60) {
      onComplete(newScore)
    }
  }

  const handleRetryWrong = () => {
    const wrong = questions.filter(q => !cumulativeResults[q.id])
    setDisplayedQuestions(wrong)
    setPhase('retry')
    setSubmitted(false)
    setAnswers({})
  }

  const handleRetryAll = () => {
    setDisplayedQuestions(questions)
    setPhase('first')
    setCumulativeResults({})
    setAnswers({})
    setSubmitted(false)
    setScore(0)
    setHintsRevealed({})
  }

  const toggleHint = (questionId: string) => {
    setHintsRevealed(prev => ({ 
      ...prev, 
      [questionId]: !prev[questionId]
    }))
  }

  const hasEnoughAnswers =
    Object.keys(answers).length >= requiredAnswerCount &&
    displayedQuestions.every(q => {
      const n = Math.max(1, countBlanks(q.question))
      for (let bi = 0; bi < n; bi++) {
        if (!(answers[`${q.id}_${bi}`] ?? '').trim()) return false
      }
      return true
    })

  if (initialCompleted && !submitted) {
    // safeguard; submitted is usually already true here
  }

  if (submitted && initialCompleted && Object.keys(cumulativeResults).length === 0) {
    // Review-only: show result and retry
    return (
      <div className="space-y-6">
        <div
          className={`rounded-xl border p-4 text-center ${
            score >= 60
              ? 'border-emerald-200 bg-emerald-50 dark:border-emerald-900/30 dark:bg-emerald-950/20'
              : 'border-red-200 bg-red-50 dark:border-red-900/30 dark:bg-red-950/20'
          }`}
        >
          <p className="text-2xl font-bold text-primary">{score}%</p>
          <p className="text-sm text-muted-foreground">{t('alreadyDone')}</p>
          <div className="mt-3 flex flex-wrap justify-center gap-2">
            <Button variant="outline" size="sm" onClick={handleRetryAll}>
              <RefreshCw className="mr-2 h-4 w-4" />
              {t('retry')}
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {submitted && (
        <div
          className={`rounded-xl border p-4 text-center ${
            score >= 60
              ? 'border-emerald-200 bg-emerald-50 dark:border-emerald-900/30 dark:bg-emerald-950/20'
              : 'border-red-200 bg-red-50 dark:border-red-900/30 dark:bg-red-950/20'
          }`}
        >
          <p className="text-2xl font-bold text-primary">{score}%</p>
          <p className="text-sm text-muted-foreground">
            {t('scoreLine', {
              correct: Object.values(cumulativeResults).filter(Boolean).length,
              total: totalQuestions,
            })}
          </p>
          <div className="mt-3 flex flex-wrap justify-center gap-2">
            {score < 60 && (
              <Button variant="outline" size="sm" onClick={handleRetryWrong}>
                <RefreshCw className="mr-2 h-4 w-4" />
                {t('retryWrongOnly', {
                  count: questions.filter(q => !cumulativeResults[q.id]).length,
                })}
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={handleRetryAll}>
              {t('retryAll')}
            </Button>
          </div>
        </div>
      )}

      {displayedQuestions.map((q, i) => {
        const parts = q.question.split('___')
        const isCorrect = submitted ? cumulativeResults[q.id] : null

        return (
          <div
            key={q.id}
            className={`rounded-2xl border p-6 transition-all ${
              isCorrect === true
                ? 'border-emerald-300 bg-emerald-50 dark:border-emerald-700/40 dark:bg-emerald-950/20'
                : isCorrect === false
                  ? 'border-red-300 bg-red-50 dark:border-red-700/40 dark:bg-red-950/20'
                  : 'border-border bg-card'
            }`}
          >
            <div className="mb-3 flex items-center gap-2">
              <span className="rounded-full bg-purple-500/10 px-2.5 py-0.5 text-xs font-medium text-purple-700 dark:text-purple-400">
                {t('exerciseN', { n: i + 1 })}
              </span>
              {q.explanation && !submitted && (
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => toggleHint(q.id)}
                    className={`rounded-full p-1 transition ${
                      hintsRevealed[q.id]
                        ? 'bg-amber-200 text-amber-700 dark:bg-amber-900/40'
                        : 'text-amber-600 hover:bg-amber-100 dark:text-amber-400 dark:hover:bg-amber-900/30'
                    }`}
                    aria-label={t('hintAria')}
                  >
                    <Lightbulb className="h-4 w-4" />
                  </button>
                  <div
                    className={`
                      absolute left-full top-1/2 ml-3 -translate-y-1/2
                      z-30 w-64 rounded-lg bg-amber-50 p-3 text-sm text-amber-800 shadow-xl
                      transition-all duration-200
                      ${hintsRevealed[q.id]
                        ? 'opacity-100 scale-100'
                        : 'pointer-events-none opacity-0 scale-95'}
                      dark:bg-amber-950/90 dark:text-amber-200
                    `}
                  >
                    <div className="flex gap-2">
                      <span>{q.explanation}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-x-1 gap-y-2 text-base leading-loose">
              {parts.map((part, pi) => (
                <span key={pi} className="flex items-center gap-1">
                  <span className="text-foreground">{part}</span>
                  {pi < parts.length - 1 && (
                    <input
                      type="text"
                      value={answers[`${q.id}_${pi}`] || ''}
                      onChange={e => handleInput(`${q.id}_${pi}`, e.target.value)}
                      disabled={submitted}
                      className={`inline-block w-28 rounded-lg border-b-2 border-primary bg-transparent px-2 py-0.5 text-center text-sm font-medium outline-none focus:border-primary ${
                        isCorrect === true
                          ? 'text-emerald-700 dark:text-emerald-400'
                          : isCorrect === false
                            ? 'text-red-600 dark:text-red-400'
                            : 'text-foreground'
                      }`}
                      placeholder="..."
                    />
                  )}
                </span>
              ))}
            </div>
            {submitted && (
              <div className="mt-3 text-sm">
                {isCorrect ? (
                  <span className="text-emerald-700 dark:text-emerald-400">{t('correct')}</span>
                ) : (
                  <span className="text-red-600 dark:text-red-400">{t('wrong')}</span>
                )}
                {q.explanation && (
                  <p className="mt-1 text-muted-foreground">{q.explanation}</p>
                )}
              </div>
            )}
          </div>
        )
      })}

      {!submitted && (
        <Button
          onClick={handleSubmit}
          size="lg"
          className="w-full"
          disabled={!hasEnoughAnswers}
        >
          <MessageSquare className="mr-2 h-5 w-5" />
          {t('check')}
        </Button>
      )}
    </div>
  )
}
