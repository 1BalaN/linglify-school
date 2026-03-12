import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import type { RootState } from '@/app/store'
import {
  useGetCourseByIdQuery,
  useDeleteCourseMutation,
} from '@/entities/course'
import {
  useGetCourseLessonsQuery,
  useDeleteLessonMutation,
} from '@/entities/lesson'
import { Button, ConfirmModal } from '@/shared/ui'
import { TeacherLessonsList } from '@/features/courses/teacher'
import {
  BookOpen, PlusCircle, AlertCircle, CheckCircle2, Trash2,
  ArrowLeft, Settings, X,
} from 'lucide-react'
import { NewLessonForm, CourseMetaEditForm } from '@/features/courses/teacher'

export const CourseLessonsPage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const user = useSelector((state: RootState) => state.auth.user)

  const { data: courseData, isLoading: isCourseLoading } = useGetCourseByIdQuery(id!)
  const { data: lessonsData, isLoading: isLessonsLoading } = useGetCourseLessonsQuery(id!)

  const [deleteLesson] = useDeleteLessonMutation()
  const [deleteCourse] = useDeleteCourseMutation()

  const [isAddingLesson, setIsAddingLesson] = useState(false)
  const [isEditingCourse, setIsEditingCourse] = useState(false)
  const [deleteLessonModal, setDeleteLessonModal] = useState<string | null>(null)
  const [deleteCourseModal, setDeleteCourseModal] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [formSuccess, setFormSuccess] = useState<string | null>(null)


  const course = courseData?.data
  const lessons = lessonsData?.data || []

  if (!user) { navigate('/login'); return null }
  const canEdit = user.role === 'ADMIN' || (user.role === 'TEACHER' && course?.teacherId === user.id)

  if (isCourseLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-r-transparent"></div>
          <p className="text-muted-foreground">Загрузка...</p>
        </div>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-500" />
          <h2 className="mb-2 text-xl font-bold">Курс не найден</h2>
          <Button onClick={() => navigate('/courses')}>К курсам</Button>
        </div>
      </div>
    )
  }

  if (!canEdit) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="glass-card max-w-md p-8 text-center">
          <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-500" />
          <h2 className="mb-2 text-xl font-bold">Доступ запрещён</h2>
          <p className="mb-6 text-muted-foreground">Вы можете редактировать только свои курсы</p>
          <Button onClick={() => navigate(`/courses/${id}`)}>К курсу</Button>
        </div>
      </div>
    )
  }

  const handleDeleteLesson = async () => {
    if (!deleteLessonModal) return
    try {
      await deleteLesson(deleteLessonModal).unwrap()
      setFormSuccess('Урок удалён')
      setDeleteLessonModal(null)
    } catch (error) {
      const err = error as { data?: { message?: string } }
      setFormError(err?.data?.message || 'Не удалось удалить урок')
      setDeleteLessonModal(null)
    }
  }

  const handleDeleteCourse = async () => {
    try {
      await deleteCourse(id!).unwrap()
      navigate('/admin/courses')
    } catch (error) {
      const err = error as { data?: { message?: string } }
      setFormError(err?.data?.message || 'Не удалось удалить курс')
    } finally {
      setDeleteCourseModal(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 py-8">
      <div className="container mx-auto max-w-5xl px-4">

        {/* Top bar */}
        <div className="mb-6 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => navigate(`/courses/${id}`)}>
              <ArrowLeft className="mr-2 h-4 w-4" />К курсу
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate(`/courses/${id}/analytics`)}
            >
              Аналитика курса
            </Button>
          </div>
          <Button variant="danger" onClick={() => setDeleteCourseModal(true)}>
            <Trash2 className="mr-2 h-4 w-4" />Удалить курс
          </Button>
        </div>

        {/* Notifications */}
        {formError && (
          <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/40">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{formError}</span>
            <button onClick={() => setFormError(null)} className="ml-auto"><X className="h-4 w-4" /></button>
          </div>
        )}
        {formSuccess && (
          <div className="mb-4 flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{formSuccess}</span>
            <button onClick={() => setFormSuccess(null)} className="ml-auto"><X className="h-4 w-4" /></button>
          </div>
        )}

        {/* Course header */}
        {!isEditingCourse ? (
          <div className="mb-6 glass-card p-6 rounded-md">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600">
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-foreground">{course.title}</h1>
                  <p className="text-sm text-muted-foreground">
                    {course.level} · {course.language} · {lessons.length} уроков
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    course.status === 'PUBLISHED'
                      ? 'bg-emerald-500/10 text-emerald-600'
                      : course.status === 'PENDING_REVIEW' || course.status === 'IN_REVIEW'
                        ? 'bg-blue-500/10 text-blue-700'
                        : course.status === 'REJECTED'
                          ? 'bg-red-500/10 text-red-700'
                          : 'bg-yellow-500/10 text-yellow-700'
                  }`}
                >
                  {course.status === 'PUBLISHED'
                    ? 'Опубликован'
                    : course.status === 'PENDING_REVIEW'
                      ? 'Отправлен на модерацию'
                      : course.status === 'IN_REVIEW'
                        ? 'На модерации'
                        : course.status === 'REJECTED'
                          ? 'Отклонён'
                          : course.status === 'ARCHIVED'
                            ? 'Архивирован'
                            : 'Черновик'}
                </span>
                <Button className='text-xs' variant="outline" size="sm" onClick={() => setIsEditingCourse(true)}>
                  <Settings className="mr-1 h-4 w-4" />
                  Редактировать курс
                </Button>
              </div>
            </div>

            {course.lastReviewComment && course.status === 'REJECTED' && (
              <div className="mt-4 rounded-xl bg-amber-50/80 p-3 text-xs text-amber-900 shadow-sm ring-1 ring-amber-100 dark:bg-amber-950/40 dark:text-amber-50 dark:ring-amber-900/40">
                <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-300">
                  Комментарий модератора
                </div>
                <p className="whitespace-pre-line leading-snug">
                  {course.lastReviewComment}
                </p>
              </div>
            )}
          </div>
        ) : (
          <CourseMetaEditForm
            course={course}
            onClose={() => setIsEditingCourse(false)}
            onUpdated={msg => setFormSuccess(msg)}
            onError={msg => setFormError(msg)}
          />
        )}

        {/* Add lesson button / form */}
        <div className="mb-6">
          {!isAddingLesson ? (
            <Button onClick={() => setIsAddingLesson(true)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Добавить урок
            </Button>
          ) : (
            <NewLessonForm
              courseId={id!}
              lessonsCount={lessons.length}
              onClose={() => setIsAddingLesson(false)}
              onSuccess={msg => setFormSuccess(msg)}
              onError={msg => setFormError(msg)}
            />
          )}
        </div>

        {/* Lessons list */}
        <TeacherLessonsList
          lessons={lessons}
          isLoading={isLessonsLoading}
          onEditSuccess={msg => setFormSuccess(msg)}
          onEditError={msg => setFormError(msg)}
          onRequestDelete={lessonId => setDeleteLessonModal(lessonId)}
        />
      </div>

      {/* Modals */}
      <ConfirmModal
        isOpen={!!deleteLessonModal}
        onClose={() => setDeleteLessonModal(null)}
        onConfirm={handleDeleteLesson}
        title="Удалить урок?"
        message="Это действие необратимо. Урок будет удалён навсегда."
        confirmText="Удалить"
        cancelText="Отмена"
        variant="danger"
      />
      <ConfirmModal
        isOpen={deleteCourseModal}
        onClose={() => setDeleteCourseModal(false)}
        onConfirm={handleDeleteCourse}
        title="Удалить весь курс?"
        message="Это удалит все уроки, вопросы и прогресс студентов. Действие необратимо!"
        confirmText="Удалить курс"
        cancelText="Отмена"
        variant="danger"
      />
    </div>
  )
}
