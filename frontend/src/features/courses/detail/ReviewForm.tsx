import { useTranslation } from 'react-i18next'
import { Loader2, Send, X } from 'lucide-react'
import { Button } from '@/shared/ui'
import { ReviewStarRating } from './ReviewStarRating'

interface ReviewFormProps {
  rating: number
  canRate: boolean
  comment: string
  error: string | null
  isLoading: boolean
  isEditing: boolean
  onRatingChange: (r: number) => void
  onCommentChange: (c: string) => void
  onSubmit: () => void
  onCancel?: () => void
}

export const ReviewForm = ({
  rating,
  canRate,
  comment,
  error,
  isLoading,
  isEditing,
  onRatingChange,
  onCommentChange,
  onSubmit,
  onCancel,
}: ReviewFormProps) => {
  const { t } = useTranslation('platform', { keyPrefix: 'courseDetail.reviewForm' })

  return (
    <div
      className={`rounded-2xl border p-6 shadow-sm ${
        isEditing ? 'border-primary/30 bg-primary/5' : 'border-border bg-card'
      }`}
    >
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-semibold text-foreground">
          {isEditing ? t('editTitle') : t('newTitle')}
        </h3>
        {onCancel && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="mb-4 flex flex-col gap-1">
        <div className="flex items-center gap-3">
          <ReviewStarRating
            rating={rating}
            interactive={canRate}
            onChange={canRate ? onRatingChange : undefined}
            size="lg"
          />
          {canRate ? (
            <span className="text-sm font-medium text-muted-foreground">
              {t('ratingOf', { rating })}
            </span>
          ) : (
            <span className="text-xs font-medium text-muted-foreground">{t('staffNote')}</span>
          )}
        </div>
      </div>

      <textarea
        value={comment}
        onChange={e => onCommentChange(e.target.value)}
        placeholder={t('placeholder')}
        rows={4}
        className="w-full resize-none rounded-xl border border-border bg-background px-4 py-3 text-sm leading-relaxed focus:border-primary focus:outline-none"
      />

      {error && (
        <div className="mt-2 flex items-center gap-2 text-sm text-red-600">
          <span>{error}</span>
        </div>
      )}

      <div className="mt-4 flex items-center justify-between gap-3">
        <Button
          onClick={onSubmit}
          disabled={isLoading}
          className="flex items-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              {t('saving')}
            </>
          ) : (
            <>
              <Send className="h-4 w-4" />
              {isEditing ? t('submitUpdate') : t('submitNew')}
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
