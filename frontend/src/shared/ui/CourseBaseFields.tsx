import { ChevronDown, AlertCircle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Input, ImageUpload } from '@/shared/ui'
import { COURSE_CATEGORY_DEFS } from '@/shared/constants/courseCategories'
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
  const { t } = useTranslation('platform')
  const { t: tCourse } = useTranslation('courses')
  const b = (k: string) => t(`sharedUi.courseBase.${k}`)
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">{b('title')}</label>
        <Input
          value={values.title}
          onChange={e => onChange('title', e.target.value)}
          onBlur={() => onBlur?.('title')}
          placeholder={b('titlePh')}
        />
        {errors.title && (
          <p className="flex items-center gap-1 text-xs text-red-600">
            <AlertCircle className="h-3 w-3" />
            {errors.title}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">{b('shortDesc')}</label>
        <Input
          value={values.shortDescription}
          onChange={e => onChange('shortDescription', e.target.value)}
          onBlur={() => onBlur?.('shortDescription')}
          placeholder={b('shortDescPh')}
        />
        {errors.shortDescription && (
          <p className="flex items-center gap-1 text-xs text-red-600">
            <AlertCircle className="h-3 w-3" />
            {errors.shortDescription}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">{b('fullDesc')}</label>
        <textarea
          value={values.description}
          onChange={e => onChange('description', e.target.value)}
          onBlur={() => onBlur?.('description')}
          placeholder={b('fullDescPh')}
          className="min-h-[120px] w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary scroll-soft"
        />
        <p className="text-xs text-muted-foreground">
          {t('sharedUi.courseBase.charCount', { n: values.description.length })}
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
          <label className="text-sm font-medium text-foreground">{b('level')}</label>
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
          <label className="text-sm font-medium text-foreground">{b('teachingLanguage')}</label>
          <Input
            value={values.language}
            onChange={e => onChange('language', e.target.value)}
            placeholder={b('teachingLanguagePh')}
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">{b('category')}</label>
          <div className="relative group">
            <select
              value={values.category}
              onChange={e => onChange('category', e.target.value)}
              className="w-full appearance-none rounded-lg border border-border bg-background px-3 py-2 pr-9 text-sm text-foreground shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="">{b('categoryPlaceholder')}</option>
              {COURSE_CATEGORY_DEFS.map(({ value, labelKey }) => (
                <option key={value} value={value}>
                  {tCourse(labelKey)}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-transform duration-200 group-focus-within:rotate-180" />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            {t('sharedUi.courseBase.price', { currency })}
          </label>
          <Input
            type="number"
            min="0"
            step="0.01"
            value={values.priceInput}
            onChange={e => onChange('priceInput', e.target.value)}
            placeholder={b('pricePh')}
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">{b('coverTitle')}</label>
        <div className="rounded-xl border border-border bg-background/40 p-3 md:p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-start">
            <div className="space-y-1 md:w-1/2">
              <span className="text-[11px] font-medium text-muted-foreground">
                {b('coverUrlLabel')}
              </span>
              <Input
                value={values.coverImage}
                onChange={e => onChange('coverImage', e.target.value)}
                placeholder="https://example.com/cover.jpg"
              />
              <p className="text-[11px] text-muted-foreground">
                {b('coverUrlHint')}
              </p>
            </div>
            <div className="md:w-1/2">
              <ImageUpload
                value={values.coverImage}
                onChange={url => onChange('coverImage', url)}
                label={b('coverUploadLabel')}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
