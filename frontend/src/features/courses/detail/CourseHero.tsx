import { ChevronRight, Clock, BookOpen, Users, Star, Check, Edit, Play, Loader2 } from 'lucide-react'
import { Button } from '@/shared/ui'
import type { Course } from '@/shared/types/course'

interface CourseHeroProps {
  course: Course
  canEdit: boolean
  isEnrolling: boolean
  onBackToCatalog: () => void
  onManageLessons: () => void
  onContinueLearning: () => void
  onEnroll: () => void
}

function formatDuration(seconds: number | null): string | null {
  if (!seconds) return null
  const totalMins = Math.floor(seconds / 60)
  const hours = Math.floor(totalMins / 60)
  const mins = totalMins % 60
  if (hours === 0) return `${totalMins} мин`
  return mins > 0 ? `${hours} ч ${mins} мин` : `${hours} ч`
}

function formatPrice(price: number, currency: string): string {
  if (price === 0) return 'Бесплатно'
  return `${(price / 100).toFixed(2)} ${currency}`
}

export const CourseHero = ({
  course,
  canEdit,
  isEnrolling,
  onBackToCatalog,
  onManageLessons,
  onContinueLearning,
  onEnroll,
}: CourseHeroProps) => (
  <div className="relative bg-gradient-to-r from-cyan-500 to-blue-600 dark:from-cyan-600 dark:to-blue-700 py-12">
    <div className="container mx-auto max-w-7xl px-4">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Course Info */}
        <div className="lg:col-span-2">
          {/* Breadcrumb */}
          <div className="mb-4 flex items-center gap-2 text-white/80">
            <button onClick={onBackToCatalog} className="hover:text-white">
              Курсы
            </button>
            <ChevronRight className="h-4 w-4" />
            <span className="text-white">{course.title}</span>
          </div>

          <h1 className="mb-4 text-4xl font-bold text-white">{course.title}</h1>

          <p className="mb-6 text-xl text-white/90">
            {course.shortDescription || course.description.slice(0, 200)}
          </p>

          {/* Stats */}
          <div className="flex flex-wrap items-center gap-6 text-white/90">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-white/20 px-3 py-1 text-sm font-semibold">
                {course.level}
              </span>
            </div>

            {course.averageRating && (
              <div className="flex items-center gap-1">
                <Star className="h-5 w-5 fill-yellow-300 text-yellow-300" />
                <span className="font-semibold">
                  {course.averageRating.toFixed(1)}
                </span>
                <span>({course.reviewsCount})</span>
              </div>
            )}

            <div className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              <span>{course.enrolledCount} студентов</span>
            </div>

            {course.duration && (
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                <span>{formatDuration(course.duration)}</span>
              </div>
            )}

            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              <span>{course.lessonsCount} уроков</span>
            </div>
          </div>

          {/* Teacher */}
          <div className="mt-6 flex items-center gap-3">
            {course.teacher.avatar ? (
              <img
                src={course.teacher.avatar}
                alt={course.teacher.firstName || 'Teacher'}
                className="h-12 w-12 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 text-white font-semibold">
                {course.teacher.firstName?.[0] ||
                  course.teacher.email[0].toUpperCase()}
              </div>
            )}
            <div>
              <p className="text-sm text-white/70">Преподаватель</p>
              <p className="font-semibold text-white">
                {course.teacher.firstName && course.teacher.lastName
                  ? `${course.teacher.firstName} ${course.teacher.lastName}`
                  : course.teacher.email}
              </p>
            </div>
          </div>
        </div>

        {/* Enrollment Card */}
        <div className="lg:col-span-1">
          <div className="rounded-xl bg-white p-6 shadow-2xl dark:bg-gray-800">
            {course.coverImage && (
              <img
                src={course.coverImage}
                alt={course.title}
                className="mb-4 h-48 w-full rounded-lg object-cover"
              />
            )}

            <div className="mb-6 text-center">
              <div className="mb-2 text-4xl font-bold text-cyan-600 dark:text-cyan-400">
                {formatPrice(course.price, course.currency)}
              </div>
            </div>

            {canEdit ? (
              <Button onClick={onManageLessons} className="w-full" size="lg">
                <Edit className="mr-2 h-5 w-5" />
                Управление уроками
              </Button>
            ) : course.isEnrolled ? (
              <Button
                onClick={onContinueLearning}
                className="w-full"
                size="lg"
              >
                <Play className="mr-2 h-5 w-5" />
                Продолжить обучение
              </Button>
            ) : (
              <Button
                onClick={onEnroll}
                disabled={isEnrolling}
                className="w-full"
                size="lg"
              >
                {isEnrolling ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Запись...
                  </>
                ) : (
                  'Записаться на курс'
                )}
              </Button>
            )}

            {/* What's included */}
            <div className="mt-6 space-y-3">
              <p className="font-semibold text-gray-900 dark:text-white">
                Что включено:
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                  <Check className="h-5 w-5 text-green-500" />
                  <span>Видео уроки</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                  <Check className="h-5 w-5 text-green-500" />
                  <span>Практические задания</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                  <Check className="h-5 w-5 text-green-500" />
                  <span>Доступ навсегда</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                  <Check className="h-5 w-5 text-green-500" />
                  <span>Сертификат по окончании</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
)

