import { useMemo, useState } from 'react'
import { RefreshCw, BookOpen } from 'lucide-react'
import { Button } from '@/shared/ui'
import type { Question, QuestionOption } from '@/shared/types/course'

interface LessonLexicalViewProps {
  questions: Question[]
  onComplete: (score: number) => void
  initialCompleted?: boolean
  initialScore?: number | null
}

interface LexicalPair {
  id: string        // questionId
  term: string
  translation: string
  allTranslations: string[]
}

type CardKind = 'term' | 'translation'

interface Card {
  id: string
  pairId: string
  kind: CardKind
  label: string
}

function buildPairs(questions: Question[]): LexicalPair[] {
  return questions
    .map(q => {
      const options = (q.options || []) as QuestionOption[]
      const correct = options
        .filter(o => o.isCorrect && o.text?.trim())
        .map(o => o.text.trim())
      const mainTranslation = correct[0]

      if (!q.question.trim() || !mainTranslation) return null

      return {
        id: q.id,
        term: q.question.trim(),
        translation: mainTranslation,
        allTranslations: correct,
      } as LexicalPair
    })
    .filter((p): p is LexicalPair => !!p)
}

function shuffle<T>(arr: T[]): T[] {
  const out = [...arr]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

export const LessonLexicalView = ({
  questions,
  onComplete,
  initialCompleted,
  initialScore,
}: LessonLexicalViewProps) => {
  const pairs = useMemo(() => buildPairs(questions), [questions])

  const [cards, setCards] = useState<Card[]>(() => {
    const initial: Card[] = []
    for (const p of buildPairs(questions)) {
      initial.push(
        { id: `${p.id}-term`, pairId: p.id, kind: 'term', label: p.term },
        { id: `${p.id}-translation`, pairId: p.id, kind: 'translation', label: p.translation },
      )
    }
    return shuffle(initial)
  })
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null)
  const [matchedCardIds, setMatchedCardIds] = useState<Set<string>>(new Set())
  const [submitted, setSubmitted] = useState(!!initialCompleted)
  const [score, setScore] = useState(
    initialCompleted && typeof initialScore === 'number' ? initialScore : 0,
  )
  const [reviewMode, setReviewMode] = useState(!!initialCompleted)

  const totalPairs = pairs.length

  const resetGame = () => {
    const nextCards: Card[] = []
    for (const p of pairs) {
      nextCards.push(
        { id: `${p.id}-term`, pairId: p.id, kind: 'term', label: p.term },
        { id: `${p.id}-translation`, pairId: p.id, kind: 'translation', label: p.translation },
      )
    }
    setCards(shuffle(nextCards))
    setSelectedCardId(null)
    setMatchedCardIds(new Set())
    setSubmitted(false)
    setScore(0)
    setReviewMode(false)
  }

  const handleCardClick = (card: Card) => {
    if (submitted) return
    if (matchedCardIds.has(card.id)) return

    if (!selectedCardId) {
      setSelectedCardId(card.id)
      return
    }

    if (selectedCardId === card.id) return

    const first = cards.find(c => c.id === selectedCardId)
    if (!first) {
      setSelectedCardId(card.id)
      return
    }

    // Проверяем совпадение пары: одно слово + один перевод, общий pairId
    if (first.pairId === card.pairId && first.kind !== card.kind) {
      const nextMatched = new Set(matchedCardIds)
      nextMatched.add(first.id)
      nextMatched.add(card.id)
      setMatchedCardIds(nextMatched)
      setSelectedCardId(null)

      const matchedPairsCount = nextMatched.size / 2
      if (matchedPairsCount === totalPairs && totalPairs > 0) {
        const finalScore = 100
        setSubmitted(true)
        setScore(finalScore)
        onComplete(finalScore)
      }
    } else {
      // Не совпало — просто снимаем выделение, без задержек
      setSelectedCardId(null)
    }
  }

  return (
    <div className="space-y-6">
      {totalPairs > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-sky-50 px-4 py-3 text-xs text-sky-800 dark:bg-sky-950/30 dark:text-sky-200">
          <span>
            Пар для сопоставления: <span className="font-semibold">{totalPairs}</span>
          </span>
          <span>
            Найдено:{' '}
            <span className="font-semibold">
              {matchedCardIds.size / 2} / {totalPairs}
            </span>
          </span>
        </div>
      )}

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
            {totalPairs} из {totalPairs} пар сопоставлено верно
          </p>
          <div className="mt-3 flex flex-wrap justify-center gap-2">
            <Button variant="outline" size="sm" onClick={resetGame}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Пройти заново
            </Button>
          </div>
        </div>
      )}

      {totalPairs === 0 && (
        <div className="rounded-2xl border border-border bg-card p-8 text-center text-muted-foreground">
          Слова для тренажёра ещё не добавлены
        </div>
      )}

      {totalPairs > 0 && (
        <>
          {!reviewMode && (
            <div className="space-y-3">
            <div className="rounded-2xl border border-border bg-card p-4">
              <div className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
                <BookOpen className="h-4 w-4" />
                <span>Соотнесите слова и переводы</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Нажмите сначала на слово слева, затем на соответствующий перевод справа. Правильные пары подсвечиваются зелёным.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-sky-700 dark:text-sky-300">
                  Слова
                </p>
                <div className="space-y-2">
                  {cards
                    .filter(card => card.kind === 'term')
                    .map(card => {
                      const isMatched = matchedCardIds.has(card.id)
                      const isSelected = selectedCardId === card.id

                      let variantClass: string
                      if (isMatched) {
                        variantClass =
                          'border-emerald-400 bg-emerald-50 text-emerald-800 scale-[0.98] dark:border-emerald-700/60 dark:bg-emerald-950/40 dark:text-emerald-200'
                      } else if (isSelected) {
                        variantClass = 'border-primary bg-primary/10 text-primary scale-[1.02]'
                      } else {
                        variantClass =
                          'border-sky-200 bg-sky-50 text-sky-800 hover:border-sky-400 hover:bg-sky-100 dark:border-sky-800/60 dark:bg-sky-950/30 dark:text-sky-200'
                      }

                      return (
                        <button
                          key={card.id}
                          type="button"
                          onClick={() => handleCardClick(card)}
                          disabled={submitted || isMatched}
                          className={`flex h-16 w-full items-center justify-center rounded-xl border px-3 text-center text-sm font-medium transition-all duration-150 ${variantClass}`}
                        >
                          {card.label}
                        </button>
                      )
                    })}
                </div>
              </div>

              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-pink-700 dark:text-pink-300">
                  Перевод
                </p>
                <div className="space-y-2">
                  {cards
                    .filter(card => card.kind === 'translation')
                    .map(card => {
                      const isMatched = matchedCardIds.has(card.id)
                      const isSelected = selectedCardId === card.id

                      let variantClass: string
                      if (isMatched) {
                        variantClass =
                          'border-emerald-400 bg-emerald-50 text-emerald-800 scale-[0.98] dark:border-emerald-700/60 dark:bg-emerald-950/40 dark:text-emerald-200'
                      } else if (isSelected) {
                        variantClass = 'border-primary bg-primary/10 text-primary scale-[1.02]'
                      } else {
                        variantClass =
                          'border-pink-200 bg-pink-50 text-pink-800 hover:border-pink-400 hover:bg-pink-100 dark:border-pink-800/60 dark:bg-pink-950/30 dark:text-pink-200'
                      }

                      return (
                        <button
                          key={card.id}
                          type="button"
                          onClick={() => handleCardClick(card)}
                          disabled={submitted || isMatched}
                          className={`flex h-16 w-full items-center justify-center rounded-xl border px-3 text-center text-sm font-medium transition-all duration-150 ${variantClass}`}
                        >
                          {card.label}
                        </button>
                      )
                    })}
                </div>
              </div>
            </div>
          </div>
          )}
          {submitted && (
            <div className="rounded-2xl border border-border bg-card p-5">
              <h4 className="mb-4 flex items-center gap-2 text-base font-semibold text-foreground">
                <BookOpen className="h-4 w-4 text-emerald-600" />
                Соответствия для повторения
              </h4>

              <div className="grid gap-3 sm:grid-cols-2">
                {pairs.map(p => (
                  <div
                    key={p.id}
                    className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-3 dark:border-emerald-900/40 dark:bg-emerald-950/20"
                  >
                    <div className="text-sm font-semibold text-emerald-800 dark:text-emerald-200">
                      {p.term}
                    </div>
                    <div className="mt-1 text-sm text-emerald-700 dark:text-emerald-300">
                      {p.allTranslations.join(', ')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {/* {submitted && (
            <div className="rounded-2xl border border-border bg-card p-4 text-sm">
              <h4 className="mb-2 text-sm font-semibold text-foreground">
                Соответствия для повторения
              </h4>
              <div className="space-y-1">
                {pairs.map(p => (
                  <div key={p.id}>
                    <span className="font-medium text-foreground">{p.term}</span>
                    <span className="mx-1 text-muted-foreground">—</span>
                    <span className="text-foreground">{p.allTranslations.join(', ')}</span>
                  </div>
                ))}
              </div>
            </div>
          )} */}
        </>
      )}
    </div>
  )
}

