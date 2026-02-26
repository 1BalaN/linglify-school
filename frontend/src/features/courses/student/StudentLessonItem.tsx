import { CheckCircle, Clock, Lock, MessageSquare, Play, Video, ClipboardCheck } from 'lucide-react'
import { Button } from '@/shared/ui'
import type { Lesson } from '@/shared/types/course'

interface StudentLessonItemProps {
  lesson: Lesson
  isAccessible: boolean
  onOpen: () => void
}

export const StudentLessonItem = ({ lesson, isAccessible, onOpen }: StudentLessonItemProps) => {
  const isCompleted = lesson.progress?.isCompleted

  const durationLabel = lesson.duration
    ? `${Math.floor(lesson.duration / 60)} мин`
    : null

  const TypeIcon =
    lesson.type === 'VIDEO' ? Video : lesson.type === 'TEST' ? ClipboardCheck : MessageSquare

  const typeLabel =
    lesson.type === 'VIDEO' ? 'Видео' : lesson.type === 'TEST' ? 'Тест' : 'Интерактив'

  return (
    <div
      className={`rounded-xl border p-4 transition-all ${
        isCompleted
          ? 'border-emerald-200 bg-emerald-50/50 dark:border-emerald-900/30 dark:bg-emerald-950/20'
          : isAccessible
            ? 'border-border bg-card hover:border-primary/40 hover:bg-primary/5'
            : 'border-border bg-card/50 opacity-60'
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-1 items-start gap-4">
          <div
            className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl ${
              isCompleted
                ? 'bg-emerald-500 text-white'
                : isAccessible
                  ? 'bg-primary/10 text-primary'
                  : 'bg-muted text-muted-foreground'
            }`}
          >
            {isCompleted ? (
              <CheckCircle className="h-6 w-6" />
            ) : isAccessible ? (
              <Play className="h-6 w-6" />
            ) : (
              <Lock className="h-6 w-6" />
            )}
          </div>

          <div className="flex-1">
            <div className="mb-1 flex items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground">
                Урок {lesson.order}
              </span>
              {lesson.type && (
                <span className="flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                  <TypeIcon className="h-2.5 w-2.5" />
                  {typeLabel}
                </span>
              )}
              {lesson.isFinalTest && (
                <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-700 dark:bg-amber-500/20 dark:text-amber-200">
                  Финальный тест
                </span>
              )}
            </div>
            <h3 className="mb-2 font-semibold text-foreground">{lesson.title}</h3>
            {lesson.description && (
              <p className="mb-2 line-clamp-2 text-sm text-muted-foreground">
                {lesson.description}
              </p>
            )}
            {durationLabel && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>{durationLabel}</span>
              </div>
            )}
          </div>
        </div>

        <div>
          {isAccessible ? (
            <Button onClick={onOpen} size="sm">
              {isCompleted ? 'Повторить' : 'Начать'}
            </Button>
          ) : (
            <Button size="sm" disabled>
              <Lock className="mr-1 h-3 w-3" />
              Закрыто
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

