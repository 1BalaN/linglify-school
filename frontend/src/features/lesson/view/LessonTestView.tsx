import { useState, useMemo, useEffect, useRef, useCallback } from 'react'
import { CheckCircle, RefreshCw, ClipboardCheck, CheckCircle2, CheckSquare, Timer } from 'lucide-react'
import { Button } from '@/shared/ui'
import type { Question, QuestionOption } from '@/shared/types/course'
import { getPassThresholdFromContent, getTestOptionsFromContent } from '@/shared/lib/lessonContent'

function shuffleArray<T>(arr: T[]): T[] {
  const out = [...arr]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

interface TestState {
  answers: Record<string, string | string[]>
  submitted: boolean
  score: number
  passed: boolean
}

interface LessonTestViewProps {
  questions: Question[]
  content: string | null
  onComplete: (score: number) => void
}

export const LessonTestView = ({ questions, content, onComplete }: LessonTestViewProps) => {
  const passThreshold = getPassThresholdFromContent(content)
  const { timeLimitMinutes, shuffleQuestions, shuffleOptions } = getTestOptionsFromContent(content)

  const displayQuestions = useMemo(() => {
    let list = [...questions]
    if (shuffleQuestions) list = shuffleArray(list)
    return list.map(q => ({
      ...q,
      options: shuffleOptions ? shuffleArray([...(q.options as QuestionOption[])]) : (q.options as QuestionOption[]),
    }))
  }, [questions, shuffleQuestions, shuffleOptions])

  const [state, setState] = useState<TestState>({
    answers: {},
    submitted: false,
    score: 0,
    passed: false,
  })

  const totalSeconds = timeLimitMinutes ? timeLimitMinutes * 60 : null
  const [secondsLeft, setSecondsLeft] = useState<number | null>(totalSeconds)
  const submittedByTimerRef = useRef(false)

  const computeScore = useCallback((answers: Record<string, string | string[]>) => {
    let correct = 0
    for (const q of displayQuestions) {
      const options = q.options as QuestionOption[]
      const userAnswer = answers[q.id]
      if (q.type === 'MULTIPLE_CHOICE') {
        const correctIds = options.filter(o => o.isCorrect).map(o => o.id).sort()
        const userIds = [...((userAnswer as string[]) || [])].sort()
        if (JSON.stringify(correctIds) === JSON.stringify(userIds)) correct++
      } else {
        const correctOpt = options.find(o => o.isCorrect)
        if (correctOpt && userAnswer === correctOpt.id) correct++
      }
    }
    return displayQuestions.length > 0 ? Math.round((correct / displayQuestions.length) * 100) : 0
  }, [displayQuestions])


  useEffect(() => {
    if (submittedByTimerRef.current && state.submitted && state.passed) {
      submittedByTimerRef.current = false
      onComplete(state.score)
    }
  }, [state.submitted, state.passed, state.score, onComplete])

  useEffect(() => {
    if (state.submitted || totalSeconds == null || totalSeconds <= 0) return
    const t = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev == null || prev <= 1) {
          clearInterval(t)
          submittedByTimerRef.current = true
          setState(prevState => {
            const score = computeScore(prevState.answers)
            const passed = score >= passThreshold
            return { ...prevState, submitted: true, score, passed }
          })
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(t)
  }, [state.submitted, totalSeconds, passThreshold, computeScore])

  function handleSubmit() {
    const score = computeScore(state.answers)
    const passed = score >= passThreshold
    setState(prev => ({ ...prev, submitted: true, score, passed }))
    if (passed) onComplete(score)
  }

  const handleAnswer = (questionId: string, value: string, isMultiple: boolean) => {
    if (state.submitted) return
    setState(prev => {
      if (isMultiple) {
        const existing = (prev.answers[questionId] as string[]) || []
        const updated = existing.includes(value)
          ? existing.filter(v => v !== value)
          : [...existing, value]
        return { ...prev, answers: { ...prev.answers, [questionId]: updated } }
      }
      return { ...prev, answers: { ...prev.answers, [questionId]: value } }
    })
  }

  const handleRetry = () => {
    submittedByTimerRef.current = false
    setSecondsLeft(totalSeconds)
    setState({ answers: {}, submitted: false, score: 0, passed: false })
  }

  if (state.submitted) {
    return (
      <div className="rounded-2xl border bg-card p-8 text-center shadow-sm">
        <div
          className={`mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full ${
            state.passed ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'
          }`}
        >
          {state.passed ? (
            <CheckCircle className="h-10 w-10" />
          ) : (
            <RefreshCw className="h-10 w-10" />
          )}
        </div>
        <h3 className="mb-2 text-2xl font-bold text-foreground">
          {state.passed ? 'Тест пройден!' : 'Не пройден'}
        </h3>
        <p className="mb-1 text-4xl font-bold text-primary">{state.score}%</p>
        <p className="mb-6 text-sm text-muted-foreground">Порог прохождения: {passThreshold}%</p>

        {/* Answer review: ✓/✗ и объяснение после ответа */}
        <div className="mb-6 space-y-2 text-left">
          {displayQuestions.map((q, i) => {
            const options = q.options as QuestionOption[]
            const userAnswer = state.answers[q.id]
            let isCorrect = false
            if (q.type === 'MULTIPLE_CHOICE') {
              const correctIds = options.filter(o => o.isCorrect).map(o => o.id).sort()
              const userIds = [...((userAnswer as string[]) || [])].sort()
              isCorrect = JSON.stringify(correctIds) === JSON.stringify(userIds)
            } else {
              const correctOpt = options.find(o => o.isCorrect)
              isCorrect = !!correctOpt && userAnswer === correctOpt.id
            }
            return (
              <div
                key={q.id}
                className={`rounded-xl border px-4 py-2.5 text-sm ${
                  isCorrect
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/30 dark:bg-emerald-950/20 dark:text-emerald-300'
                    : 'border-red-200 bg-red-50 text-red-800 dark:border-red-900/30 dark:bg-red-950/20 dark:text-red-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="shrink-0 text-base">{isCorrect ? '✓' : '✗'}</span>
                  <span className="font-medium">
                    {i + 1}. {q.question}
                  </span>
                </div>
                {state.passed && !isCorrect && q.explanation && (
                  <p className="mt-2 border-t border-current/20 pt-2 text-xs opacity-90">
                    {q.explanation}
                  </p>
                )}
              </div>
            )
          })}
        </div>

        {!state.passed && (
          <Button onClick={handleRetry} variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Пройти ещё раз
          </Button>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-amber-50 px-4 py-3 dark:bg-amber-950/20">
        <span className="text-sm font-medium text-amber-700 dark:text-amber-400">
          {displayQuestions.length} вопросов · порог {passThreshold}%
        </span>
        <div className="flex items-center gap-3">
          {secondsLeft != null && (
            <span className="flex items-center gap-1 text-sm font-medium text-amber-700 dark:text-amber-400">
              <Timer className="h-4 w-4" />
              {Math.floor(secondsLeft / 60)}:{(secondsLeft % 60).toString().padStart(2, '0')}
            </span>
          )}
          <span className="text-sm text-muted-foreground">
            Отвечено: {Object.keys(state.answers).length} / {displayQuestions.length}
          </span>
        </div>
      </div>

      {displayQuestions.map((q, i) => {
        const options = q.options as QuestionOption[]
        const isMultiple = q.type === 'MULTIPLE_CHOICE'
        const userAnswer = state.answers[q.id]

        return (
          <div key={q.id} className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <div className="mb-4">
              <span className="mb-2 inline-block rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                Вопрос {i + 1}
              </span>
              <p className="text-base font-medium text-foreground">{q.question}</p>
            </div>
            <div className="space-y-2">
              {options.map(opt => {
                const selected = isMultiple
                  ? ((userAnswer as string[]) || []).includes(opt.id)
                  : userAnswer === opt.id
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleAnswer(q.id, opt.id, isMultiple)}
                    className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm transition-all ${
                      selected
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border bg-background text-foreground hover:border-primary/40 hover:bg-primary/5'
                    }`}
                  >
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center">
                      {isMultiple ? (
                        selected ? (
                          <CheckSquare className="h-5 w-5 text-primary" />
                        ) : (
                          <div className="h-5 w-5 rounded-md border-2 border-muted-foreground/40" />
                        )
                      ) : selected ? (
                        <CheckCircle2 className="h-5 w-5 text-primary" />
                      ) : (
                        <div className="h-5 w-5 rounded-full border-2 border-muted-foreground/40" />
                      )}
                    </span>
                    {opt.text}
                  </button>
                )
              })}
            </div>
          </div>
        )
      })}

      <Button
        onClick={handleSubmit}
        size="lg"
        className="w-full"
        disabled={Object.keys(state.answers).length < displayQuestions.length}
      >
        <ClipboardCheck className="mr-2 h-5 w-5" />
        Отправить ответы
      </Button>
    </div>
  )
}

