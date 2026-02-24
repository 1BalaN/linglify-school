import { CourseStatus, statusConfig } from '@/shared/constants/courseStatus'
import { Button } from '@/shared/ui'


type Props = {
  value: CourseStatus | 'ALL'
  stats: Record<CourseStatus | 'ALL', number>
  onChange: (v: CourseStatus | 'ALL') => void
}

export const CoursesFilters = ({ value, stats, onChange }: Props) => {
  return (
    <div className="mb-6 glass-card p-4 rounded-lg">
      <div className="flex flex-wrap gap-2">
        <Button
          variant={value === 'ALL' ? 'primary' : 'outline'}
          size="sm"
          onClick={() => onChange('ALL')}
        >
          Все ({stats.ALL})
        </Button>

        {(Object.entries(statusConfig) as [CourseStatus, typeof statusConfig[CourseStatus]][]).map(
          ([status, config]) => {
            const Icon = config.icon
            return (
              <Button
                key={status}
                variant={value === status ? 'primary' : 'outline'}
                size="sm"
                onClick={() => onChange(status)}
              >
                <Icon className="mr-1 h-3 w-3" />
                {config.label} ({stats[status]})
              </Button>
            )
          }
        )}
      </div>
    </div>
  )
}