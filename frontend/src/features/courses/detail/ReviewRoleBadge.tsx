import { useTranslation } from 'react-i18next'
import { Shield, BookOpen } from 'lucide-react'

interface ReviewRoleBadgeProps {
  role?: string
  isAuthor?: boolean
}

export const ReviewRoleBadge = ({ role, isAuthor }: ReviewRoleBadgeProps) => {
  const { t } = useTranslation('platform', { keyPrefix: 'courseDetail.reviewRoles' })
  if (isAuthor) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
        <BookOpen className="h-3 w-3" />
        {t('teacher')}
      </span>
    )
  }

  if (role === 'ADMIN') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700 dark:bg-purple-900/40 dark:text-purple-300">
        <Shield className="h-3 w-3" />
        {t('admin')}
      </span>
    )
  }

  return null
}
