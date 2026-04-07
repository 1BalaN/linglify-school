import { BarChart2, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useGetMyEfficiencyScoreQuery } from '@/entities/analytics'
import type { EfficiencyLevel } from '@/shared/types/analytics'

const LEVEL_STYLES: Record<
  EfficiencyLevel,
  { color: string; ring: string; bar: string }
> = {
  excellent: {
    color: 'text-emerald-600 dark:text-emerald-400',
    ring: 'ring-emerald-400/30',
    bar: 'from-emerald-400 to-teal-500',
  },
  good: {
    color: 'text-blue-600 dark:text-blue-400',
    ring: 'ring-blue-400/30',
    bar: 'from-blue-400 to-cyan-500',
  },
  average: {
    color: 'text-amber-600 dark:text-amber-400',
    ring: 'ring-amber-400/30',
    bar: 'from-amber-400 to-orange-400',
  },
  poor: {
    color: 'text-orange-600 dark:text-orange-400',
    ring: 'ring-orange-400/30',
    bar: 'from-orange-400 to-red-400',
  },
  critical: {
    color: 'text-red-600 dark:text-red-400',
    ring: 'ring-red-400/30',
    bar: 'from-red-400 to-rose-500',
  },
}

const BAND_I18N: Record<EfficiencyLevel, 'excellent' | 'good' | 'steady' | 'needsPractice' | 'needsAttention'> = {
  excellent: 'excellent',
  good: 'good',
  average: 'steady',
  poor: 'needsPractice',
  critical: 'needsAttention',
}

const CRITERIA = [
  { key: 'accuracy' as const, icon: TrendingUp },
  { key: 'regularity' as const, icon: TrendingUp },
  { key: 'practice' as const, icon: TrendingUp },
  { key: 'engagement' as const, icon: TrendingUp },
]

interface StudentEfficiencyCardProps {
  courseId: string
}

/**
 * Displays the student's composite learning efficiency score.
 * The score is computed server-side from accuracy, regularity,
 * practice completion, and engagement — presented naturally,
 * without academic terminology.
 */
export const StudentEfficiencyCard = ({ courseId }: StudentEfficiencyCardProps) => {
  const { t } = useTranslation('platform')
  const { data, isLoading } = useGetMyEfficiencyScoreQuery(courseId, {
    refetchOnMountOrArgChange: true,
  })
  const scoreData = data?.data

  if (isLoading) {
    return (
      <div className="rounded-xl border border-border bg-card/50 p-4">
        <div className="mb-3 h-4 w-32 animate-pulse rounded bg-muted" />
        <div className="h-20 animate-pulse rounded-lg bg-muted" />
      </div>
    )
  }

  if (!scoreData) return null

  const style = LEVEL_STYLES[scoreData.level]
  const band = BAND_I18N[scoreData.level]
  const label = t(`student.efficiency.bands.${band}.label`)
  const sublabel = t(`student.efficiency.bands.${band}.sublabel`)
  const tip = t(`student.efficiency.bands.${band}.tip`)
  const pct = Math.round(scoreData.score * 100)

  // Trend icon based on score
  const TrendIcon = pct >= 63 ? TrendingUp : pct >= 37 ? Minus : TrendingDown

  return (
    <div className={`rounded-xl border border-border bg-card/50 p-4 ring-2 ${style.ring}`}>
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <BarChart2 className="h-4 w-4 text-muted-foreground" />
          <span className="text-xs font-medium text-muted-foreground">
            {t('student.efficiency.scoreLabel')}
          </span>
        </div>
        <TrendIcon className={`h-4 w-4 ${style.color}`} />
      </div>

      {/* Score ring */}
      <div className="mb-3 flex items-end gap-3">
        <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-muted to-muted/50">
          <svg className="absolute inset-0 h-full w-full -rotate-90">
            <circle cx="28" cy="28" r="24" fill="none" strokeWidth="4" className="stroke-muted/80" />
            <circle
              cx="28" cy="28" r="24" fill="none" strokeWidth="4"
              strokeDasharray={`${2 * Math.PI * 24}`}
              strokeDashoffset={`${2 * Math.PI * 24 * (1 - scoreData.score)}`}
              className={`transition-all duration-700`}
              style={{ stroke: pct >= 63 ? '#10b981' : pct >= 37 ? '#f59e0b' : '#ef4444' }}
              strokeLinecap="round"
            />
          </svg>
          <span className="relative text-sm font-bold tabular-nums">{pct}</span>
        </div>
        <div>
          <p className={`text-sm font-semibold ${style.color}`}>{label}</p>
          <p className="text-xs text-muted-foreground">{sublabel}</p>
        </div>
      </div>

      {/* Mini progress bar for overall */}
      <div className="mb-3 h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${style.bar} transition-all duration-700`}
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Criteria breakdown */}
      <div className="space-y-1.5">
        {CRITERIA.map(c => {
          const val = scoreData.breakdown[c.key]
          return (
            <div key={c.key} className="flex items-center gap-2 text-xs">
              <span className="w-20 shrink-0 text-muted-foreground">
                {t(`student.efficiency.metrics.${c.key}`)}
              </span>
              <div className="flex-1 h-1 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary/60 transition-all duration-500"
                  style={{ width: `${val}%` }}
                />
              </div>
              <span className="w-8 text-right tabular-nums text-muted-foreground">{val}%</span>
            </div>
          )
        })}
      </div>

      {/* Tip */}
      <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">{tip}</p>
    </div>
  )
}
