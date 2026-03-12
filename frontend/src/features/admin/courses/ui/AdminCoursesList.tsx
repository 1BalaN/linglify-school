import { useState } from 'react'
import { useUpdateCourseStatusMutation } from '@/entities/course'
import { statusConfig } from '@/shared/constants/courseStatus'
import type { Course } from '@/shared/types/course'
import { Button } from '@/shared/ui'
import { Link } from 'react-router-dom'
import { AlertCircle, CheckCircle2 } from 'lucide-react'

type AdminCoursesListProps = {
  courses: Course[]
  isCoursesLoading: boolean
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  onPageChange?: (page: number) => void
}

export const AdminCoursesList = ({
  courses,
  isCoursesLoading,
  pagination,
  onPageChange,
}: AdminCoursesListProps) => {
  const [updateCourseStatus] = useUpdateCourseStatusMutation()
  const [statusError, setStatusError] = useState<string | null>(null)
  const [statusInfo, setStatusInfo] = useState<string | null>(null)

  const mapModerationError = (code?: string, message?: string): string => {
    switch (code) {
      case 'COURSE_NOT_READY_FOR_REVIEW':
        return 'Курс ещё не готов к модерации. Заполните название, полное описание и добавьте хотя бы один урок.'
      case 'INVALID_STATUS_TRANSITION':
        return 'Этот курс сейчас нельзя отправить на модерацию. Проверьте его статус — возможно, он уже на проверке или опубликован.'
      default:
        return message || 'Не удалось отправить курс на модерацию. Попробуйте позже.'
    }
  }
  const handleSendToModeration = async (courseId: string) => {
    try {
      setStatusError(null)
      setStatusInfo(null)
      await updateCourseStatus({ id: courseId, status: 'PENDING_REVIEW' }).unwrap()
      setStatusInfo('Курс отправлен на модерацию и появится в разделе модерации у администратора.')
    } catch (error) {
      const err = error as { data?: { error?: { code?: string; message?: string } } }
      const code = err?.data?.error?.code
      const message = err?.data?.error?.message
      const msg = mapModerationError(code, message)
      setStatusError(msg)
    }
  }
  return (
    <div className="rounded-2xl glass-card p-6 backdrop-blur-xl">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground">Ваши курсы</h2>
        {pagination && (
          <span className="text-xs text-muted-foreground">
            Показано {courses.length} из {pagination.total} курсов
          </span>
        )}
      </div>

      {statusError && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-200">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span className="flex-1">{statusError}</span>
          <button
            type="button"
            onClick={() => setStatusError(null)}
            className="ml-2 text-red-500/70 hover:text-red-700 dark:text-red-300"
          >
            ×
          </button>
        </div>
      )}

      {statusInfo && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-200">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span className="flex-1">{statusInfo}</span>
          <button
            type="button"
            onClick={() => setStatusInfo(null)}
            className="ml-2 text-emerald-500/70 hover:text-emerald-700 dark:text-emerald-300"
          >
            ×
          </button>
        </div>
      )}

      {isCoursesLoading ? (
        <div className="py-8 text-center text-muted-foreground">Загрузка...</div>
      ) : courses.length === 0 ? (
        <div className="py-8 text-center text-muted-foreground">
          Курсов пока нет. Создайте первый курс.
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {courses.map(course => {
              const { icon: StatusIcon, label, color } = statusConfig[course.status]
              return (
                <Link
                  key={course.id}
                  to={`/courses/${course.id}`}
                  className="flex items-start justify-between rounded-xl border border-border bg-background/60 px-4 py-3 transition-all hover:border-primary/40 hover:bg-primary/5"
                >
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-center gap-2">
                      <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                        {course.level}
                      </span>
                      <span className={`inline-flex items-center gap-1 rounded-full bg-${color}-500/10 px-2 py-0.5 text-xs font-medium text-${color}-600`}>
                        <StatusIcon className="h-3 w-3" />
                        {label}
                      </span>
                    </div>
                    <h3 className="line-clamp-2 text-sm font-semibold text-foreground">
                      {course.title}
                    </h3>
                    {course.shortDescription && (
                      <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                        {course.shortDescription}
                      </p>
                    )}
                    {(course.status === 'DRAFT' || course.status === 'REJECTED') && (
                      <Button
                        size="sm"
                        className="mt-2"
                        onClick={e => {
                          e.preventDefault()
                          handleSendToModeration(course.id)
                        }}
                      >
                        Отправить на модерацию
                      </Button>
                    )}
                  </div>
                  <div className="ml-4 flex flex-col items-end justify-between gap-2">
                    <div className="text-right text-xs text-muted-foreground">
                      <div>{course.lessonsCount} уроков</div>
                      <div>{course.enrolledCount} студентов</div>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>

          {pagination && pagination.totalPages > 1 && (
            <div className="mt-4 flex items-center justify-center gap-2 text-xs">
              <Button
                size="sm"
                variant="outline"
                disabled={pagination.page <= 1}
                onClick={() => onPageChange?.(pagination.page - 1)}
              >
                Назад
              </Button>
              <span className="px-2 py-1 text-muted-foreground">
                Страница {pagination.page} из {pagination.totalPages}
              </span>
              <Button
                size="sm"
                variant="outline"
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => onPageChange?.(pagination.page + 1)}
              >
                Вперёд
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}