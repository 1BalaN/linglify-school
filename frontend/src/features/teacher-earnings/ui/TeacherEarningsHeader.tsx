import { Wallet } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { formatMoney } from '@/shared/lib/format'

interface TeacherEarningsHeaderProps {
  availableForPayout: number
}

export const TeacherEarningsHeader = ({ availableForPayout }: TeacherEarningsHeaderProps) => {
  const { t } = useTranslation('platform')

  return (
    <div className="mb-8 flex flex-col gap-6 md:mb-10 md:flex-row md:items-end md:justify-between">
      <div className="flex items-start gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/25">
          <Wallet className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gradient md:text-3xl">{t('teacherCabinet.earnings.title')}</h1>
          <p className="mt-1 text-sm text-muted-foreground max-w-xl">{t('teacherCabinet.earnings.subtitle')}</p>
        </div>
      </div>
      <div className="glass-card rounded-2xl border border-primary/15 bg-primary/5 px-5 py-4 backdrop-blur-xl md:min-w-[200px]">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {t('teacherCabinet.earnings.heroAvailable')}
        </p>
        <p className="mt-1 tabular-nums text-2xl font-bold text-foreground">{formatMoney(availableForPayout)}</p>
      </div>
    </div>
  )
}
