import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import type {
  PlacementRecommendedCourse,
  PlacementResultResponse,
  SubmitPlacementResponse,
} from '@/shared/types/placement'
import { Button } from '@/shared/ui'
import { CheckCircle2, Loader2 } from 'lucide-react'

interface PlacementResultStepProps {
  result: SubmitPlacementResponse | null
  detailedResult?: PlacementResultResponse
  isLoadingDetails: boolean
  recommendedCourses: PlacementRecommendedCourse[]
  isLoadingRecommendations: boolean
  hasUser: boolean
  onGoToCourses: () => void
  onGoToCourse: (courseId: string) => void
  onGoToMyCourses: () => void
  onRetake: () => void
}

export const PlacementResultStep = ({
  result,
  detailedResult,
  isLoadingDetails,
  recommendedCourses,
  isLoadingRecommendations,
  hasUser,
  onGoToCourses,
  onGoToCourse,
  onGoToMyCourses,
  onRetake,
}: PlacementResultStepProps) => {
  const { t: tr } = useTranslation('platform', { keyPrefix: 'placement.result' })
  const { t: ts } = useTranslation('platform', { keyPrefix: 'placement.inProgress' })

  const placementSkillLabel = (type: string) => {
    if (type === 'GRAMMAR') return ts('skillGrammar')
    if (type === 'VOCAB') return ts('skillLexical')
    if (type === 'READING') return ts('skillReading')
    return ts('skillListening')
  }

  const correctCount = useMemo(() => {
    if (!detailedResult) return null
    return detailedResult.answers.filter(a => a.isCorrect).length
  }, [detailedResult])

  const totalQuestions =
    detailedResult?.session.totalQuestions ??
    (result && result.finished ? result.result.totalQuestions : null)

  const estimatedLevel =
    detailedResult?.session.estimatedLevel ??
    (result && result.finished ? result.result.estimatedLevel : null)

  return (
    <div className="space-y-6">
      <div className="glass-card rounded-2xl p-6 backdrop-blur-xl space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
            <div>
              <h2 className="text-xl font-semibold text-foreground">{tr('title')}</h2>
              <p className="text-xs text-muted-foreground">{tr('subtitle')}</p>
            </div>
          </div>
          <div className="rounded-xl bg-gradient-to-r from-emerald-500/10 via-primary/10 to-blue-500/10 px-4 py-2 text-right text-xs text-muted-foreground">
            <div className="text-[11px] uppercase tracking-wide">
              {tr('estimatedLevel')}
            </div>
            <div className="text-gradient text-3xl font-bold leading-tight">
              {estimatedLevel ?? '—'}
            </div>
          </div>
        </div>

        <div className="mt-2 grid gap-3 text-xs sm:grid-cols-3">
          <div className="rounded-lg bg-muted/60 px-3 py-2">
            <div className="text-muted-foreground">{tr('totalQuestions')}</div>
            <div className="text-sm font-semibold text-foreground">
              {totalQuestions ?? '—'}
            </div>
          </div>
          <div className="rounded-lg bg-emerald-500/10 px-3 py-2">
            <div className="text-emerald-700 dark:text-emerald-300">
              {tr('correct')}
            </div>
            <div className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
              {correctCount !== null ? correctCount : '—'}
            </div>
          </div>
          <div className="rounded-lg bg-red-500/5 px-3 py-2">
            <div className="text-red-600 dark:text-red-400">
              {tr('incorrect')}
            </div>
            <div className="text-sm font-semibold text-red-600 dark:text-red-400">
              {correctCount !== null && totalQuestions !== null
                ? totalQuestions - correctCount
                : '—'}
            </div>
          </div>
        </div>

        <p className="mt-3 text-sm text-muted-foreground">{tr('levelNote')}</p>

        <div className="mt-4 flex flex-wrap gap-3">
          <Button onClick={onGoToCourses}>{tr('toCatalog')}</Button>
          {hasUser && (
            <Button
              type="button"
              variant="outline"
              onClick={onGoToMyCourses}
            >
              {tr('myCourses')}
            </Button>
          )}
          <Button
            type="button"
            variant="ghost"
            onClick={onRetake}
          >
            {tr('retake')}
          </Button>
        </div>
      </div>

      {detailedResult && (
        <div className="glass-card rounded-2xl p-6 backdrop-blur-xl space-y-4">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-lg font-semibold text-foreground">
              {tr('breakdownTitle')}
            </h3>
            {isLoadingDetails && (
              <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                <Loader2 className="h-3 w-3 animate-spin" />
                <span>{tr('loadingBreakdown')}</span>
              </div>
            )}
          </div>
          <p className="text-xs text-muted-foreground">{tr('breakdownIntro')}</p>

          <div className="scroll-soft max-h-80 space-y-3 overflow-y-auto pr-1">
            {detailedResult.answers.map((answer, index) => {
              const question = answer.question
              const givenOption =
                question.options[answer.givenOptionIndex] ?? '—'
              const correctOption =
                question.options[question.correctOptionIndex] ?? '—'

              const isCorrect = answer.isCorrect

              return (
                <div
                  key={answer.id}
                  className={`rounded-xl border px-3 py-3 text-xs sm:text-sm ${
                    isCorrect
                      ? 'border-emerald-500/40 bg-emerald-500/5'
                      : 'border-red-500/40 bg-red-500/5'
                  }`}
                >
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <span className="font-medium text-foreground">
                      {tr('questionN', { n: index + 1 })}{' '}
                      <span className="text-[11px] uppercase tracking-wide text-muted-foreground">
                        {tr('skillSuffix', {
                          skill: placementSkillLabel(question.type),
                          difficulty: question.difficulty,
                        })}
                      </span>
                    </span>
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                        isCorrect
                          ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                          : 'bg-red-500/15 text-red-700 dark:text-red-300'
                      }`}
                    >
                      {isCorrect ? tr('correctBadge') : tr('wrongBadge')}
                    </span>
                  </div>
                  <div className="text-foreground">
                    {question.prompt}
                  </div>
                  <div className="mt-2 grid gap-2 text-xs sm:grid-cols-2">
                    <div>
                      <div className="text-[11px] uppercase tracking-wide text-muted-foreground">
                        {tr('yourAnswer')}
                      </div>
                      <div
                        className={`mt-0.5 rounded-md px-2 py-1 ${
                          isCorrect
                            ? 'bg-emerald-500/10 text-emerald-800 dark:text-emerald-200'
                            : 'bg-red-500/10 text-red-800 dark:text-red-200'
                        }`}
                      >
                        {givenOption}
                      </div>
                    </div>
                    <div>
                      <div className="text-[11px] uppercase tracking-wide text-muted-foreground">
                        {tr('rightAnswer')}
                      </div>
                      <div className="mt-0.5 rounded-md bg-emerald-500/10 px-2 py-1 text-emerald-800 dark:text-emerald-200">
                        {correctOption}
                      </div>
                    </div>
                  </div>
                  {question.explanation && (
                    <div className="mt-2 rounded-md bg-background/60 px-2 py-1 text-[11px] text-muted-foreground">
                      {question.explanation}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      <div className="glass-card rounded-2xl p-6 backdrop-blur-xl space-y-4">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-lg font-semibold text-foreground">
            {tr('recommended')}
          </h3>
          {estimatedLevel && (
            <span className="text-[11px] text-muted-foreground">
              {tr('recommendedSub', { level: estimatedLevel })}
            </span>
          )}
        </div>
        {isLoadingRecommendations && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>{tr('loadingCourses')}</span>
          </div>
        )}
        {!isLoadingRecommendations && recommendedCourses.length === 0 && (
          <p className="text-sm text-muted-foreground">{tr('noCourses')}</p>
        )}
        {!isLoadingRecommendations && recommendedCourses.length > 0 && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {recommendedCourses.map(course => (
              <button
                key={course.id}
                type="button"
                onClick={() => onGoToCourse(course.id)}
                className="group flex flex-col items-start overflow-hidden rounded-xl border border-border bg-background/60 text-left shadow-sm transition-all hover:border-primary/40 hover:bg-primary/5 hover:shadow-md"
              >
                <div className="flex w-full flex-1 flex-col gap-2 p-4">
                  <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                    <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 font-medium text-primary">
                      {course.level}
                    </span>
                    <span className="inline-flex items-center rounded-full bg-secondary/10 px-2 py-0.5 font-medium text-secondary-foreground">
                      {course.language}
                    </span>
                  </div>
                  <h4 className="text-sm font-semibold text-foreground group-hover:text-primary">
                    {course.title}
                  </h4>
                  {course.shortDescription && (
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {course.shortDescription}
                    </p>
                  )}
                  <div className="mt-auto flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>
                      {tr('students', { count: course.enrolledCount })}
                    </span>
                    {typeof course.averageRating === 'number' && (
                      <span>
                        {tr('rating', { rating: course.averageRating.toFixed(1) })}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

