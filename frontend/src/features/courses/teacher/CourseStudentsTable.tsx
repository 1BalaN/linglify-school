import { useTranslation } from 'react-i18next'
import type { CourseStudent } from '@/shared/types/course'

interface CourseStudentsTableProps {
  students: CourseStudent[]
  isLoading: boolean
}

export const CourseStudentsTable = ({ students, isLoading }: CourseStudentsTableProps) => {
  const { t } = useTranslation('platform', { keyPrefix: 'teacher.courseStudents' })
  const { i18n } = useTranslation('platform')
  const locale = i18n.language.startsWith('ru') ? 'ru-RU' : 'en-US'

  if (isLoading) {
    return (
      <div className="mt-4 rounded-xl border border-border bg-background/60 p-4 text-sm text-muted-foreground">
        {t('loading')}
      </div>
    )
  }

  if (!students.length) {
    return (
      <div className="mt-4 rounded-xl border border-border bg-background/60 p-4 text-sm text-muted-foreground">
        {t('empty')}
      </div>
    )
  }

  return (
    <div className="mt-4 rounded-xl border border-border bg-background/60 p-4">
      <div className="mb-2 flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-foreground">{t('title')}</h3>
        <span className="text-xs text-foreground">{t('total', { count: students.length })}</span>
      </div>

      <div className="scroll-soft max-h-72 overflow-y-auto">
        <table className="min-w-full text-left text-xs">
          <thead className="sticky top-0 bg-background/90 backdrop-blur border-b border-border/60">
            <tr>
              <th className="px-3 py-2 font-medium text-muted-foreground">{t('colStudent')}</th>
              <th className="px-3 py-2 font-medium text-muted-foreground">{t('colEmail')}</th>
              <th className="px-3 py-2 font-medium text-muted-foreground">{t('colProgress')}</th>
              <th className="px-3 py-2 font-medium text-muted-foreground">{t('colEnrolled')}</th>
              <th className="px-3 py-2 font-medium text-muted-foreground">{t('colCompleted')}</th>
            </tr>
          </thead>
          <tbody>
            {students.map(enrollment => {
              const user = enrollment.user
              const fullName = user
                ? [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email
                : enrollment.userId

              const enrolledAt = new Date(enrollment.enrolledAt).toLocaleDateString(locale)
              const completedAt = enrollment.completedAt
                ? new Date(enrollment.completedAt).toLocaleDateString(locale)
                : null

              return (
                <tr key={enrollment.id} className="border-b border-border/40 last:border-0">
                  <td className="px-3 py-2 align-middle text-foreground">
                    <div className="flex flex-col">
                      <span className="font-medium">{fullName}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2 align-middle text-foreground">
                    {user?.email ?? '—'}
                  </td>
                  <td className="px-3 py-2 align-middle text-foreground">
                    {Math.round(enrollment.progress)}%
                  </td>
                  <td className="px-3 py-2 align-middle text-foreground">{enrolledAt}</td>
                  <td className="px-3 py-2 align-middle text-foreground">
                    {completedAt ?? '—'}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
