import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  BarChart,
  Bar,
} from 'recharts'
import type { AdminAnalyticsOverview, AdminAnalyticsTimeseries } from '@/shared/types/analytics'

interface AdminAnalyticsSectionProps {
  overview?: AdminAnalyticsOverview | null
  timeseries?: AdminAnalyticsTimeseries | null
}

interface TimeseriesPoint {
  date: string
  registrations: number
  enrollNew: number
  enrollCompleted: number
  placementCompleted: number
}

export const AdminAnalyticsSection = ({ overview, timeseries }: AdminAnalyticsSectionProps) => {
  const { t } = useTranslation('platform', { keyPrefix: 'admin.dashboard.analyticsSection' })
  const { i18n } = useTranslation('platform')
  const locale = i18n.language.startsWith('ru') ? 'ru-RU' : 'en-US'
  const chartData: TimeseriesPoint[] = useMemo(() => {
    if (!timeseries) return []

    const { labels, users, enrollments, placement } = timeseries

    return labels.map((label, index) => ({
      date: label,
      registrations: users.registrations[index] ?? 0,
      enrollNew: enrollments.new[index] ?? 0,
      enrollCompleted: enrollments.completed[index] ?? 0,
      placementCompleted: placement.completedSessions[index] ?? 0,
    }))
  }, [timeseries])

  const placementTable = useMemo(() => {
    if (!overview) return []
    const entries: {
      language: string
      levels: { level: string; count: number }[]
      total: number
    }[] = []

    for (const [language, levelMap] of Object.entries(overview.placement.byLanguageAndLevel)) {
      const levels: { level: string; count: number }[] = []
      let total = 0

      for (const [level, count] of Object.entries(levelMap)) {
        const value = count ?? 0
        if (value > 0) {
          levels.push({ level, count: value })
          total += value
        }
      }

      levels.sort((a, b) => a.level.localeCompare(b.level))

      entries.push({
        language,
        levels,
        total,
      })
    }

    entries.sort((a, b) => b.total - a.total)

    return entries
  }, [overview])

  if (!overview && !timeseries) {
    return null
  }

  return (
    <div className="mt-10 space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-foreground">{t('title')}</h2>
          <p className="text-sm text-muted-foreground">{t('subtitle')}</p>
        </div>
      </div>

      {timeseries && chartData.length > 0 && (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,3fr),minmax(0,2fr)]">
          <div className="rounded-2xl glass-card p-4 backdrop-blur-xl">
            <h3 className="mb-3 text-sm font-semibold text-foreground">
              {t('chartRegsTitle', { days: timeseries.periodDays })}
            </h3>
            <div className="h-64">
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
                    tickFormatter={value => (typeof value === 'number' ? value.toLocaleString(locale) : value)}
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
                    dataKey="registrations"
                    name={t('seriesRegs')}
                    stroke="#0ea5e9"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="enrollNew"
                    name={t('seriesEnroll')}
                    stroke="#22c55e"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="enrollCompleted"
                    name={t('seriesCompleted')}
                    stroke="#8b5cf6"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-2xl glass-card p-4 backdrop-blur-xl">
            <h3 className="mb-3 text-sm font-semibold text-foreground">
              {t('chartPlacementTitle', { days: timeseries.periodDays })}
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ left: -20, right: 10, top: 10 }}>
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
                    tickFormatter={value => (typeof value === 'number' ? value.toLocaleString(locale) : value)}
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
                  <Bar
                    dataKey="placementCompleted"
                    name={t('seriesPlacementDone')}
                    fill="#06b6d4"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {overview && placementTable.length > 0 && (
        <div className="rounded-2xl glass-card p-4 backdrop-blur-xl">
          <h3 className="mb-3 text-sm font-semibold text-foreground">
            {t('levelsTitle')}
          </h3>
          <div className="scroll-soft max-h-60 overflow-y-auto">
            <table className="min-w-full text-left text-xs">
              <thead className="sticky top-0 bg-background/80 backdrop-blur border-b border-border/60">
                <tr>
                  <th className="px-3 py-2 font-medium text-muted-foreground">{t('colLanguage')}</th>
                  <th className="px-3 py-2 font-medium text-muted-foreground">{t('colSessions')}</th>
                  <th className="px-3 py-2 font-medium text-muted-foreground">{t('colLevels')}</th>
                </tr>
              </thead>
              <tbody>
                {placementTable.map(row => (
                  <tr key={row.language} className="border-b border-border/40 last:border-0">
                    <td className="px-3 py-2 text-foreground">{row.language}</td>
                    <td className="px-3 py-2 text-foreground">{row.total}</td>
                    <td className="px-3 py-2">
                      <div className="flex flex-wrap gap-1">
                        {row.levels.map(level => (
                          <span
                            key={level.level}
                            className="inline-flex items-center rounded-full bg-primary/5 px-2 py-0.5 text-[11px] text-primary"
                          >
                            <span className="font-semibold">{level.level}</span>
                            <span className="ml-1 text-muted-foreground">({level.count})</span>
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

