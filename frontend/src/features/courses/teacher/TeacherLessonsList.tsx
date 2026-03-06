import type { Lesson, LessonType } from '@/shared/types/course'
import { Button } from '@/shared/ui'
import { BookOpen, Edit2, Trash2 } from 'lucide-react'
import { LessonEditPanel } from './LessonEditPanel'
import { useState } from 'react'

const lessonTypeMeta: { value: LessonType; label: string }[] = [
  { value: 'VIDEO', label: 'Видео-урок' },
  { value: 'TEST', label: 'Тест' },
  { value: 'INTERACTIVE', label: 'Интерактив' },
  { value: 'LEXICAL', label: 'Лексический тренажёр' },
  { value: 'DIALOGUE', label: 'Диалоговый урок' },
]

interface TeacherLessonsListProps {
  lessons: Lesson[]
  isLoading: boolean
  onEditSuccess: (message: string) => void
  onEditError: (message: string) => void
  onRequestDelete: (lessonId: string) => void
}

export const TeacherLessonsList = ({
  lessons,
  isLoading,
  onEditSuccess,
  onEditError,
  onRequestDelete,
}: TeacherLessonsListProps) => {
  const [editingLessonId, setEditingLessonId] = useState<string | null>(null)

  if (isLoading) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        Загрузка уроков...
      </div>
    )
  }

  if (lessons.length === 0) {
    return (
      <div className="glass-card py-12 text-center rounded-xl">
        <BookOpen className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
        <p className="text-muted-foreground">
          Уроков пока нет. Добавьте первый урок.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {lessons.map(lesson => {
        const meta = lessonTypeMeta.find(lt => lt.value === lesson.type)
        const isEditing = editingLessonId === lesson.id

        if (isEditing) {
          return (
            <LessonEditPanel
              key={lesson.id}
              lessonId={lesson.id}
              onClose={() => setEditingLessonId(null)}
              onSuccess={msg => {
                onEditSuccess(msg)
                setEditingLessonId(null)
              }}
              onError={onEditError}
            />
          )
        }

        return (
          <div
            key={lesson.id}
            className="glass-card flex items-center justify-between rounded-md p-4 transition-all hover:border-primary/40"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <span className="text-xs font-semibold text-primary">
                  {lesson.type === 'VIDEO'
                    ? 'V'
                    : lesson.type === 'TEST'
                      ? 'T'
                      : lesson.type === 'INTERACTIVE'
                        ? 'I'
                        : lesson.type === 'LEXICAL'
                          ? 'L'
                          : 'D'}
                </span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-muted-foreground">
                    #{lesson.order}
                  </span>
                  <h3 className="font-semibold text-foreground">{lesson.title}</h3>
                  <span className="rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
                    {meta?.label || lesson.type}
                  </span>
                  {lesson.isFinalTest && (
                    <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-700 dark:bg-amber-500/20 dark:text-amber-200">
                      Финальный тест
                    </span>
                  )}
                </div>
                {lesson.description && (
                  <p className="line-clamp-1 text-sm text-muted-foreground">
                    {lesson.description}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {lesson.duration && (
                <span className="text-xs text-muted-foreground">
                  {Math.floor(lesson.duration / 60)} мин
                </span>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setEditingLessonId(lesson.id)}
              >
                <Edit2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRequestDelete(lesson.id)}
              >
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </div>
          </div>
        )
      })}
    </div>
  )
}

