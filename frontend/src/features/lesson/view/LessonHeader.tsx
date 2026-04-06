import {
  ChevronLeft,
  Clock,
  Video,
  ClipboardCheck,
  MessageSquare,
  CheckCircle,
  Book,
  MessageCircle,
} from 'lucide-react'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
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

const typeIcons: Record<LessonType, typeof Video> = {
  VIDEO: Video,
  TEST: ClipboardCheck,
  INTERACTIVE: MessageSquare,
  LEXICAL: Book,
  DIALOGUE: MessageCircle,
}

export const LessonHeader = ({
  title,
  description,
  type,
  durationSeconds,
  isCompleted,
  onBackToCourse,
}: LessonHeaderProps) => {
  const { t: tFlow } = useTranslation('platform', { keyPrefix: 'lessonFlow' })
  const { t: tStudent } = useTranslation('platform', { keyPrefix: 'student.myCourses' })
  const { t: tLt } = useTranslation('platform', { keyPrefix: 'lessonBuilder.lessonTypes' })
  const { t: tTime } = useTranslation('platform', { keyPrefix: 'timeDisplay' })

  const Icon = typeIcons[type]
  const lessonTypeLabel: Record<LessonType, string> = {
    VIDEO: tLt('VIDEO.label'),
    TEST: tLt('TEST.label'),
    INTERACTIVE: tLt('INTERACTIVE.label'),
    LEXICAL: tLt('LEXICAL.label'),
    DIALOGUE: tLt('DIALOGUE.label'),
  }
  const label = lessonTypeLabel[type]

  const durationLabel = useMemo(() => {
    if (!durationSeconds) return null
    const totalMins = Math.floor(durationSeconds / 60)
    const h = Math.floor(totalMins / 60)
    const m = totalMins % 60
    if (h === 0) return tTime('minutes', { n: totalMins })
    return m > 0 ? tTime('hoursMinutes', { h, m }) : tTime('hours', { h })
  }, [durationSeconds, tTime])

  return (
    <>
      <div className="mb-6 flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={onBackToCourse}>
          <ChevronLeft className="mr-1 h-4 w-4" />
          {tFlow('backToCourse')}
        </Button>
        {isCompleted ? (
          <div className="flex items-center gap-1.5 text-sm font-medium text-emerald-600">
            <CheckCircle className="h-4 w-4" />
            {tStudent('completed')}
          </div>
        ) : null}
      </div>

      <div className="mb-8">
        <div className="mb-3 flex items-center gap-2">
          <span className="flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            <Icon className="h-3.5 w-3.5" />
            {label}
          </span>
          {durationLabel ? (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              {durationLabel}
            </span>
          ) : null}
        </div>
        <h1 className="mb-3 text-3xl font-bold leading-tight text-foreground">{title}</h1>
        {description ? <p className="text-lg text-muted-foreground">{description}</p> : null}
      </div>
    </>
  )
}
