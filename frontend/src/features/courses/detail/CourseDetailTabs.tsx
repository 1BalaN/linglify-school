import { Clock } from 'lucide-react'
import type { Course } from '@/shared/types/course'
import type { ReactNode } from 'react'

interface CourseDetailTabsProps {
  course: Course
  activeTab: 'overview' | 'lessons' | 'reviews'
  onTabChange: (tab: 'overview' | 'lessons' | 'reviews') => void
  reviewsTab: ReactNode
}

function formatDuration(seconds: number | null): string | null {
  if (!seconds) return null
  const totalMins = Math.floor(seconds / 60)
  const hours = Math.floor(totalMins / 60)
  const mins = totalMins % 60
  if (hours === 0) return `${totalMins} мин`
  return mins > 0 ? `${hours} ч ${mins} мин` : `${hours} ч`
}

export const CourseDetailTabs = ({
  course,
  activeTab,
  onTabChange,
  reviewsTab,
}: CourseDetailTabsProps) => (
  <div className="container mx-auto max-w-7xl px-4 py-8">
    {/* Tabs */}
    <div className="mb-8 flex gap-4 border-b border-gray-200 dark:border-gray-700">
      <button
        onClick={() => onTabChange('overview')}
        className={`px-4 py-3 font-medium transition-colors ${
          activeTab === 'overview'
            ? 'border-b-2 border-cyan-600 text-cyan-600 dark:text-cyan-400'
            : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
        }`}
      >
        Описание
      </button>
      <button
        onClick={() => onTabChange('lessons')}
        className={`px-4 py-3 font-medium transition-colors ${
          activeTab === 'lessons'
            ? 'border-b-2 border-cyan-600 text-cyan-600 dark:text-cyan-400'
            : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
        }`}
      >
        Программа курса
      </button>
      <button
        onClick={() => onTabChange('reviews')}
        className={`px-4 py-3 font-medium transition-colors ${
          activeTab === 'reviews'
            ? 'border-b-2 border-cyan-600 text-cyan-600 dark:text-cyan-400'
            : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
        }`}
      >
        Отзывы ({course.reviewsCount})
      </button>
    </div>

    {/* Tab Content */}
    <div className="max-w-4xl">
      {activeTab === 'overview' && (
        <div className="space-y-8 rounded-2xl border border-border bg-card p-6">
      
          {/* Описание */}
          <div className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">
              О курсе
            </h2>
            <p className="whitespace-pre-wrap leading-relaxed text-foreground/80">
              {course.description}
            </p>
          </div>

          {/* Learning outcomes */}
          {course.learningOutcomes.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">
                Что вы изучите
              </h3>

              <ul className="grid gap-3 sm:grid-cols-2">
                {course.learningOutcomes.map((outcome, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-2 rounded-xl bg-muted/40 p-3 text-sm text-foreground/80"
                  >
                    <span className="mt-1 h-2 w-2 rounded-full bg-primary" />
                    {outcome}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Prerequisites */}
          {course.prerequisites.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">
                Требования
              </h3>

              <ul className="space-y-2">
                {course.prerequisites.map((prereq, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-2 text-sm text-muted-foreground"
                  >
                    <span className="mt-1 h-2 w-2 rounded-full bg-amber-400" />
                    {prereq}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {activeTab === 'lessons' && (
        <div className="space-y-4">
          {course.lessons && course.lessons.length > 0 ? (
            course.lessons.map(lesson => (
              <div
                key={lesson.id}
                className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="mb-1 flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Урок {lesson.order}
                      </span>
                    </div>
                    <h3 className="mb-1 text-lg font-semibold text-gray-900 dark:text-white">
                      {lesson.title}
                    </h3>
                    {lesson.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {lesson.description}
                      </p>
                    )}
                  </div>
                  {lesson.duration && (
                    <div className="ml-4 flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                      <Clock className="h-4 w-4" />
                      <span>{formatDuration(lesson.duration)}</span>
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-600 dark:text-gray-400">
              Уроки пока не добавлены
            </p>
          )}
        </div>
      )}

      {activeTab === 'reviews' && reviewsTab}
    </div>
  </div>
)

