import { ChevronDown, AlertCircle } from 'lucide-react'
import { Input, ImageUpload } from '@/shared/ui'
import { COURSE_CATEGORIES } from '@/shared/constants/courseCategories'
import type { CourseLevel } from '@/shared/types/course'

export interface CourseBaseValues {
  title: string
  shortDescription: string
  description: string
  level: CourseLevel
  language: string
  category: string
  priceInput: string
  coverImage: string
}

export interface CourseBaseErrors {
  title?: string
  shortDescription?: string
  description?: string
}

interface CourseBaseFieldsProps {
  values: CourseBaseValues
  errors?: CourseBaseErrors
  levels: CourseLevel[]
  currency?: string
  onChange: (field: keyof CourseBaseValues, value: string) => void
  onBlur?: (field: keyof CourseBaseValues) => void
}

export const CourseBaseFields = ({
  values,
  errors = {},
  levels,
  currency = 'BYN',
  onChange,
  onBlur,
}: CourseBaseFieldsProps) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Название *</label>
        <Input
          value={values.title}
          onChange={e => onChange('title', e.target.value)}
          onBlur={() => onBlur?.('title')}
          placeholder="Например: Английский язык — уровень A2"
        />
        {errors.title && (
          <p className="flex items-center gap-1 text-xs text-red-600">
            <AlertCircle className="h-3 w-3" />
            {errors.title}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Краткое описание</label>
        <Input
          value={values.shortDescription}
          onChange={e => onChange('shortDescription', e.target.value)}
          onBlur={() => onBlur?.('shortDescription')}
          placeholder="Кратко опишите курс для каталога"
        />
        {errors.shortDescription && (
          <p className="flex items-center gap-1 text-xs text-red-600">
            <AlertCircle className="h-3 w-3" />
            {errors.shortDescription}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Полное описание *</label>
        <textarea
          value={values.description}
          onChange={e => onChange('description', e.target.value)}
          onBlur={() => onBlur?.('description')}
          placeholder="Подробно опишите содержание курса (минимум 50 символов)"
          className="min-h-[120px] w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary scroll-soft"
        />
        <p className="text-xs text-muted-foreground">
          {values.description.length} / 50 символов (минимум)
        </p>
        {errors.description && (
          <p className="flex items-center gap-1 text-xs text-red-600">
            <AlertCircle className="h-3 w-3" />
            {errors.description}
          </p>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Уровень *</label>
          <div className="relative group">
            <select
              value={values.level}
              onChange={e => onChange('level', e.target.value as CourseLevel)}
              className="w-full appearance-none rounded-lg border border-border bg-background px-3 py-2 pr-9 text-sm text-foreground shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            >
              {levels.map(lvl => (
                <option key={lvl} value={lvl}>
                  {lvl}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-transform duration-200 group-focus-within:rotate-180" />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Язык обучения</label>
          <Input
            value={values.language}
            onChange={e => onChange('language', e.target.value)}
            placeholder="Английский"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Категория</label>
          <div className="relative group">
            <select
              value={values.category}
              onChange={e => onChange('category', e.target.value)}
              className="w-full appearance-none rounded-lg border border-border bg-background px-3 py-2 pr-9 text-sm text-foreground shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="">Выберите категорию</option>
              {COURSE_CATEGORIES.map(cat => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-transform duration-200 group-focus-within:rotate-180" />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Цена ({currency})</label>
          <Input
            type="number"
            min="0"
            step="0.01"
            value={values.priceInput}
            onChange={e => onChange('priceInput', e.target.value)}
            placeholder="0 — бесплатный"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Обложка курса</label>
        <div className="rounded-xl border border-border bg-background/40 p-3 md:p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-start">
            <div className="space-y-1 md:w-1/2">
              <span className="text-[11px] font-medium text-muted-foreground">
                Ссылка на изображение
              </span>
              <Input
                value={values.coverImage}
                onChange={e => onChange('coverImage', e.target.value)}
                placeholder="https://example.com/cover.jpg"
              />
              <p className="text-[11px] text-muted-foreground">
                Можно указать прямую ссылку на картинку либо загрузить файл справа.
              </p>
            </div>
            <div className="md:w-1/2">
              <ImageUpload
                value={values.coverImage}
                onChange={url => onChange('coverImage', url)}
                label="Загрузить файл обложки"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
