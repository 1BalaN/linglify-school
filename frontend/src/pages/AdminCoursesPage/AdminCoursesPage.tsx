import { useEffect,useState, useMemo, useCallback } from 'react'
import { useSelector } from 'react-redux'
import type { RootState } from '@/app/store'
import { useCreateCourseMutation, useGetCoursesQuery } from '@/entities/course'
import type {
  CourseLevel,
  CreateCourseDto,
  GetCoursesQuery,
  Course,
} from '@/shared/types/course'
import { Button } from '@/shared/ui'
import { BookOpen, AlertCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import {
  validateCourse,
  validateCourseTitle,
  validateCourseDescription,
  validateShortDescription,
  validateUrl,
  validatePrice,
  validateTags,
  validateLearningOutcomes,
} from '@/shared/lib/validation'
import { AdminCoursesList, CourseFormCreating } from '@/features/admin/courses'


const levels: CourseLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']

const initialFilters: GetCoursesQuery = {
  page: 1,
  limit: 10,
  sortBy: 'createdAt',
  order: 'desc',
}

export type FormState = {
  title: string
  shortDescription: string
  description: string
  level: CourseLevel
  language: string
  category: string
  priceInput: string
  coverImage: string
  previewVideo: string
  tagsInput: string
  learningOutcomesInput: string
  prerequisitesInput: string
}

const initialFormState: FormState = {
  title: '',
  shortDescription: '',
  description: '',
  level: 'A1',
  language: 'Английский',
  category: '',
  priceInput: '0',
  coverImage: '',
  previewVideo: '',
  tagsInput: '',
  learningOutcomesInput: '',
  prerequisitesInput: '',
}

export const AdminCoursesPage = () => {
  const navigate = useNavigate()
  const user = useSelector((state: RootState) => state.auth.user)
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated)

  const isTeacherOrAdmin = user?.role === 'TEACHER' || user?.role === 'ADMIN'

  const [form, setForm] = useState<FormState>(initialFormState)
  const [formError, setFormError] = useState<string | null>(null)
  const [formSuccess, setFormSuccess] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const [createCourse, { isLoading: isCreating }] = useCreateCourseMutation()
  const { data: coursesData, isLoading: isCoursesLoading, refetch } =useGetCoursesQuery(initialFilters)

  useEffect(() => {
    if(!isAuthenticated && !user) {
      navigate('/login')
    }
  }, [isAuthenticated, user, navigate])

  const courses = useMemo(() => (coursesData?.data || []) as Course[], [coursesData])

  const handleChange = useCallback(
    (field: keyof FormState, value: string) => {
      setForm(prev => ({ ...prev, [field]: value }))
    },
    []
  )

  const validators: Partial<
    Record<keyof FormState, (value: string) => string | undefined>
  > = {
    title: v => validateCourseTitle(v).error,
    description: v => validateCourseDescription(v).error,
    shortDescription: v => validateShortDescription(v).error,
    coverImage: v => (v.trim() ? validateUrl(v, 'Изображение').error : ''),
    previewVideo: v => (v.trim() ? validateUrl(v, 'Видео').error : ''),
    priceInput: v => validatePrice(v).error,
    tagsInput: v => (v.trim() ? validateTags(v).error : ''),
    learningOutcomesInput: v =>
      v.trim() ? validateLearningOutcomes(v).error : '',
  }

  const validateField = (field: keyof FormState) => {
    const validator = validators[field]
    if (!validator) return

    const error = validator(form[field]) || ''
    setFieldErrors(prev => ({ ...prev, [field]: error }))
  }

  const resetForm = () => {
    setForm(initialFormState)
    setFieldErrors({})
  }

  const buildDto = (): CreateCourseDto => {
    const price = form.priceInput.trim()
      ? Math.round(Number(form.priceInput.replace(',', '.')) * 100)
      : 0

    return {
      title: form.title.trim(),
      description: form.description.trim(),
      shortDescription: form.shortDescription.trim() || undefined,
      level: form.level,
      language: form.language.trim() || 'Английский',
      category: form.category.trim() || undefined,
      coverImage: form.coverImage.trim() || undefined,
      previewVideo: form.previewVideo.trim() || undefined,
      duration: undefined,
      price,
      currency: 'BYN',
      tags: form.tagsInput.split(',').map(t => t.trim()).filter(Boolean),
      learningOutcomes: form.learningOutcomesInput
        .split('\n')
        .map(l => l.trim())
        .filter(Boolean),
      prerequisites: form.prerequisitesInput
        .split('\n')
        .map(p => p.trim())
        .filter(Boolean),
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)
    setFormSuccess(null)

    const validation = validateCourse(form)
    if (!validation.isValid) {
      setFormError(validation.error || 'Ошибка валидации')
      return
    }

    try {
      const result = await createCourse(buildDto()).unwrap()
      setFormSuccess('Курс успешно создан!')
      resetForm()
      refetch()

      setTimeout(() => {
        const id = result?.data?.id
        if (id) navigate(`/courses/${id}`)
      }, 1200)
    } catch (error) {
      const err = error as { data?: { message?: string } }
      setFormError(err?.data?.message || 'Не удалось создать курс.')
    }
    
  }

  if (!isTeacherOrAdmin) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gradient-to-br from-red-50 via-background to-orange-50 dark:from-red-950 dark:via-background dark:to-orange-950">
        <div className="glass-card max-w-md text-center p-8">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10">
            <AlertCircle className="h-6 w-6 text-red-500" />
          </div>
          <h1 className="mb-2 text-2xl font-bold text-foreground">Доступ запрещён</h1>
          <p className="mb-6 text-muted-foreground">
            Только преподаватели и администраторы могут управлять курсами.
          </p>
          <Button onClick={() => navigate('/')}>На главную</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-primary/5 via-background to-secondary/5 py-8">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/30">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gradient">Управление курсами</h1>
              <p className="text-muted-foreground">
                Создавайте и управляйте своими курсами
              </p>
            </div>
          </div>
          <Button variant="outline" onClick={() => navigate('/courses')}>
            Перейти в каталог
          </Button>
        </div>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,2fr),minmax(0,3fr)]">
          {/* Форма создания курса */}
          <CourseFormCreating 
            formError={formError} 
            formSuccess={formSuccess} 
            handleSubmit={handleSubmit} 
            handleChange={handleChange} 
            form={form} 
            validateField={validateField} 
            fieldErrors={fieldErrors} 
            isCreating={isCreating} 
            levels={levels} 
          />

          {/* Список курсов */}
          <AdminCoursesList courses={courses} isCoursesLoading={isCoursesLoading} />
        </div>
      </div>
    </div>
  )
}
