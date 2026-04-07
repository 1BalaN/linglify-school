import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { formatMoney } from '@/shared/lib/format'
import type { TeacherEarnings } from '@/entities/revenue'

export const TeacherEarningsByCourseSection = ({ earnings }: { earnings: TeacherEarnings }) => {
  const { t } = useTranslation('platform')
  const { byCourse } = earnings

  const maxEarned = useMemo(
    () => Math.max(1, ...byCourse.map(c => c.earned)),
    [byCourse],
  )

  if (byCourse.length === 0) return null

  return (
    <section className="mb-8">
      <h2 className="mb-4 text-lg font-semibold">{t('teacherCabinet.earnings.byCourse')}</h2>
      <div className="overflow-hidden rounded-2xl border border-border/80 bg-card/50 shadow-sm backdrop-blur-sm">
        {byCourse.map((c, i) => (
          <div
            key={c.courseId}
            className={`course-earnings-row flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:gap-4 [content-visibility:auto] ${
              i > 0 ? 'border-t border-border/80' : ''
            }`}
          >
            <div className="flex items-center gap-4 sm:min-w-0 sm:flex-1">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-muted text-xs font-bold text-muted-foreground">
                {i + 1}
              </span>
              {c.coverImage ? (
                <img src={c.coverImage} alt="" className="h-11 w-16 shrink-0 rounded-lg object-cover" />
              ) : (
                <div className="h-11 w-16 shrink-0 rounded-lg bg-muted" />
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-sm text-foreground">{c.title}</p>
                <p className="text-xs text-muted-foreground">{t('teacherCabinet.earnings.salesCount', { count: c.sales })}</p>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all"
                    style={{ width: `${Math.min(100, (c.earned / maxEarned) * 100)}%` }}
                  />
                </div>
              </div>
            </div>
            <p className="shrink-0 tabular-nums text-right font-semibold text-emerald-600 dark:text-emerald-400 sm:pl-4">
              {formatMoney(c.earned)}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}
