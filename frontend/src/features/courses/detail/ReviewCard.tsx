import { Edit, Trash2 } from 'lucide-react'
import { Button } from '@/shared/ui'
import type { Review } from '@/shared/types/course'
import { ReviewStarRating } from './ReviewStarRating'
import { ReviewRoleBadge } from './ReviewRoleBadge'
import { ReviewsCurrentUser } from '@/shared/types/review'

interface ReviewCardProps {
  review: Review
  teacherId: string
  currentUser: ReviewsCurrentUser | null
  onEdit: () => void
  onDelete: () => void
}

export const ReviewCard = ({
  review,
  teacherId,
  currentUser,
  onEdit,
  onDelete,
}: ReviewCardProps) => {
  const isOwner = currentUser?.id === review.userId
  const isAdmin = currentUser?.role === 'ADMIN'
  const isReviewByTeacher = review.userId === teacherId
  const isReviewByAdmin = review.user?.role === 'ADMIN'
  const name =
    review.user?.firstName && review.user?.lastName
      ? `${review.user.firstName} ${review.user.lastName}`
      : review.user?.firstName || 'Пользователь'

  return (
    <div
      className={`rounded-2xl border p-5 transition-all ${
        isReviewByTeacher
          ? 'border-blue-200 bg-blue-50/40 dark:border-blue-800/40 dark:bg-blue-950/20'
          : isReviewByAdmin
            ? 'border-purple-200 bg-purple-50/40 dark:border-purple-800/40 dark:bg-purple-950/20'
            : 'border-border bg-card'
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="relative shrink-0">
          {review.user?.avatar ? (
            <img
              src={review.user.avatar}
              alt={name}
              className="h-10 w-10 rounded-full object-cover ring-2 ring-border"
            />
          ) : (
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold text-white ${
                isReviewByTeacher
                  ? 'bg-gradient-to-br from-blue-400 to-blue-600'
                  : isReviewByAdmin
                    ? 'bg-gradient-to-br from-purple-400 to-purple-600'
                    : 'bg-gradient-to-br from-cyan-500 to-blue-600'
              }`}
            >
              {review.user?.firstName?.[0]?.toUpperCase() || 'U'}
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold text-foreground">{name}</span>
            <ReviewRoleBadge role={review.user?.role} isAuthor={isReviewByTeacher} />
          </div>
          <div className="mb-2 flex items-center gap-2">
            <ReviewStarRating rating={review.rating} size="sm" />
            <span className="text-xs text-muted-foreground">
              {new Date(review.createdAt).toLocaleDateString('ru-RU', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </span>
          </div>
          {review.comment && (
            <p className="text-sm leading-relaxed text-foreground/80">
              {review.comment}
            </p>
          )}
        </div>

        {(isOwner || isAdmin) && (
          <div className="flex shrink-0 items-center gap-0.5">
            {isOwner && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 hover:bg-primary/10"
                onClick={onEdit}
                title="Редактировать"
              >
                <Edit className="h-3.5 w-3.5 text-muted-foreground" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 hover:bg-red-50 dark:hover:bg-red-950/30"
              onClick={onDelete}
              title="Удалить"
            >
              <Trash2 className="h-3.5 w-3.5 text-red-500" />
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

