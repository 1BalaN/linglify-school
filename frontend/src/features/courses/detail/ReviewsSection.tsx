import { Star, X, Lock, UserCheck } from 'lucide-react'
import { Button } from '@/shared/ui'
import type { Review } from '@/shared/types/course'
import { ReviewCard } from './ReviewCard'
import { ReviewForm } from './ReviewForm'
import { ReviewsCurrentUser } from '@/shared/types/review'

interface ReviewsSectionProps {
  courseId: string
  teacherId: string
  isEnrolled: boolean
  reviews: Review[]
  currentUser: ReviewsCurrentUser | null
  reviewRating: number
  reviewComment: string
  reviewError: string | null
  editingReview: Review | null
  deleteReviewId: string | null
  isCreatingReview: boolean
  isUpdatingReview: boolean
  setReviewRating: (r: number) => void
  setReviewComment: (c: string) => void
  setReviewError: (e: string | null) => void
  setEditingReview: (r: Review | null) => void
  setDeleteReviewId: (id: string | null) => void
  onSubmit: () => Promise<void>
  onDeleteConfirm: () => Promise<void>
}

export const ReviewsSection = ({
  teacherId,
  isEnrolled,
  reviews,
  currentUser,
  reviewRating,
  reviewComment,
  reviewError,
  editingReview,
  deleteReviewId,
  isCreatingReview,
  isUpdatingReview,
  setReviewRating,
  setReviewComment,
  setReviewError,
  setEditingReview,
  setDeleteReviewId,
  onSubmit,
  onDeleteConfirm,
}: ReviewsSectionProps) => {
  const isAuthenticated = !!currentUser
  const isTeacher = currentUser?.role === 'TEACHER'
  const isAdmin = currentUser?.role === 'ADMIN'
  const isStudent = currentUser?.role === 'STUDENT'
  const isTeacherOrAdmin = isTeacher || isAdmin
  const canLeaveReview = isEnrolled || isTeacherOrAdmin

  // Для отображения среднего рейтинга и распределения используем только отзывы студентов,
  // чтобы оценки преподавателя/админа не искажали картину.
  const studentReviews = reviews.filter(r => r.user?.role === 'STUDENT')
  const totalStudentReviews = studentReviews.length
  const averageRating =
    totalStudentReviews > 0
      ? studentReviews.reduce((sum, r) => sum + r.rating, 0) / totalStudentReviews
      : 0

  const distribution = [5, 4, 3, 2, 1].map(star => {
    const count = studentReviews.filter(r => r.rating === star).length
    return {
      star,
      count,
      percent: totalStudentReviews ? Math.round((count / totalStudentReviews) * 100) : 0,
    }
  })

  const isOwnReview = reviews.find(r => r.userId === currentUser?.id) || null

  return (
    <div className="space-y-2">
      {/* Summary */}
      <div className="grid gap-6 rounded-2xl border border-border bg-card p-6 md:grid-cols-[1.2fr,2fr]">
        <div className="flex flex-col items-center justify-center border-b border-border pb-4 md:border-b-0 md:border-r md:pb-0 md:pr-6">
          <div className="mb-2 flex items-center gap-2">
            <span className="text-4xl font-bold text-foreground">
              {averageRating.toFixed(1)}
            </span>
            <Star className="h-7 w-7 fill-yellow-400 text-yellow-400" />
          </div>
          <p className="text-sm text-muted-foreground">
            На основе {totalStudentReviews}{' '}
            {totalStudentReviews === 1
              ? 'отзыва'
              : totalStudentReviews < 5
                ? 'отзывов'
                : 'отзывов'}
          </p>
        </div>
        <div className="space-y-2">
          {distribution.map(({ star, count, percent }) => (
            <div key={star} className="flex items-center gap-2 text-sm">
              <span className="flex w-12 items-center gap-1 text-muted-foreground">
                {star}
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              </span>
              <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-muted">
                <div
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-yellow-400 to-amber-500"
                  style={{ width: `${percent}%` }}
                />
              </div>
              <span className="w-10 text-right text-xs text-muted-foreground">
                {count || ''}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Access messages */}
      {!isAuthenticated && (
        <div className="flex items-center gap-2 rounded-xl border border-border bg-card/60 p-4 text-sm text-muted-foreground">
          <Lock className="h-4 w-4" />
          <span>
            Только авторизованные пользователи могут оставлять отзывы.{' '}
            <span className="font-medium text-primary">Войдите в аккаунт.</span>
          </span>
        </div>
      )}

      {isAuthenticated && !canLeaveReview && (
        <div className="flex items-center gap-2 rounded-xl border border-border bg-card/60 p-4 text-sm text-muted-foreground">
          <UserCheck className="h-4 w-4" />
          <span>
            Оставлять отзывы могут только ученики курса, преподаватель и администраторы.
          </span>
        </div>
      )}
      {isAuthenticated && canLeaveReview && !!isOwnReview && !editingReview && (
        <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-300">
          <UserCheck className="h-4 w-4" />
          <span>
            Вы уже оставили отзыв к этому курсу. Вы можете его отредактировать или удалить.
          </span>
        </div>
      )}
      {/* Form */}
      {isAuthenticated && canLeaveReview && (!isOwnReview || editingReview) && (
        <ReviewForm
          rating={reviewRating}
          canRate={isStudent && isEnrolled}
          comment={reviewComment}
          error={reviewError}
          isLoading={isCreatingReview || isUpdatingReview}
          isEditing={!!editingReview}
          onRatingChange={setReviewRating}
          onCommentChange={setReviewComment}
          onSubmit={onSubmit}
          onCancel={() => {
            setEditingReview(null)
            setReviewComment('')
            setReviewError(null)
            setReviewRating(5)
          }}
        />
      )}

      {/* Reviews list */}
      <div className="space-y-3">
        {reviews.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Пока нет ни одного отзыва. Станьте первым, кто поделится мнением о курсе.
          </p>
        ) : (
          reviews.map(review => (
            <div key={review.id} className="space-y-2">
              <ReviewCard
                review={review}
                teacherId={teacherId}
                currentUser={currentUser}
                onEdit={() => {
                  setEditingReview(review)
                  setReviewRating(review.rating)
                  setReviewComment(review.comment || '')
                  setReviewError(null)
                }}
                onDelete={() => setDeleteReviewId(review.id)}
              />

              {deleteReviewId === review.id && (
                <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300">
                  <span>Удалить отзыв?</span>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={onDeleteConfirm}
                    disabled={isUpdatingReview}
                  >
                    Удалить
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setDeleteReviewId(null)}
                  >
                    <X className="h-4 w-4" />
                    Отмена
                  </Button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

