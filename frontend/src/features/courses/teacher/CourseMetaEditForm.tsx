import { useState } from 'react'
import { Save, X } from 'lucide-react'
import { Button, Input, ImageUpload } from '@/shared/ui'
import { useUpdateCourseMutation } from '@/entities/course'
import type { Course, CourseLevel } from '@/shared/types/course'
import { COURSE_CATEGORIES } from '@/shared/constants/courseCategories'

const LEVELS: CourseLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']

interface CourseMetaEditFormProps {
  course: Pick<
    Course,
    | 'id'
    | 'title'
    | 'description'
    | 'shortDescription'
    | 'level'
    | 'language'
    | 'coverImage'
    | 'category'
    | 'price'
    | 'currency'
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
  const [editCategory, setEditCategory] = useState(course.category || '')
  const [editPriceInput, setEditPriceInput] = useState(
    course.price ? (course.price / 100).toString() : '0',
  )

  const handleSave = async () => {
    if (!editTitle.trim()) {
      onError('Введите название курса')
      return
    }

    const normalizedPrice = editPriceInput.trim()
      ? Math.round(Number(editPriceInput.replace(',', '.')) * 100)
      : 0

    if (Number.isNaN(normalizedPrice) || normalizedPrice < 0) {
      onError('Введите корректную цену')
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
          category: editCategory.trim() || undefined,
          price: normalizedPrice,
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
            className="min-h-[100px] w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none scroll-soft"
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
        <div>
          <label className="mb-1 block text-sm font-medium">Категория</label>
          <select
            value={editCategory}
            onChange={e => setEditCategory(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
          >
            <option value="">Не выбрана</option>
            {COURSE_CATEGORIES.map(category => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">
            Цена ({course.currency})
          </label>
          <Input
            value={editPriceInput}
            onChange={e => setEditPriceInput(e.target.value)}
            placeholder="0"
          />
          <p className="mt-1 text-xs text-muted-foreground">
            Указывайте цену за курс в {course.currency}, например 49.90
          </p>
        </div>
        <div className="md:col-span-2">
          <label className="mb-1 block text-sm font-medium">
            Обложка курса
          </label>
          <div className="rounded-xl border border-border bg-background/40 p-3 md:p-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-start">
              <div className="md:w-1/2 space-y-1">
                <span className="text-[11px] font-medium text-muted-foreground">
                  Ссылка на изображение
                </span>
                <Input
                  value={editCoverImage}
                  onChange={e => setEditCoverImage(e.target.value)}
                  placeholder="https://example.com/cover.jpg"
                />
                <p className="text-[11px] text-muted-foreground">
                  Можно указать прямую ссылку на картинку либо загрузить файл справа.
                </p>
              </div>
              <div className="md:w-1/2">
                <ImageUpload
                  value={editCoverImage}
                  onChange={url => setEditCoverImage(url)}
                  label="Загрузить файл обложки"
                />
              </div>
            </div>
          </div>
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

