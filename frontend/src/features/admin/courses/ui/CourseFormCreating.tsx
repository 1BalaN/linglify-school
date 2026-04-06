import { useTranslation } from 'react-i18next'
import { AlertCircle, CheckCircle2, PlusCircle } from 'lucide-react'
import { Button, Input, CourseBaseFields, CourseCertificateFields } from '@/shared/ui'
import type { CourseBaseValues, CourseBaseErrors } from '@/shared/ui/CourseBaseFields'
import type { CourseLevel } from '@/shared/types/course'
import type { FormState } from '@/pages/AdminCoursesPage/AdminCoursesPage'

type CourseFormCreatingProps = {
  form: FormState
  formError: string | null
  formSuccess: string | null
  fieldErrors: Record<string, string>
  isCreating: boolean
  levels: CourseLevel[]
  handleSubmit: (e: React.FormEvent) => void
  handleChange: (field: keyof FormState, value: string | boolean | number) => void
  validateField: (field: keyof FormState) => void
}

export const CourseFormCreating = ({
  form,
  formError,
  formSuccess,
  fieldErrors,
  isCreating,
  levels,
  handleSubmit,
  handleChange,
  validateField,
}: CourseFormCreatingProps) => {
  const { t } = useTranslation('platform', { keyPrefix: 'admin.courseForm' })
  const baseValues: CourseBaseValues = {
    title: form.title,
    shortDescription: form.shortDescription,
    description: form.description,
    level: form.level,
    language: form.language,
    category: form.category,
    priceInput: form.priceInput,
    coverImage: form.coverImage,
  }

  const baseErrors: CourseBaseErrors = {
    title: fieldErrors.title,
    shortDescription: fieldErrors.shortDescription,
    description: fieldErrors.description,
  }

  return (
    <div className="rounded-2xl glass-card p-6 backdrop-blur-xl">
      <div className="mb-4 flex items-center gap-2">
        <PlusCircle className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-semibold text-foreground">{t('title')}</h2>
      </div>

      {formError && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-200">
          <AlertCircle className="h-4 w-4" />
          <span>{formError}</span>
        </div>
      )}
      {formSuccess && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-200">
          <CheckCircle2 className="h-4 w-4" />
          <span>{formSuccess}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <CourseBaseFields
          values={baseValues}
          errors={baseErrors}
          levels={levels}
          onChange={(field, value) => handleChange(field as keyof FormState, value)}
          onBlur={field => validateField(field as keyof FormState)}
        />

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">{t('tagsLabel')}</label>
          <Input
            value={form.tagsInput}
            onChange={e => handleChange('tagsInput', e.target.value)}
            onBlur={() => validateField('tagsInput')}
            placeholder={t('tagsPh')}
            required
          />
          <p className="text-xs text-muted-foreground">{t('tagsHint')}</p>
          {fieldErrors.tagsInput && (
            <p className="flex items-center gap-1 text-xs text-red-600">
              <AlertCircle className="h-3 w-3" />
              {fieldErrors.tagsInput}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">{t('outcomesLabel')}</label>
          <textarea
            value={form.learningOutcomesInput}
            onChange={e => handleChange('learningOutcomesInput', e.target.value)}
            onBlur={() => validateField('learningOutcomesInput')}
            placeholder={t('outcomesPh')}
            className="min-h-[100px] w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary scroll-soft"
            required
          />
          <p className="text-xs text-muted-foreground">{t('outcomesHint')}</p>
          {fieldErrors.learningOutcomesInput && (
            <p className="flex items-center gap-1 text-xs text-red-600">
              <AlertCircle className="h-3 w-3" />
              {fieldErrors.learningOutcomesInput}
            </p>
          )}
        </div>

        <CourseCertificateFields
          values={{
            requireFinalTestForCertificate: form.requireFinalTestForCertificate,
            minProgressForCertificate: form.minProgressForCertificate,
          }}
          onChange={(field, value) => handleChange(field, value)}
        />

        <div className="pt-2">
          <Button type="submit" disabled={isCreating} className="w-full md:w-auto">
            {isCreating ? t('creating') : t('create')}
          </Button>
        </div>
      </form>
    </div>
  )
}
