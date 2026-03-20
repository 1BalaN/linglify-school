import { useState } from 'react'
import { Save, X } from 'lucide-react'
import { Button, CourseBaseFields, CourseCertificateFields } from '@/shared/ui'
import type { CourseBaseValues } from '@/shared/ui/CourseBaseFields'
import type { CourseCertificateValues } from '@/shared/ui/CourseCertificateFields'
import { useUpdateCourseMutation } from '@/entities/course'
import type { Course, CourseLevel } from '@/shared/types/course'

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
    | 'requireFinalTestForCertificate'
    | 'minProgressForCertificate'
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

  const [values, setValues] = useState<CourseBaseValues>({
    title: course.title,
    shortDescription: course.shortDescription || '',
    description: course.description,
    level: course.level,
    language: course.language,
    coverImage: course.coverImage || '',
    category: course.category || '',
    priceInput: course.price ? (course.price / 100).toString() : '0',
  })

  const [certValues, setCertValues] = useState<CourseCertificateValues>({
    requireFinalTestForCertificate: course.requireFinalTestForCertificate,
    minProgressForCertificate: course.minProgressForCertificate,
  })

  const handleChange = (field: keyof CourseBaseValues, value: string) => {
    setValues(prev => ({ ...prev, [field]: value }))
  }

  const handleCertChange = (field: keyof CourseCertificateValues, value: boolean | number) => {
    setCertValues(prev => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    if (!values.title.trim()) {
      onError('Введите название курса')
      return
    }

    const normalizedPrice = values.priceInput.trim()
      ? Math.round(Number(values.priceInput.replace(',', '.')) * 100)
      : 0

    if (Number.isNaN(normalizedPrice) || normalizedPrice < 0) {
      onError('Введите корректную цену')
      return
    }

    try {
      await updateCourse({
        id: course.id,
        data: {
          title: values.title.trim(),
          description: values.description.trim(),
          shortDescription: values.shortDescription.trim() || undefined,
          level: values.level,
          language: values.language.trim(),
          coverImage: values.coverImage.trim() || undefined,
          category: values.category.trim() || undefined,
          price: normalizedPrice,
          requireFinalTestForCertificate: certValues.requireFinalTestForCertificate,
          minProgressForCertificate: certValues.minProgressForCertificate,
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
    <div className="mb-6 glass-card rounded-md p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Редактирование курса</h2>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <CourseBaseFields
        values={values}
        levels={LEVELS}
        currency={course.currency}
        onChange={handleChange}
      />

      <CourseCertificateFields
        values={certValues}
        onChange={handleCertChange}
      />

      <div className="flex gap-2">
        <Button onClick={handleSave} disabled={isLoading}>
          <Save className="mr-2 h-4 w-4" />
          {isLoading ? 'Сохранение…' : 'Сохранить'}
        </Button>
        <Button variant="outline" onClick={onClose}>
          Отмена
        </Button>
      </div>
    </div>
  )
}
