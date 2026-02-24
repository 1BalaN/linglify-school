import { useParams, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import {
  useGetCourseByIdQuery,
  useEnrollCourseMutation,
  useCreateReviewMutation,
  useUpdateReviewMutation,
  useDeleteReviewMutation,
} from '@/entities/course'
import type { RootState } from '@/app/store'
import type { Review } from '@/shared/types/course'
import { Loader2 } from 'lucide-react'
import { useState } from 'react'
import { CourseHero, CourseDetailTabs, ReviewsSection } from '@/features/courses/detail'
import { Button } from '@/shared/ui'

export const CourseDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useSelector((state: RootState) => state.auth)
  const { data, isLoading, error } = useGetCourseByIdQuery(id!)
  const [enrollCourse, { isLoading: isEnrolling }] = useEnrollCourseMutation()
  const [createReview, { isLoading: isCreatingReview }] = useCreateReviewMutation()
  const [updateReview, { isLoading: isUpdatingReview }] = useUpdateReviewMutation()
  const [deleteReview] = useDeleteReviewMutation()

  const [activeTab, setActiveTab] = useState<'overview' | 'lessons' | 'reviews'>('overview')

  // ── Review form state ──
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewComment, setReviewComment] = useState('')
  const [reviewError, setReviewError] = useState<string | null>(null)
  const [editingReview, setEditingReview] = useState<Review | null>(null)
  const [deleteReviewId, setDeleteReviewId] = useState<string | null>(null)

  const handleEnroll = async () => {
    if (!user) {
      navigate('/login', { state: { from: `/courses/${id}` } })
      return
    }

    try {
      await enrollCourse(id!).unwrap()
    } catch (error) {
      console.error('Ошибка записи на курс:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-600" />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Курс не найден
          </h2>
          <Button onClick={() => navigate('/courses')}>
            Вернуться к каталогу
          </Button>
        </div>
      </div>
    )
  }

  const course = data.data
  const isTeacher = user?.role === 'TEACHER'
  const isAdmin = user?.role === 'ADMIN'
  const canEdit = isAdmin || (isTeacher && course.teacherId === user?.id)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 dark:from-gray-900 dark:via-blue-950 dark:to-cyan-950">
      <CourseHero
        course={course}
        canEdit={canEdit}
        isEnrolling={isEnrolling}
        onBackToCatalog={() => navigate('/courses')}
        onManageLessons={() => navigate(`/courses/${id}/lessons`)}
        onContinueLearning={() => navigate(`/courses/${course.id}/learn`)}
        onEnroll={handleEnroll}
      />

      <CourseDetailTabs
        course={course}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        reviewsTab={
          <ReviewsSection
            courseId={id!}
            teacherId={course.teacherId}
            isEnrolled={!!course.isEnrolled}
            reviews={course.reviews || []}
            currentUser={user}
            reviewRating={reviewRating}
            reviewComment={reviewComment}
            reviewError={reviewError}
            editingReview={editingReview}
            deleteReviewId={deleteReviewId}
            isCreatingReview={isCreatingReview}
            isUpdatingReview={isUpdatingReview}
            setReviewRating={setReviewRating}
            setReviewComment={setReviewComment}
            setReviewError={setReviewError}
            setEditingReview={setEditingReview}
            setDeleteReviewId={setDeleteReviewId}
            onSubmit={async () => {
              setReviewError(null)
              if (reviewRating < 1 || reviewRating > 5) {
                setReviewError('Укажите оценку от 1 до 5')
                return
              }
              if (!reviewComment.trim()) {
                setReviewError('Напишите комментарий')
                return
              }
              try {
                if (editingReview) {
                  await updateReview({
                    id: editingReview.id,
                    courseId: id!,
                    data: {
                      rating: reviewRating,
                      comment: reviewComment.trim(),
                    },
                  }).unwrap()
                } else {
                  await createReview({
                    courseId: id!,
                    rating: reviewRating,
                    comment: reviewComment.trim(),
                  }).unwrap()
                }
                setReviewComment('')
                setReviewRating(5)
                setEditingReview(null)
              } catch (err) {
                const e = err as { data?: { message?: string } }
                setReviewError(e?.data?.message || 'Ошибка при сохранении отзыва')
              }
            }}
            onDeleteConfirm={async () => {
              if (!deleteReviewId) return
              await deleteReview({ id: deleteReviewId, courseId: id! })
                .unwrap()
                .catch(() => {
                  /* ignore */
                })
              setDeleteReviewId(null)
            }}
          />
        }
      />
    </div>
  )
}
