import { Star } from 'lucide-react'

interface ReviewStarRatingProps {
  rating: number
  interactive?: boolean
  onChange?: (r: number) => void
  size?: 'sm' | 'md' | 'lg'
}

export const ReviewStarRating = ({
  rating,
  interactive = false,
  onChange,
  size = 'md',
}: ReviewStarRatingProps) => {
  const sz = size === 'sm' ? 'h-3.5 w-3.5' : size === 'lg' ? 'h-7 w-7' : 'h-5 w-5'

  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <button
          key={i}
          type="button"
          disabled={!interactive}
          onClick={() => onChange?.(i + 1)}
          className={
            interactive
              ? 'cursor-pointer transition-transform hover:scale-125'
              : 'cursor-default'
          }
        >
          <Star
            className={`${sz} ${
              i < rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300 dark:text-gray-600'
            }`}
          />
        </button>
      ))}
    </div>
  )
}

