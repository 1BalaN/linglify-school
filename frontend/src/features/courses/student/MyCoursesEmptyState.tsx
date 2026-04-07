import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { BookOpen, ArrowRight } from 'lucide-react'
import { Button } from '@/shared/ui'

export const MyCoursesEmptyState = () => {
  const { t } = useTranslation('platform', { keyPrefix: 'student.myCourses' })
  return (
    <div className="glass-card flex flex-col items-center gap-4 py-20 text-center rounded-2xl">
      <BookOpen className="h-16 w-16 text-primary/30" />
      <h2 className="text-xl font-semibold">{t('emptyStateTitle')}</h2>
      <p className="max-w-md text-muted-foreground">{t('emptyStateBody')}</p>
      <Link to="/courses">
        <Button variant="primary">
          {t('catalogCta')}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </Link>
    </div>
  )
}
