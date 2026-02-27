import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import type { RootState } from '@/app/store'
import { useGetCourseByIdQuery } from '@/entities/course'
import { useGetCourseLessonsQuery } from '@/entities/lesson'
import { useGetMyCertificateByCourseQuery } from '@/entities/certificate'
import { openCertificatePdf } from '@/shared/lib/certificate'
import { Button } from '@/shared/ui'
import { BookOpen, Lock, Loader2 } from 'lucide-react'
import {
  StudentCourseHeader,
  StudentLessonItem,
  StudentCourseProgressSidebar,
} from '@/features/courses/student'

export const StudentCoursePage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const user = useSelector((state: RootState) => state.auth.user)

  const {
    data: courseData,
    isLoading: isCourseLoading,
    isFetching: isCourseFetching,
  } = useGetCourseByIdQuery(id!, {
    refetchOnMountOrArgChange: true,
  })
  const {
    data: lessonsData,
    isLoading: isLessonsLoading,
    isFetching: isLessonsFetching,
  } = useGetCourseLessonsQuery(id!, {
    refetchOnMountOrArgChange: true,
  })

  const { data: certificateData } = useGetMyCertificateByCourseQuery(id!, {
    skip: !id,
  })

  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  const course = courseData?.data
  const lessons = lessonsData?.data || []
  const certificate = certificateData?.data

  if (!user) {
    navigate('/login')
    return null
  }

  if (isCourseLoading || isLessonsLoading || isCourseFetching || isLessonsFetching) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    )
  }

  if (!course) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="mb-2 text-xl font-bold">Курс не найден</h2>
          <Button onClick={() => navigate('/courses')}>Вернуться к курсам</Button>
        </div>
      </div>
    )
  }

  if (!course.isEnrolled) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="glass-card max-w-md rounded-2xl p-8 text-center">
          <Lock className="mx-auto mb-4 h-12 w-12 text-amber-500" />
          <h2 className="mb-2 text-xl font-bold">Доступ закрыт</h2>
          <p className="mb-6 text-muted-foreground">
            Вы не записаны на этот курс. Запишитесь, чтобы начать обучение.
          </p>
          <Button onClick={() => navigate(`/courses/${id}`)}>Записаться</Button>
        </div>
      </div>
    )
  }

  const completedLessons = lessons.filter((l) => l.progress?.isCompleted).length
  const progress = lessons.length > 0 ? (completedLessons / lessons.length) * 100 : 0

  const handleViewCertificate = () => {
    if (!certificate) return
    void openCertificatePdf(certificate.id)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <StudentCourseHeader
        title={course.title}
        completedLessons={completedLessons}
        totalLessons={lessons.length}
        progress={progress}
        onBack={() => navigate(`/courses/${id}`)}
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen(prev => !prev)}
      />

      <div className="container mx-auto max-w-7xl px-4 py-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr,350px]">
          <div className="order-2 lg:order-1">
            <div className="glass-card rounded-2xl p-6">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-foreground">Уроки курса</h2>
                <div className="flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                  <span>{Math.round(progress)}% завершено</span>
                </div>
              </div>

              {lessons.length === 0 ? (
                <div className="py-12 text-center">
                  <BookOpen className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
                  <p className="text-muted-foreground">Уроков пока нет</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {lessons.map(lesson => (
                    <StudentLessonItem
                      key={lesson.id}
                      lesson={lesson}
                      isAccessible={course.isEnrolled ?? false}
                      onOpen={() => navigate(`/lessons/${lesson.id}`)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
          <aside
            className={`order-1 lg:order-2 ${isSidebarOpen ? 'block' : 'hidden lg:block'}`}
          >
            <StudentCourseProgressSidebar
              completedLessons={completedLessons}
              totalLessons={lessons.length}
              progress={progress}
              hasCertificate={!!certificate}
              onViewCertificate={certificate ? handleViewCertificate : undefined}
            />
          </aside>
        </div>
      </div>
    </div>
  )
}
