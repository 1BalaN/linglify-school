import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import type { RootState } from '@/app/store'
import { AlertCircle, BarChart3, ArrowLeft } from 'lucide-react'
import { Button } from '@/shared/ui'
import { useGetCourseByIdQuery, useGetCourseStudentsQuery } from '@/entities/course'
import { useGetTeacherCourseAnalyticsQuery } from '@/entities/analytics'
import { TeacherCourseAnalytics, CourseStudentsTable, StudentScoresTable } from '@/features/courses/teacher'

export const CourseAnalyticsPage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const user = useSelector((state: RootState) => state.auth.user)

  const { data: courseData, isLoading: isCourseLoading } = useGetCourseByIdQuery(id!)
  const { data: analyticsData, isLoading: isAnalyticsLoading } = useGetTeacherCourseAnalyticsQuery(id!)
  const { data: studentsData, isLoading: isStudentsLoading } = useGetCourseStudentsQuery(id!)

  useEffect(() => {
    if (!user) {
      navigate('/login', { replace: true })
    }
  }, [user, navigate])

  const course = courseData?.data
  const courseAnalytics = analyticsData?.data
  const students = studentsData?.data ?? []

  const canView =
    !!user &&
    (user.role === 'ADMIN' || (user.role === 'TEACHER' && course && course.teacherId === user.id))

  if (!user) {
    return null
  }

  if (isCourseLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-r-transparent" />
          <p className="text-muted-foreground">Загрузка курса...</p>
        </div>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-500" />
          <h2 className="mb-2 text-xl font-bold">Курс не найден</h2>
          <Button onClick={() => navigate('/admin/courses')}>К списку курсов</Button>
        </div>
      </div>
    )
  }

  if (!canView) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="glass-card max-w-md p-8 text-center">
          <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-500" />
          <h2 className="mb-2 text-xl font-bold">Доступ запрещён</h2>
          <p className="mb-6 text-muted-foreground">
            Аналитику курса могут видеть только администраторы и преподаватель этого курса.
          </p>
          <Button onClick={() => navigate(`/courses/${id}`)}>К курсу</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 py-8">
      <div className="container mx-auto max-w-5xl px-4">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => navigate(`/courses/${id}/lessons`)}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              К урокам
            </Button>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600">
                <BarChart3 className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Аналитика курса</h1>
                <p className="text-xs text-muted-foreground">
                  {course.title} · {course.level} · {course.language}
                </p>
              </div>
            </div>
          </div>
        </div>

        {students.length > 0 && (
          <div className="mb-4 grid gap-3 sm:grid-cols-4 text-xs">
            <div className="rounded-lg bg-muted/60 px-3 py-2">
              <div className="text-muted-foreground">Всего учеников</div>
              <div className="mt-1 text-sm font-semibold text-foreground">
                {students.length}
              </div>
            </div>

            <div className="rounded-lg bg-blue-500/10 px-3 py-2">
              <div className="text-blue-700 dark:text-blue-300">Начали (&lt; 25%)</div>
              <div className="mt-1 text-sm font-semibold">
                {students.filter(s => s.progress < 25).length}
              </div>
            </div>

            <div className="rounded-lg bg-violet-500/10 px-3 py-2">
              <div className="text-violet-700 dark:text-violet-300">В процессе (25–75%)</div>
              <div className="mt-1 text-sm font-semibold">
                {students.filter(s => s.progress >= 25 && s.progress < 75).length}
              </div>
            </div>

            <div className="rounded-lg bg-emerald-500/10 px-3 py-2">
              <div className="text-emerald-700 dark:text-emerald-300">Почти/завершили (&gt;= 75%)</div>
              <div className="mt-1 text-sm font-semibold">
                {students.filter(s => s.progress >= 75).length}
              </div>
            </div>
          </div>
        )}

        {isAnalyticsLoading ? (
          <div className="mb-6 space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="animate-pulse rounded-2xl border border-border bg-card p-6"
              >
                <div className="mb-4 h-5 w-1/3 rounded bg-muted" />
                <div className="h-40 rounded-xl bg-muted" />
              </div>
            ))}
          </div>
        ) : (
          courseAnalytics && id && (
            <TeacherCourseAnalytics courseId={id} analytics={courseAnalytics} />
          )
        )}

        <CourseStudentsTable students={students} isLoading={isStudentsLoading} />

        {students.length > 0 && (
          <div className="mt-4">
            <StudentScoresTable courseId={id!} />
          </div>
        )}
      </div>
    </div>
  )
}

