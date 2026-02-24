import { useState } from 'react'
import { Save, X } from 'lucide-react'
import { Button, Input } from '@/shared/ui'
import { useUpdateCourseMutation } from '@/entities/course'
import type { Course, CourseLevel } from '@/shared/types/course'

const LEVELS: CourseLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']

interface CourseMetaEditFormProps {
  course: Pick<
    Course,
    'id' | 'title' | 'description' | 'shortDescription' | 'level' | 'language' | 'coverImage'
  >
  onClose: () => void
  onUpdated: (message: string) => void
  onError: (message: string) => void
}

export const CourseMetaEditForm = ({
  course,
  onClose,
  onUpdated,
  onError,
}: CourseMetaEditFormProps) => {
  const [updateCourse, { isLoading }] = useUpdateCourseMutation()

  const [editTitle, setEditTitle] = useState(course.title)
  const [editDescription, setEditDescription] = useState(course.description)
  const [editShortDescription, setEditShortDescription] = useState(course.shortDescription || '')
  const [editLevel, setEditLevel] = useState<CourseLevel>(course.level)
  const [editLanguage, setEditLanguage] = useState(course.language)
  const [editCoverImage, setEditCoverImage] = useState(course.coverImage || '')

  const handleSave = async () => {
    if (!editTitle.trim()) {
      onError('Введите название курса')
      return
    }

    try {
      await updateCourse({
        id: course.id,
        data: {
          title: editTitle.trim(),
          description: editDescription.trim(),
          shortDescription: editShortDescription.trim() || undefined,
          level: editLevel,
          language: editLanguage.trim(),
          coverImage: editCoverImage.trim() || undefined,
        },
      }).unwrap()

      onUpdated('Курс обновлён!')
      onClose()
    } catch (error) {
      const err = error as { data?: { message?: string } }
      onError(err?.data?.message || 'Не удалось обновить курс')
    }
  }

  return (
    <div className="mb-6 glass-card p-6 rounded-md">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Редактирование курса</h2>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="md:col-span-2">
          <label className="mb-1 block text-sm font-medium">Название *</label>
          <Input
            value={editTitle}
            onChange={e => setEditTitle(e.target.value)}
            placeholder="Название курса"
          />
        </div>
        <div className="md:col-span-2">
          <label className="mb-1 block text-sm font-medium">Краткое описание</label>
          <Input
            value={editShortDescription}
            onChange={e => setEditShortDescription(e.target.value)}
            placeholder="Краткое описание"
          />
        </div>
        <div className="md:col-span-2">
          <label className="mb-1 block text-sm font-medium">Полное описание</label>
          <textarea
            value={editDescription}
            onChange={e => setEditDescription(e.target.value)}
            className="min-h-[100px] w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
            placeholder="Описание курса"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Уровень</label>
          <select
            value={editLevel}
            onChange={e => setEditLevel(e.target.value as CourseLevel)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
          >
            {LEVELS.map(l => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Язык обучения</label>
          <Input
            value={editLanguage}
            onChange={e => setEditLanguage(e.target.value)}
            placeholder="Английский"
          />
        </div>
        <div className="md:col-span-2">
          <label className="mb-1 block text-sm font-medium">URL обложки</label>
          <Input
            value={editCoverImage}
            onChange={e => setEditCoverImage(e.target.value)}
            placeholder="https://..."
          />
        </div>
      </div>
      <div className="mt-4 flex gap-2">
        <Button onClick={handleSave} disabled={isLoading}>
          <Save className="mr-2 h-4 w-4" />
          {isLoading ? 'Сохранение...' : 'Сохранить'}
        </Button>
        <Button variant="outline" onClick={onClose}>
          Отмена
        </Button>
      </div>
    </div>
  )
}

