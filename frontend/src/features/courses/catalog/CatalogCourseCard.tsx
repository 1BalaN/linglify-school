import { Link } from 'react-router-dom'
import { memo } from 'react'
import type { Course } from '@/shared/types/course'
import { Clock, BookOpen, Star, Users } from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface CatalogCourseCardProps {
  course: Course
}

export const CatalogCourseCard = memo(({ course }: CatalogCourseCardProps) => {
  const { t, i18n } = useTranslation('courses')

  const formatPrice = (price: number) => {
    if (price === 0) return t('card.free')
    return `${(price / 100).toFixed(2)} ${course.currency}`
  }

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return null
    const totalMins = Math.floor(seconds / 60)
    const h = Math.floor(totalMins / 60)
    const m = totalMins % 60
    if (h === 0) return `${totalMins} ${t('card.minutes')}`
    return m > 0
      ? `${h} ${t('card.hours')} ${m} ${t('card.minutes')}`
      : `${h} ${t('card.hours')}`
  }

  const getLessonsLabel = (count: number) => {
    if (i18n.language.startsWith('ru')) {
      if (count === 1) return t('card.lesson_one')
      if (count < 5) return t('card.lesson_few')
      return t('card.lesson_many')
    }
    return count === 1 ? t('card.lesson_one') : t('card.lesson_many')
  }

  const levelColors: Record<string, string> = {
    A1: 'bg-emerald-500/90',
    A2: 'bg-emerald-600/90',
    B1: 'bg-blue-500/90',
    B2: 'bg-blue-600/90',
    C1: 'bg-purple-500/90',
    C2: 'bg-purple-700/90',
  }

  return (
    <Link to={`/courses/${course.id}`} className="group block h-full">
      <div className="glass-card h-full overflow-hidden rounded-lg transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/10 flex flex-col">
        {/* Cover */}
        <div className="relative h-44 overflow-hidden bg-gradient-to-br from-cyan-400/20 to-blue-500/20">
          {course.coverImage ? (
            <img
              src={course.coverImage}
              alt={course.title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <BookOpen className="h-14 w-14 text-primary/30" />
            </div>
          )}
          {/* Level */}
          <span
            className={`absolute left-3 top-3 rounded-full px-2.5 py-0.5 text-xs font-bold text-white shadow-sm ${
              levelColors[course.level] || 'bg-primary/90'
            }`}
          >
            {course.level}
          </span>
          {/* Enrolled */}
          {course.isEnrolled && (
            <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-emerald-500/90 px-2.5 py-0.5 text-xs font-semibold text-white backdrop-blur-sm">
              ✓ {t('card.enrolled')}
            </span>
          )}
          {/* Rating overlay */}
          {course.averageRating && (
            <span className="absolute bottom-3 right-3 flex items-center gap-1 rounded-full bg-black/50 px-2 py-0.5 text-xs font-semibold text-white backdrop-blur-sm">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              {course.averageRating.toFixed(1)}
            </span>
          )}
        </div>

        {/* Body */}
        <div className="flex flex-1 flex-col gap-3 p-4">
          <div className="flex-1 space-y-3">
            {/* Title & description */}
            <h3 className="mb-1 min-h-[2.75rem] line-clamp-2 text-base font-bold leading-snug text-foreground transition-colors group-hover:text-primary">
              {course.title}
            </h3>
            <p className="min-h-[2.5rem] line-clamp-2 text-xs text-muted-foreground">
              {course.shortDescription || ' '}
            </p>
            {/* Teacher */}
            <div className="flex min-h-7 items-center gap-2">
              {course.teacher.avatar ? (
                <img
                  src={course.teacher.avatar}
                  alt={course.teacher.firstName || 'T'}
                  className="h-7 w-7 rounded-full object-cover ring-1 ring-border"
                  loading="lazy"
                />
              ) : (
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 text-xs font-bold text-white">
                  {course.teacher.firstName?.[0] ||
                    course.teacher.email[0].toUpperCase()}
                </div>
              )}
              <span className="truncate text-xs text-muted-foreground">
                {course.teacher.firstName && course.teacher.lastName
                  ? `${course.teacher.firstName} ${course.teacher.lastName}`
                  : course.teacher.email}
              </span>
            </div>

            {/* Stats row */}
            <div className="flex min-h-5 flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <BookOpen className="h-3.5 w-3.5" />
                {course.lessonsCount} {getLessonsLabel(course.lessonsCount)}
              </span>
              {course.duration && (
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {formatDuration(course.duration)}
                </span>
              )}
              {course.enrolledCount > 0 && (
                <span className="flex items-center gap-1">
                  <Users className="h-3.5 w-3.5" />
                  {course.enrolledCount}
                </span>
              )}
            </div>
          </div>

          {/* Price */}
          <div className="mt-auto flex items-center justify-between border-t border-border pt-3">
            <span
              className={`text-lg font-bold ${
                course.price === 0
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-primary'
              }`}
            >
              {formatPrice(course.price)}
            </span>
            <span className="rounded-lg bg-primary/10 px-3 py-1 text-xs font-medium text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
              {t('card.details')} →
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
})

CatalogCourseCard.displayName = 'CatalogCourseCard'

