import { COURSE_CATEGORIES } from '@/shared/constants/courseCategories'
import { CourseLevel } from '@/shared/types/course'
import { Button, Input } from '@/shared/ui'
import { PlusCircle, AlertCircle, CheckCircle2 } from 'lucide-react'
import { FormState } from '@/pages/AdminCoursesPage/AdminCoursesPage'


type CourseFormCreatingProps = {
  form: FormState
  formError: string | null
  formSuccess: string | null
  fieldErrors: Record<string, string>
  isCreating: boolean
  levels: CourseLevel[]
  handleSubmit: (e: React.FormEvent) => void
  handleChange: (field: keyof FormState, value: string) => void
  validateField: (field: keyof FormState) => void
}

export const CourseFormCreating = ({
  form, formError, formSuccess, fieldErrors, isCreating, levels, handleSubmit, handleChange, validateField,
}: CourseFormCreatingProps) => {
  return (
    <div className="rounded-2xl glass-card p-6 backdrop-blur-xl">
      <div className="mb-4 flex items-center gap-2">
        <PlusCircle className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-semibold text-foreground">Создать новый курс</h2>
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
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            Название курса *
          </label>
          <Input
            value={form.title}
            onChange={(e) => handleChange('title', e.target.value)}
            onBlur={() => validateField('title')}
            placeholder="Например: Английский язык — уровень A2"
            required
          />
          {fieldErrors.title && (
            <p className="text-xs text-red-600 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {fieldErrors.title}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            Краткое описание
          </label>
          <textarea
            value={form.shortDescription}
            onChange={(e) => handleChange('shortDescription', e.target.value)}
            onBlur={() => validateField('shortDescription')}
            placeholder="Кратко опишите курс для каталога"
            className="min-h-[70px] w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary scroll-soft"
          />
          {fieldErrors.shortDescription && (
            <p className="text-xs text-red-600 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {fieldErrors.shortDescription}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            Полное описание *
          </label>
          <textarea
            value={form.description}
            onChange={(e) => handleChange('description', e.target.value)}
            onBlur={() => validateField('description')}
            placeholder="Подробно опишите содержание курса (минимум 50 символов)"
            className="min-h-[140px] w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary scroll-soft"
            required
          />
          <p className="text-xs text-muted-foreground">
            {form.description.length} / 50 символов (минимум)
          </p>
          {fieldErrors.description && (
            <p className="text-xs text-red-600 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {fieldErrors.description}
            </p>
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Уровень *</label>
            <select
              value={form.level}
              onChange={(e) => handleChange('level', e.target.value as CourseLevel)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            >
              {levels.map((lvl) => (
                <option key={lvl} value={lvl}>
                  {lvl}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Язык</label>
            <Input
              value={form.language}
              onChange={(e) => handleChange('language', e.target.value)}
              placeholder="Английский"
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Категория</label>
            <select
              value={form.category}
              onChange={(e) => handleChange('category', e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="">Выберите категорию</option>
              {COURSE_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Цена (BYN)</label>
            <Input
              type="number"
              min="0"
              step="0.01"
              value={form.priceInput}
              onChange={(e) => handleChange('priceInput', e.target.value)}
              placeholder="0 — бесплатный"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            Обложка (URL)
          </label>
          <Input
            value={form.coverImage}
            onChange={(e) => handleChange('coverImage', e.target.value)}
            placeholder="https://example.com/cover.jpg"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            Теги (через запятую) *
          </label>
          <Input
            value={form.tagsInput}
            onChange={(e) => handleChange('tagsInput', e.target.value)}
            onBlur={() => validateField('tagsInput')}
            placeholder="английский, грамматика, A2"
            required
          />
          <p className="text-xs text-muted-foreground">
            Минимум 1 тег, максимум 10
          </p>
          {fieldErrors.tagsInput && (
            <p className="text-xs text-red-600 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {fieldErrors.tagsInput}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            Что изучит студент (с новой строки) *
          </label>
          <textarea
            value={form.learningOutcomesInput}
            onChange={(e) => handleChange('learningOutcomesInput', e.target.value)}
            onBlur={() => validateField('learningOutcomesInput')}
            placeholder="Базовая грамматика A2&#10;1000+ новых слов&#10;Навыки общения"
            className="min-h-[100px] w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary scroll-soft"
            required
          />
          <p className="text-xs text-muted-foreground">
            Минимум 1 пункт (минимум 10 символов каждый)
          </p>
          {fieldErrors.learningOutcomesInput && (
            <p className="text-xs text-red-600 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {fieldErrors.learningOutcomesInput}
            </p>
          )}
        </div>

        <div className="pt-2">
          <Button type="submit" disabled={isCreating} className="w-full md:w-auto">
            {isCreating ? 'Создание...' : 'Создать курс'}
          </Button>
        </div>
      </form>
    </div>
  )
}