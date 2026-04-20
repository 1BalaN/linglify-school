import { useTranslation } from 'react-i18next'
import { ChevronLeft, List } from 'lucide-react'
import { Button } from '@/shared/ui'

interface StudentCourseHeaderProps {
  title: string
  completedLessons: number
  totalLessons: number
  progress: number
  onBack: () => void
  isSidebarOpen: boolean
  onToggleSidebar: () => void
}

export const StudentCourseHeader = ({
  title,
  completedLessons,
  totalLessons,
  progress,
  onBack,
  isSidebarOpen,
  onToggleSidebar,
}: StudentCourseHeaderProps) => {
  const { t } = useTranslation('platform', { keyPrefix: 'student.myCourses' })
  return (
    <div className="border-b border-border bg-card/50 backdrop-blur-sm">
      <div className="container mx-auto max-w-7xl px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ChevronLeft className="mr-1 h-4 w-4" />
              {t('backToCourse')}
            </Button>
            <div>
              <h1 className="text-lg font-bold text-foreground">{title}</h1>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span>
                  {t('lessonsProgress', { done: completedLessons, total: totalLessons })}
                </span>
                <span>{Math.round(progress)}%</span>
              </div>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onToggleSidebar}
            className="lg:hidden"
            aria-pressed={isSidebarOpen}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
