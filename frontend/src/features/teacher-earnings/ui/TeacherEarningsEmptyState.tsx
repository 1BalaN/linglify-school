import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { ChevronRight, Wallet } from 'lucide-react'
import { Button } from '@/shared/ui'

export const TeacherEarningsEmptyState = () => {
  const { t } = useTranslation('platform')
  const navigate = useNavigate()

  return (
    <div className="rounded-2xl border border-dashed border-border/80 bg-muted/10 px-6 py-14 text-center backdrop-blur-sm">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-muted/50">
        <Wallet className="h-8 w-8 text-muted-foreground/70" aria-hidden />
      </div>
      <p className="mx-auto mt-4 max-w-sm text-muted-foreground">{t('teacherCabinet.earnings.emptySales')}</p>
      <Button variant="outline" type="button" className="mt-6" onClick={() => navigate('/admin/courses')}>
        {t('teacherCabinet.earnings.myCourses')}
        <ChevronRight className="ml-1 h-4 w-4" aria-hidden />
      </Button>
    </div>
  )
}
