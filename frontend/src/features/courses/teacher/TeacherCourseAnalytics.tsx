import type {
  TeacherCourseAnalytics as TeacherCourseAnalyticsType,
  TeacherCourseAnalyticsTimeseries,
} from '@/shared/types/analytics'
import { BookOpen, Clock, GraduationCap, Users } from 'lucide-react'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router-dom'
import { useGetTeacherCourseTimeseriesQuery } from '@/entities/analytics'

interface TeacherCourseAnalyticsProps {
  courseId: string
  analytics: TeacherCourseAnalyticsType
}

interface TeacherTimeseriesPoint {
  date: string
  newEnrollments: number
  activeStudents: number
}

export const TeacherCourseAnalytics = ({ courseId, analytics }: TeacherCourseAnalyticsProps) => {
  const { t } = useTranslation('platform', { keyPrefix: 'teacher.analyticsDash' })
  const { i18n } = useTranslation('platform')
  const locale = i18n.language.startsWith('ru') ? 'ru-RU' : 'en-US'
  const { enrollments, lessons } = analytics
  const [searchParams, setSearchParams] = useSearchParams()

  const periodParam = searchParams.get('period')
  const period: 7 | 30 | 90 =
    periodParam === '7' || periodParam === '90' ? (Number(periodParam) as 7 | 30 | 90) : 30

  const { data: timeseriesData } = useGetTeacherCourseTimeseriesQuery({ courseId, periodDays: period })

  const timeseries: TeacherCourseAnalyticsTimeseries | null = timeseriesData?.data ?? null

  const chartData: TeacherTimeseriesPoint[] = useMemo(() => {
    if (!timeseries) return []

    const { labels, enrollments: enrollSeries, activeStudents } = timeseries

    return labels.map((label, index) => ({
      date: label,
      newEnrollments: enrollSeries.new[index] ?? 0,
      activeStudents: activeStudents[index] ?? 0,
    }))
  }, [timeseries])

  return (
    <div className="mb-6 rounded-xl border border-border bg-background/60 p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
            <BookOpen className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {t('title')}
            </p>
            <p className="text-sm text-muted-foreground">{t('subtitle')}</p>
          </div>
        </div>
      </div>

      <div className="mb-4 grid gap-3 sm:grid-cols-4 text-xs">
        <div className="rounded-lg bg-muted/60 px-3 py-2">
          <div className="flex items-center gap-1 text-muted-foreground">
            <Users className="h-3 w-3" />
            <span>{t('enrolled')}</span>
          </div>
          <div className="mt-1 text-sm font-semibold text-foreground">
            {enrollments.total}
          </div>
        </div>

        <div className="rounded-lg bg-emerald-500/10 px-3 py-2">
          <div className="flex items-center gap-1 text-emerald-700 dark:text-emerald-300">
            <GraduationCap className="h-3 w-3" />
            <span>{t('completed')}</span>
          </div>
          <div className="mt-1 text-sm font-semibold">
            {enrollments.completed}{' '}
            {enrollments.total > 0 && (
              <span className="text-xs text-emerald-700/80 dark:text-emerald-300/80">
                ({enrollments.completionRate}%)
              </span>
            )}
          </div>
        </div>

        <div className="rounded-lg bg-blue-500/10 px-3 py-2">
          <div className="flex items-center gap-1 text-blue-700 dark:text-blue-300">
            <Users className="h-3 w-3" />
            <span>{t('active7d')}</span>
          </div>
          <div className="mt-1 text-sm font-semibold">
            {enrollments.activeStudents7Days}
          </div>
        </div>

        <div className="rounded-lg bg-violet-500/10 px-3 py-2">
          <div className="flex items-center gap-1 text-violet-700 dark:text-violet-300">
            <Clock className="h-3 w-3" />
            <span>{t('new30d')}</span>
          </div>
          <div className="mt-1 text-sm font-semibold">
            {enrollments.newLast30Days}
          </div>
        </div>
      </div>

      {timeseries && chartData.length > 0 && (
        <div className="mt-4 rounded-lg border border-border/60 bg-background/60 p-3">
          <div className="mb-2 flex items-center justify-between gap-2">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {t('chartTitle', { days: timeseries.periodDays })}
            </p>
            <div className="flex items-center gap-1">
              {[7, 30, 90].map(value => (
                <button
                  key={value}
                  type="button"
                  onClick={() => {
                    const next = new URLSearchParams(searchParams)
                    if (value === 30) {
                      next.delete('period')
                    } else {
                      next.set('period', String(value))
                    }
                    setSearchParams(next, { replace: true })
                  }}
                  className={`rounded-full px-2.5 py-0.5 text-[11px] transition ${
                    period === value
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-background text-muted-foreground border border-border hover:bg-muted/60'
                  }`}
                >
                  {t('dayShort', { n: value })}
                </button>
              ))}
            </div>
          </div>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ left: -20, right: 10, top: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#33415540" />
                <XAxis
                  dataKey="date"
                  tickFormatter={value =>
                    new Date(value).toLocaleDateString(locale, {
                      day: '2-digit',
                      month: '2-digit',
                    })
                  }
                  tick={{ fontSize: 11 }}
                />
                <YAxis
                  tick={{ fontSize: 11 }}
                  tickFormatter={v => (typeof v === 'number' ? v.toLocaleString(locale) : v)}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{ color: '#000000' }}
                  labelFormatter={value =>
                    new Date(value as string).toLocaleDateString(locale, {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                    })
                  }
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="newEnrollments"
                  name={t('seriesEnrollments')}
                  stroke="#22c55e"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="activeStudents"
                  name={t('seriesActive')}
                  stroke="#0ea5e9"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {lessons.length > 0 && (
        <div className="mt-4 rounded-lg border border-border/60 bg-background/60 p-3">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {t('topLessons')}
          </p>
          <div className="scroll-soft max-h-40 space-y-1 overflow-y-auto pr-1 text-xs">
            {lessons.map(lesson => (
              <div
                key={lesson.id}
                className="flex items-center justify-between gap-2 rounded-md px-2 py-1 hover:bg-muted/60"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-foreground">
                    {lesson.title}
                  </p>
                  <p className="truncate text-[11px] text-muted-foreground">
                    {t('lessonMeta', {
                      reached: lesson.studentsReached,
                      completed: lesson.studentsCompleted,
                    })}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-0.5 text-[11px] text-muted-foreground">
                  <span>
                    {t('avgScore')}{' '}
                    {typeof lesson.avgScore === 'number' ? `${lesson.avgScore.toFixed(1)}` : '—'}
                  </span>
                  <span>
                    {t('avgTime')}{' '}
                    {typeof lesson.avgTimeSpentSec === 'number'
                      ? t('minutesShort', { n: Math.round(lesson.avgTimeSpentSec / 60) })
                      : '—'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

