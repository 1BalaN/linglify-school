import { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate, useSearchParams } from 'react-router-dom'
import type { RootState } from '@/app/store'
import { LayoutDashboard, Users, BookOpen, GraduationCap } from 'lucide-react'
import { AdminAnalyticsSection } from '@/features/admin/dashboard'
import { useGetAdminAnalyticsOverviewQuery, useGetAdminAnalyticsTimeseriesQuery } from '@/entities/analytics'

const formatNumber = (value: number | undefined | null): string => {
  if (typeof value !== 'number') return '—'
  return value.toLocaleString('ru-RU')
}

export const AdminAnalyticsPage = () => {
  const navigate = useNavigate()
  const user = useSelector((state: RootState) => state.auth.user)
  const [searchParams, setSearchParams] = useSearchParams()

  const periodParam = searchParams.get('period')
  const period: 7 | 30 | 90 =
    periodParam === '7' || periodParam === '90' ? (Number(periodParam) as 7 | 30 | 90) : 30

  const { data: overviewData } = useGetAdminAnalyticsOverviewQuery({ periodDays: period })
  const { data: timeseriesData } = useGetAdminAnalyticsTimeseriesQuery({ periodDays: period })

  const overview = overviewData?.data ?? null

  useEffect(() => {
    if (user && user.role !== 'ADMIN') {
      navigate('/', { replace: true })
    }
  }, [user, navigate])

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-primary/5 via-background to-secondary/5 py-8">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="mb-8">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 shadow-lg shadow-violet-500/30">
              <LayoutDashboard className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gradient">Аналитика платформы</h1>
              <p className="text-sm text-muted-foreground">
                Обзор пользователей, курсов и результатов обучения
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="text-xs text-muted-foreground">Период:</span>
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
                className={`rounded-full px-3 py-1 text-xs transition ${
                  period === value
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-background text-muted-foreground border border-border hover:bg-muted/60'
                }`}
              >
                {value} дн.
              </button>
            ))}
          </div>

          {overview && (
            <div className="grid gap-4 md:grid-cols-4">
              <div className="rounded-xl border border-border bg-background/60 p-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Пользователи
                  </span>
                  <Users className="h-4 w-4 text-primary" />
                </div>
                <div className="text-2xl font-bold text-foreground">{formatNumber(overview.users.total)}</div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Студентов: {formatNumber(overview.users.students)} · Преподавателей:{' '}
                  {formatNumber(overview.users.teachers)} · Админов: {formatNumber(overview.users.admins)}
                </p>
              </div>

              <div className="rounded-xl border border-border bg-background/60 p-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Курсы
                  </span>
                  <BookOpen className="h-4 w-4 text-primary" />
                </div>
                <div className="text-2xl font-bold text-foreground">{formatNumber(overview.courses.total)}</div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Новых за 30 дней: {formatNumber(overview.courses.newLast30Days)}
                </p>
              </div>

              <div className="rounded-xl border border-border bg-background/60 p-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Завершённые курсы
                  </span>
                  <GraduationCap className="h-4 w-4 text-primary" />
                </div>
                <div className="text-2xl font-bold text-foreground">
                  {formatNumber(overview.enrollments.completed)}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Всего зачислений: {formatNumber(overview.enrollments.total)} · Завершено:{' '}
                  {overview.enrollments.completionRate}%
                </p>
              </div>

              <div className="rounded-xl border border-border bg-background/60 p-4">
                <div className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Воронка обучения
                </div>
                <p className="text-xs text-muted-foreground">
                  Placement → Зачислены → Сертификаты
                </p>
                <dl className="mt-2 space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <dt className="text-muted-foreground">Placement завершили</dt>
                    <dd className="font-semibold text-foreground">
                      {formatNumber(overview.funnel.placementCompleted)}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-muted-foreground">Зачислены на курсы</dt>
                    <dd className="font-semibold text-foreground">
                      {formatNumber(overview.funnel.enrolled)}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-muted-foreground">Получили сертификат</dt>
                    <dd className="font-semibold text-foreground">
                      {formatNumber(overview.funnel.certificatesIssued)}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          )}
        </div>

        <AdminAnalyticsSection
          overview={overview}
          timeseries={timeseriesData?.data ?? null}
        />

        {overview && (
          <div className="mt-8 grid gap-6 lg:grid-cols-2">

            <div className="rounded-2xl glass-card p-4 backdrop-blur-xl">
              <h2 className="mb-3 text-sm font-semibold text-foreground">
                Топ курсов по вовлечённости и рейтингу
              </h2>
              {overview.topCourses.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  Пока недостаточно данных для отображения топа курсов.
                </p>
              ) : (
                <div className="scroll-soft max-h-64 overflow-y-auto">
                  <table className="min-w-full text-left text-xs">
                    <thead className="sticky top-0 bg-background/80 backdrop-blur border-b border-border/60">
                      <tr>
                        <th className="px-3 py-2 font-medium text-muted-foreground">Курс</th>
                        <th className="px-3 py-2 font-medium text-muted-foreground">Уровень</th>
                        <th className="px-3 py-2 font-medium text-muted-foreground">Студенты</th>
                        <th className="px-3 py-2 font-medium text-muted-foreground">Рейтинг</th>
                      </tr>
                    </thead>
                    <tbody>
                      {overview.topCourses.map(course => (
                        <tr key={course.id} className="border-b border-border/40 last:border-0">
                          <td className="px-3 py-2 text-foreground">
                            <div className="line-clamp-2 text-xs font-medium">
                              {course.title}
                            </div>
                            <div className="text-[11px] text-muted-foreground">
                              {course.language}
                            </div>
                          </td>
                          <td className="px-3 py-2 align-middle text-foreground">
                            {course.level}
                          </td>
                          <td className="px-3 py-2 align-middle text-foreground">
                            {formatNumber(course.enrolledCount)}
                          </td>
                          <td className="px-3 py-2 align-middle text-foreground">
                            {typeof course.averageRating === 'number'
                              ? course.averageRating.toFixed(1)
                              : '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="rounded-2xl glass-card p-4 backdrop-blur-xl">
              <h2 className="mb-3 text-sm font-semibold text-foreground">
                Языки курсов по количеству зачислений
              </h2>
              {overview.languageCourses.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  Пока нет данных по языкам курсов.
                </p>
              ) : (
                <div className="scroll-soft max-h-64 space-y-2 overflow-y-auto pr-1 text-xs">
                  {overview.languageCourses
                    .slice()
                    .sort((a, b) => b.totalEnrollments - a.totalEnrollments)
                    .map(lang => {
                      const totalEnrollments = overview.languageCourses.reduce(
                        (sum, l) => sum + l.totalEnrollments,
                        0
                      )
                      const share =
                        totalEnrollments > 0
                          ? Math.round((lang.totalEnrollments / totalEnrollments) * 100)
                          : 0

                      return (
                        <div
                          key={lang.language}
                          className="rounded-xl border border-border bg-background/80 px-3 py-2"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div>
                              <div className="text-sm font-semibold text-foreground">
                                {lang.language}
                              </div>
                              <div className="mt-0.5 text-[11px] text-muted-foreground">
                                Курсов: {formatNumber(lang.coursesCount)} · Зачислений:{' '}
                                {formatNumber(lang.totalEnrollments)}
                              </div>
                            </div>
                            <div className="text-[11px] font-semibold text-muted-foreground">
                              {share}%
                            </div>
                          </div>
                          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-primary to-secondary"
                              style={{ width: `${Math.max(5, share)}%` }}
                            />
                          </div>
                        </div>
                      )
                    })}
                </div>
              )}
            </div>

            <div className="rounded-2xl glass-card p-4 backdrop-blur-xl">
              <h2 className="mb-3 text-sm font-semibold text-foreground">
                Курсы с низким рейтингом (≤ 2.5)
              </h2>
              {overview.lowRatedCourses.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  Хорошая новость: курсов с рейтингом 2.5 и ниже сейчас нет.
                </p>
              ) : (
                <div className="scroll-soft max-h-64 overflow-y-auto">
                  <table className="min-w-full text-left text-xs">
                    <thead className="sticky top-0 bg-background/80 backdrop-blur border-b border-border/60">
                      <tr>
                        <th className="px-3 py-2 font-medium text-muted-foreground">Курс</th>
                        <th className="px-3 py-2 font-medium text-muted-foreground">Уровень</th>
                        <th className="px-3 py-2 font-medium text-muted-foreground">Студенты</th>
                        <th className="px-3 py-2 font-medium text-muted-foreground">Рейтинг</th>
                      </tr>
                    </thead>
                    <tbody>
                      {overview.lowRatedCourses.map(course => (
                        <tr key={course.id} className="border-b border-border/40 last:border-0">
                          <td className="px-3 py-2 text-foreground">
                            <div className="line-clamp-2 text-xs font-medium">
                              {course.title}
                            </div>
                            <div className="text-[11px] text-muted-foreground">
                              {course.language}
                            </div>
                          </td>
                          <td className="px-3 py-2 align-middle text-foreground">
                            {course.level}
                          </td>
                          <td className="px-3 py-2 align-middle text-foreground">
                            {formatNumber(course.enrolledCount)}
                          </td>
                          <td className="px-3 py-2 align-middle text-foreground">
                            {typeof course.averageRating === 'number'
                              ? course.averageRating.toFixed(1)
                              : '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

