import type { LucideIcon } from 'lucide-react'
import { BadgeCheck, Clock, TrendingUp, Wallet } from 'lucide-react'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { formatMoney } from '@/shared/lib/format'
import type { TeacherEarnings } from '@/entities/revenue'

const GRADIENTS = [
  'from-emerald-500 to-teal-500',
  'from-blue-500 to-indigo-500',
  'from-amber-500 to-orange-500',
  'from-primary to-cyan-600',
] as const

type StatDef = {
  labelKey: string
  valueCents: number
  icon: LucideIcon
  gradient: (typeof GRADIENTS)[number]
}

export const TeacherEarningsStatsGrid = ({ earnings }: { earnings: TeacherEarnings | undefined }) => {
  const { t } = useTranslation('platform')
  const available = earnings?.availableForPayout ?? 0

  const stats: StatDef[] = useMemo(
    () => [
      {
        labelKey: 'teacherCabinet.earnings.stats.totalEarned',
        valueCents: earnings?.totalEarned ?? 0,
        icon: TrendingUp,
        gradient: GRADIENTS[0],
      },
      {
        labelKey: 'teacherCabinet.earnings.stats.paidOut',
        valueCents: earnings?.totalPaidOut ?? 0,
        icon: BadgeCheck,
        gradient: GRADIENTS[1],
      },
      {
        labelKey: 'teacherCabinet.earnings.stats.pending',
        valueCents: earnings?.pendingPayout ?? 0,
        icon: Clock,
        gradient: GRADIENTS[2],
      },
      {
        labelKey: 'teacherCabinet.earnings.stats.available',
        valueCents: available,
        icon: Wallet,
        gradient: GRADIENTS[3],
      },
    ],
    [earnings?.totalEarned, earnings?.totalPaidOut, earnings?.pendingPayout, available],
  )

  return (
    <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
      {stats.map(s => (
        <div
          key={s.labelKey}
          className="group rounded-2xl glass-card border border-border/60 p-5 backdrop-blur-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-primary/10"
        >
          <div
            className={`mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${s.gradient} shadow-md`}
          >
            <s.icon className="h-5 w-5 text-white" aria-hidden />
          </div>
          <p className="tabular-nums text-xl font-bold tracking-tight text-foreground">{formatMoney(s.valueCents)}</p>
          <p className="mt-1 text-xs text-muted-foreground leading-snug">{t(s.labelKey)}</p>
        </div>
      ))}
    </div>
  )
}
