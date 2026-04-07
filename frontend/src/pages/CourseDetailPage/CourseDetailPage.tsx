import { useParams, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import {
  useGetCourseByIdQuery,
  useEnrollCourseMutation,
  useCreateReviewMutation,
  useUpdateReviewMutation,
  useDeleteReviewMutation,
} from '@/entities/course'
import { useCreateCheckoutSessionMutation } from '@/entities/payment'
import type { RootState } from '@/app/store'
import type { Review } from '@/shared/types/course'
import { Loader2 } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { CourseHero, CourseDetailTabs, ReviewsSection } from '@/features/courses/detail'
import { Button } from '@/shared/ui'

export const CourseDetailPage = () => {
  const { t } = useTranslation('platform', { keyPrefix: 'courseCatalog' })
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useSelector((state: RootState) => state.auth)
  const { data, isLoading, error } = useGetCourseByIdQuery(id!, {
    refetchOnMountOrArgChange: true,
  })
  const [enrollCourse, { isLoading: isEnrollingFree }] = useEnrollCourseMutation()
  const [createCheckoutSession, { isLoading: isCreatingCheckout }] =
    useCreateCheckoutSessionMutation()
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

    if (!course) return

    // Already enrolled — go to learning flow.
    if (course.isEnrolled) {
      navigate(`/courses/${course.id}/learn`)
      return
    }

    // Free courses: enroll via API.
    if (course.price === 0) {
      try {
        await enrollCourse(id!).unwrap()
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Course enrollment failed:', error)
      }
      return
    }

    // Paid courses: Stripe Checkout.
    try {
      const response = await createCheckoutSession({ courseId: course.id }).unwrap()
      const { url } = response.data

      if (url) {
        window.location.href = url
      } else {
        // eslint-disable-next-line no-console
        console.error('Stripe did not return checkout URL')
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to create checkout session:', error)
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
            {t('notFound')}
          </h2>
          <Button onClick={() => navigate('/courses')}>{t('backCatalog')}</Button>
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
        isEnrolling={isEnrollingFree || isCreatingCheckout}
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
                setReviewError(t('reviewRating'))
                return
              }
              if (!reviewComment.trim()) {
                setReviewError(t('reviewComment'))
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
                const e = err as { data?: { error?: { message?: string } } }
                setReviewError(e?.data?.error?.message || t('reviewSaveError'))
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
