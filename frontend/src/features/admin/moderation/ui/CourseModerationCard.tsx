import { memo, useState } from 'react'
import { Button } from '@/shared/ui'
import {
  Eye,
  XCircle,
  FileCheck,
  Trash2,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Course } from '@/shared/types/course'
import { CourseStatus, statusConfig } from '@/shared/constants/courseStatus'

type CourseModerationCardProps = {
  course: Course
  loading: boolean
  onStatusChange: (id: string, status: CourseStatus, comment?: string) => void
  onDelete: (id: string) => void
}

export const CourseModerationCard = memo(
  ({ course, loading, onStatusChange, onDelete }: CourseModerationCardProps) => {
    const navigate = useNavigate()
    const [rejectReason, setRejectReason] = useState('')
    const [showRejectInput, setShowRejectInput] = useState(false)

    const statusInfo = statusConfig[course.status]
    const StatusIcon = statusInfo.icon

    return (
      <div className="glass-card p-6 transition-all hover:border-primary/40 rounded-lg">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="mb-2 flex items-center gap-3 flex-wrap">
              <h3 className="text-lg font-semibold text-foreground">
                {course.title}
              </h3>

              <span
                className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium bg-${statusInfo.color}-500/10 text-${statusInfo.color}-600`}
              >
                <StatusIcon className="h-3 w-3 gap-1" />
                {statusInfo.label}
              </span>
            </div>

            {course.shortDescription && (
              <p className="mb-3 text-sm text-muted-foreground line-clamp-2">
                {course.shortDescription}
              </p>
            )}

            {course.lastReviewComment && course.status === 'REJECTED' && (
              <div className="mt-3 rounded-xl bg-amber-50/80 p-3 text-xs text-amber-900 shadow-sm ring-1 ring-amber-100 dark:bg-amber-950/40 dark:text-amber-50 dark:ring-amber-900/40">
                <div className="mb-1 flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-300">
                  <XCircle className="h-3 w-3" />
                  Комментарий модератора
                </div>
                <div className="whitespace-pre-line leading-snug">
                  {course.lastReviewComment}
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => navigate(`/courses/${course.id}`)}
            >
              <Eye className="mr-1 h-3 w-3" />
              Просмотр
            </Button>

            {course.status === 'PENDING_REVIEW' && (
              <>
                <Button
                  size="sm"
                  onClick={() => onStatusChange(course.id, 'IN_REVIEW')}
                  disabled={loading}
                >
                  <Eye className="mr-1 h-3 w-3" />
                  Начать проверку
                </Button>

                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => setShowRejectInput(prev => !prev)}
                  disabled={loading}
                >
                  <XCircle className="mr-1 h-3 w-3" />
                  Отклонить
                </Button>
              </>
            )}

            {course.status === 'IN_REVIEW' && (
              <>
                <Button
                  size="sm"
                  onClick={() => onStatusChange(course.id, 'PUBLISHED')}
                  disabled={loading}
                >
                  <FileCheck className="mr-1 h-3 w-3" />
                  Опубликовать
                </Button>

                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => setShowRejectInput(prev => !prev)}
                  disabled={loading}
                >
                  <XCircle className="mr-1 h-3 w-3" />
                  Отклонить
                </Button>
              </>
            )}

            {course.status === 'REJECTED' && (
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  onStatusChange(course.id, 'PENDING_REVIEW')
                }
                disabled={loading}
              >
                Вернуть на проверку
              </Button>
            )}

            {showRejectInput && (
              <div className="mt-2 space-y-2 rounded-lg border border-red-200/60 bg-red-50/50 p-2 text-xs text-red-800 dark:border-red-900/60 dark:bg-red-950/40">
                <label className="text-[11px] font-semibold">
                  Причина отклонения
                </label>
                <textarea
                  value={rejectReason}
                  onChange={e => setRejectReason(e.target.value)}
                  placeholder="Кратко опишите, что нужно доработать в курсе"
                  disabled={loading}
                  className="h-16 w-full resize-none rounded-md border border-red-200 bg-white/80 px-2 py-1 text-xs text-foreground shadow-sm outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400 dark:bg-red-950/60"
                />
                <div className="flex justify-end gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setShowRejectInput(false)
                      setRejectReason('')
                    }}
                    disabled={loading}
                  >
                    Отмена
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    disabled={loading || !rejectReason.trim()}
                    onClick={() => {
                      onStatusChange(course.id, 'REJECTED', rejectReason.trim())
                      setShowRejectInput(false)
                    }}
                  >
                    <XCircle className="mr-1 h-3 w-3" />
                    Отклонить
                  </Button>
                </div>
              </div>
            )}

            <Button
              size="sm"
              variant="ghost"
              onClick={() => onDelete(course.id)}
              disabled={loading}
            >
              <Trash2 className="mr-1 h-3 w-3" />
              Удалить
            </Button>
          </div>
        </div>
      </div>
    )
  }
)