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
import i18n from '@/shared/i18n/config'
import { useTranslation } from 'react-i18next'


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
  requireFinalTestForCertificate: boolean
  minProgressForCertificate: number
}

const initialFormState: FormState = {
  title: '',
  shortDescription: '',
  description: '',
  level: 'A1',
  language: '',
  category: '',
  priceInput: '0',
  coverImage: '',
  previewVideo: '',
  tagsInput: '',
  learningOutcomesInput: '',
  prerequisitesInput: '',
  requireFinalTestForCertificate: true,
  minProgressForCertificate: 100,
}

export const AdminCoursesPage = () => {
  const { t } = useTranslation('platform')
  const navigate = useNavigate()
  const user = useSelector((state: RootState) => state.auth.user)
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated)

  const isTeacherOrAdmin = user?.role === 'TEACHER' || user?.role === 'ADMIN'

  const [form, setForm] = useState<FormState>(() => ({
    ...initialFormState,
    language: i18n.t('defaults.teachingLanguage', { ns: 'platform' }),
  }))
  const [formError, setFormError] = useState<string | null>(null)
  const [formSuccess, setFormSuccess] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const [createCourse, { isLoading: isCreating }] = useCreateCourseMutation()
  const [filters, setFilters] = useState<GetCoursesQuery>(() => {
    if (isTeacherOrAdmin && user?.role === 'TEACHER') {
      return {
        ...initialFilters,
        teacherId: user.id,
      }
    }
    return initialFilters
  })
  const { data: coursesData, isLoading: isCoursesLoading, refetch } =
    useGetCoursesQuery(filters)

  useEffect(() => {
    if(!isAuthenticated && !user) {
      navigate('/login')
    }
  }, [isAuthenticated, user, navigate])

  const courses = useMemo(
    () => (coursesData?.data || []) as Course[],
    [coursesData]
  )
  const pagination = coursesData?.pagination

  const handleChange = useCallback(
    (field: keyof FormState, value: string | boolean | number) => {
      setForm(prev => ({ ...prev, [field]: value }))
    },
    []
  )

  const validators: Partial<
    Record<keyof FormState, (value: string) => string | undefined>
  > = useMemo(
    () => ({
      title: v => validateCourseTitle(v).error,
      description: v => validateCourseDescription(v).error,
      shortDescription: v => validateShortDescription(v).error,
      coverImage: v =>
        v.trim() ? validateUrl(v, t('admin.courses.validateFieldImage')).error : '',
      previewVideo: v =>
        v.trim() ? validateUrl(v, t('admin.courses.validateFieldVideo')).error : '',
      priceInput: v => validatePrice(v).error,
      tagsInput: v => (v.trim() ? validateTags(v).error : ''),
      learningOutcomesInput: v =>
        v.trim() ? validateLearningOutcomes(v).error : '',
    }),
    [t],
  )

  const validateField = (field: keyof FormState) => {
    const validator = validators[field]
    if (!validator) return

    const error = validator(form[field] as string) || ''
    setFieldErrors(prev => ({ ...prev, [field]: error }))
  }

  const resetForm = () => {
    setForm({
      ...initialFormState,
      language: i18n.t('defaults.teachingLanguage', { ns: 'platform' }),
    })
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
      language: form.language.trim() || i18n.t('defaults.teachingLanguage', { ns: 'platform' }),
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
      requireFinalTestForCertificate: form.requireFinalTestForCertificate,
      minProgressForCertificate: form.minProgressForCertificate,
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)
    setFormSuccess(null)

    const validation = validateCourse(form)
    if (!validation.isValid) {
      setFormError(validation.error || t('admin.courses.validationError'))
      return
    }

    try {
      const result = await createCourse(buildDto()).unwrap()
      setFormSuccess(t('admin.courses.createSuccess'))
      resetForm()
      refetch()

      setTimeout(() => {
        const id = result?.data?.id
        if (id) navigate(`/courses/${id}`)
      }, 1200)
    } catch (error) {
      const err = error as { data?: { message?: string } }
      setFormError(err?.data?.message || t('admin.courses.createError'))
    }
    
  }

  const handlePageChange = (page: number) => {
    if (!pagination) return
    const nextPage = Math.min(Math.max(1, page), pagination.totalPages)
    setFilters(prev => ({ ...prev, page: nextPage }))
  }

  if (!isTeacherOrAdmin) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gradient-to-br from-red-50 via-background to-orange-50 dark:from-red-950 dark:via-background dark:to-orange-950">
        <div className="glass-card max-w-md text-center p-8">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10">
            <AlertCircle className="h-6 w-6 text-red-500" />
          </div>
          <h1 className="mb-2 text-2xl font-bold text-foreground">{t('admin.courses.accessDenied')}</h1>
          <p className="mb-6 text-muted-foreground">
            {t('admin.courses.accessDeniedBody')}
          </p>
          <Button onClick={() => navigate('/')}>{t('admin.courses.home')}</Button>
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
              <h1 className="text-3xl font-bold text-gradient">{t('admin.courses.title')}</h1>
              <p className="text-muted-foreground">
                {t('admin.courses.subtitle')}
              </p>
            </div>
          </div>
          <Button variant="outline" onClick={() => navigate('/courses')}>
            {t('admin.courses.toCatalog')}
          </Button>
        </div>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,2fr),minmax(0,3fr)]">
          {/* Create course form */}
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

          {/* Course list */}
          <AdminCoursesList
            courses={courses}
            isCoursesLoading={isCoursesLoading}
            pagination={pagination}
            onPageChange={handlePageChange}
          />
        </div>
      </div>
    </div>
  )
}
