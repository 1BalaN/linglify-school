import { Link } from 'react-router-dom'
import { BookOpen, Clock, BarChart2, CheckCircle2, ArrowRight } from 'lucide-react'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/shared/ui'
import type { CourseLevel, Enrollment } from '@/shared/types/course'
import { useGetCourseProgressQuery } from '@/entities/lesson'

interface MyCourseCardProps {
  enrollment: Enrollment & { course?: Enrollment['course'] }
}

const levelKeys = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const

export const MyCourseCard = ({ enrollment }: MyCourseCardProps) => {
  const { t } = useTranslation('platform', { keyPrefix: 'student.myCourses' })
  const { t: tCert } = useTranslation('platform', { keyPrefix: 'certificateUi.levels' })
  const { t: tTime } = useTranslation('platform', { keyPrefix: 'timeDisplay' })
  const course = enrollment.course

  const { data: courseProgress } = useGetCourseProgressQuery(enrollment.courseId, {
    refetchOnMountOrArgChange: true,
  })

  const computedProgress =
    courseProgress?.data.statistics.progress ?? enrollment.progress ?? 0

  const progress = Math.round(computedProgress)
  const isCompleted = progress >= 100

  const lessonsCount =
    course?.lessonsCount ?? (course as { _count?: { lessons?: number } })._count?.lessons ?? 0

  const durationLabel = useMemo(() => {
    if (!course?.duration) return null
    const totalMins = Math.floor(course?.duration / 60)
    const h = Math.floor(totalMins / 60)
    const m = totalMins % 60
    if (h === 0) return tTime('minutes', { n: totalMins })
    return m > 0 ? tTime('hoursMinutes', { h, m }) : tTime('hours', { h })
  }, [course?.duration, tTime])

  const levelLabel =
    levelKeys.includes(course?.level as (typeof levelKeys)[number])
      ? tCert(course?.level as CourseLevel)
      : course?.level
      
  if (!course) return null
  return (
    <div className="glass-card group flex flex-col overflow-hidden rounded-2xl transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg">
      <div className="relative h-44 overflow-hidden bg-gradient-to-br from-cyan-500/20 to-blue-600/20">
        {course.coverImage ? (
          <img
            src={course.coverImage}
            alt={course.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <BookOpen className="h-14 w-14 text-primary/30" />
          </div>
        )}

        <div className="absolute right-3 top-3">
          {isCompleted ? (
            <span className="flex items-center gap-1 rounded-full bg-emerald-500/90 px-2 py-0.5 text-xs font-semibold text-white backdrop-blur-sm">
              <CheckCircle2 className="h-3 w-3" />
              {t('completed')}
            </span>
          ) : progress > 0 ? (
            <span className="flex items-center gap-1 rounded-full bg-primary/90 px-2 py-0.5 text-xs font-semibold text-white backdrop-blur-sm">
              <BarChart2 className="h-3 w-3" />
              {progress}%
            </span>
          ) : (
            <span className="rounded-full bg-background/80 px-2 py-0.5 text-xs text-muted-foreground backdrop-blur-sm">
              {t('notStarted')}
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div>
          <p className="mb-1 text-xs font-medium text-primary">{levelLabel}</p>
          <h3 className="line-clamp-2 text-base font-bold leading-snug text-foreground">
            {course.title}
          </h3>
          {course.shortDescription ? (
            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
              {course.shortDescription}
            </p>
          ) : null}
        </div>

        <div className="flex gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <BookOpen className="h-3.5 w-3.5" />
            {t('lessonsWord', { count: lessonsCount })}
          </span>
          {durationLabel ? (
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {durationLabel}
            </span>
          ) : null}
        </div>

        <div>
          <div className="mb-1 flex items-center justify-between text-xs">
            <span className="text-muted-foreground">{t('progressLabel')}</span>
            <span className="font-semibold text-foreground">{progress}%</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-border">
            <div
              className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="mt-auto pt-2">
          <Link to={`/courses/${course.id}/learn`} className="block">
            <Button variant="primary" size="sm" className="w-full">
              {isCompleted ? (
                <>
                  <CheckCircle2 className="mr-1.5 h-4 w-4" />
                  {t('viewCourse')}
                </>
              ) : progress > 0 ? (
                <>
                  <ArrowRight className="mr-1.5 h-4 w-4" />
                  {t('continue')}
                </>
              ) : (
                <>
                  <ArrowRight className="mr-1.5 h-4 w-4" />
                  {t('start')}
                </>
              )}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
