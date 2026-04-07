import { useTranslation } from 'react-i18next'
import { GraduationCap } from 'lucide-react'

interface MyCoursesHeaderProps {
  total: number
}

export const MyCoursesHeader = ({ total }: MyCoursesHeaderProps) => {
  const { t } = useTranslation('platform', { keyPrefix: 'student.myCourses' })
  const countLabel = t('enrolledSummary', { count: total })

  return (
    <div className="mb-10 flex items-center gap-4">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/30">
        <GraduationCap className="h-8 w-8 text-white" />
      </div>
      <div>
        <h1 className="text-3xl font-bold text-foreground">{t('headerTitle')}</h1>
        <p className="mt-0.5 text-muted-foreground">{countLabel}</p>
      </div>
    </div>
  )
}
