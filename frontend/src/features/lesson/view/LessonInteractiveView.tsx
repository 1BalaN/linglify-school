import { useState } from 'react'
import { MessageSquare, RefreshCw } from 'lucide-react'
import { Button } from '@/shared/ui'
import type { Question, QuestionOption } from '@/shared/types/course'

interface FillBlankState {
  answers: Record<string, string>
  submitted: boolean
  results: Record<string, boolean>
  score: number
}

interface LessonInteractiveViewProps {
  questions: Question[]
  onComplete: (score: number) => void
}

export const LessonInteractiveView = ({ questions, onComplete }: LessonInteractiveViewProps) => {
  const [state, setState] = useState<FillBlankState>({
    answers: {},
    submitted: false,
    results: {},
    score: 0,
  })

  const handleInput = (id: string, value: string) => {
    if (state.submitted) return
    setState(prev => ({ ...prev, answers: { ...prev.answers, [id]: value } }))
  }

  const handleSubmit = () => {
    const results: Record<string, boolean> = {}
    let correct = 0
    for (const q of questions) {
      const options = q.options as QuestionOption[]
      const correctOpt = options.find(o => o.isCorrect)
      const userAnswer = (state.answers[q.id] || '').trim().toLowerCase()
      const correctAnswer = (correctOpt?.text || '').trim().toLowerCase()
      const isCorrect = userAnswer === correctAnswer
      results[q.id] = isCorrect
      if (isCorrect) correct++
    }
    const score = questions.length > 0 ? Math.round((correct / questions.length) * 100) : 0
    setState(prev => ({ ...prev, submitted: true, results, score }))
    if (score >= 60) onComplete(score)
  }

  const handleRetry = () => {
    setState({ answers: {}, submitted: false, results: {}, score: 0 })
  }

  return (
    <div className="space-y-6">
      {state.submitted && (
        <div
          className={`rounded-xl border p-4 text-center ${
            state.score >= 60
              ? 'border-emerald-200 bg-emerald-50 dark:border-emerald-900/30 dark:bg-emerald-950/20'
              : 'border-red-200 bg-red-50 dark:border-red-900/30 dark:bg-red-950/20'
          }`}
        >
          <p className="text-2xl font-bold text-primary">{state.score}%</p>
          <p className="text-sm text-muted-foreground">
            {Object.values(state.results).filter(Boolean).length} из {questions.length} верно
          </p>
          {state.score < 60 && (
            <Button className="mt-3" variant="outline" size="sm" onClick={handleRetry}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Попробовать снова
            </Button>
          )}
        </div>
      )}

      {questions.map((q, i) => {
        const parts = q.question.split('___')
        const isCorrect = state.submitted ? state.results[q.id] : null

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
            <span className="mb-3 inline-block rounded-full bg-purple-500/10 px-2.5 py-0.5 text-xs font-medium text-purple-700 dark:text-purple-400">
              Упражнение {i + 1}
            </span>
            <div className="flex flex-wrap items-center gap-x-1 gap-y-2 text-base leading-loose">
              {parts.map((part, pi) => (
                <span key={pi} className="flex items-center gap-1">
                  <span className="text-foreground">{part}</span>
                  {pi < parts.length - 1 && (
                    <input
                      type="text"
                      value={state.answers[q.id] || ''}
                      onChange={e => handleInput(q.id, e.target.value)}
                      disabled={state.submitted}
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
            {state.submitted && (
              <div className="mt-3 text-sm">
                {isCorrect ? (
                  <span className="text-emerald-700 dark:text-emerald-400">✓ Верно!</span>
                ) : (
                  <span className="text-red-600 dark:text-red-400">✗ Неверно, попробуйте ещё раз</span>
                )}
                {q.explanation && isCorrect && (
                  <p className="mt-1 text-muted-foreground">{q.explanation}</p>
                )}
              </div>
            )}
          </div>
        )
      })}

      {!state.submitted && (
        <Button
          onClick={handleSubmit}
          size="lg"
          className="w-full"
          disabled={Object.keys(state.answers).length < questions.length}
        >
          <MessageSquare className="mr-2 h-5 w-5" />
          Проверить ответы
        </Button>
      )}
    </div>
  )
}

