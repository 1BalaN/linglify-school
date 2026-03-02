import { ChevronLeft, Clock, Video, ClipboardCheck, MessageSquare, CheckCircle, Book, MessageCircle } from 'lucide-react'
import { Button } from '@/shared/ui'
import type { LessonType } from '@/shared/types/course'

interface LessonHeaderProps {
  title: string
  description?: string | null
  type: LessonType
  durationSeconds?: number | null
  isCompleted?: boolean
  onBackToCourse: () => void
}

const typeMeta: Record<LessonType, { label: string; Icon: typeof Video }> = {
  VIDEO: { label: 'Видео-урок', Icon: Video },
  TEST: { label: 'Тест', Icon: ClipboardCheck },
  INTERACTIVE: { label: 'Интерактив', Icon: MessageSquare },
  LEXICAL: { label: 'Лексический тренажёр', Icon: Book },
  DIALOGUE: { label: 'Диалоговый урок', Icon: MessageCircle },
}

function formatDuration(seconds?: number | null): string | null {
  if (!seconds) return null
  const totalMins = Math.floor(seconds / 60)
  const h = Math.floor(totalMins / 60)
  const m = totalMins % 60
  if (h === 0) return `${totalMins} мин`
  return m > 0 ? `${h} ч ${m} мин` : `${h} ч`
}

export const LessonHeader = ({
  title,
  description,
  type,
  durationSeconds,
  isCompleted,
  onBackToCourse,
}: LessonHeaderProps) => {
  const { label, Icon } = typeMeta[type]
  const durationLabel = formatDuration(durationSeconds)

  return (
    <>
      <div className="mb-6 flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={onBackToCourse}>
          <ChevronLeft className="mr-1 h-4 w-4" />
          Вернуться к курсу
        </Button>
        {isCompleted && (
          <div className="flex items-center gap-1.5 text-sm font-medium text-emerald-600">
            <CheckCircle className="h-4 w-4" />
            Завершён
          </div>
        )}
      </div>

      <div className="mb-8">
        <div className="mb-3 flex items-center gap-2">
          <span className="flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            <Icon className="h-3.5 w-3.5" />
            {label}
          </span>
          {durationLabel && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              {durationLabel}
            </span>
          )}
        </div>
        <h1 className="mb-3 text-3xl font-bold leading-tight text-foreground">{title}</h1>
        {description && (
          <p className="text-lg text-muted-foreground">{description}</p>
        )}
      </div>
    </>
  )
}

