import { useTranslation } from 'react-i18next'
import { CreditCard } from 'lucide-react'
import { formatDateLong, formatMoney } from '@/shared/lib/format'
import type { PayoutRequest } from '@/shared/types/user'
import { PAYOUT_STATUS_COLOR, PAYOUT_STATUS_STEP } from '@/features/teacher-earnings/lib/payoutUi'

const STEP_KEYS = ['pending', 'processing', 'completed'] as const

export const TeacherEarningsPayoutHistory = ({ payouts }: { payouts: PayoutRequest[] }) => {
  const { t } = useTranslation('platform')

  if (payouts.length === 0) return null

  return (
    <section className="mb-8">
      <h2 className="mb-4 text-lg font-semibold">{t('teacherCabinet.earnings.payoutHistory')}</h2>
      <div className="space-y-4">
        {payouts.map(p => (
          <div
            key={p.id}
            className="rounded-2xl glass-card border border-border/80 p-5 backdrop-blur-xl transition-shadow hover:shadow-md hover:shadow-primary/5"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="tabular-nums text-lg font-bold text-foreground">{formatMoney(p.amount)}</p>
                <p className="text-xs text-muted-foreground">{formatDateLong(p.createdAt)}</p>
                {p.payoutDetails ? (
                  <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <CreditCard className="h-3.5 w-3.5 shrink-0" aria-hidden />
                    <span className="truncate">{p.payoutDetails}</span>
                  </p>
                ) : null}
                {p.adminNote ? <p className="mt-1 text-xs italic text-muted-foreground">{p.adminNote}</p> : null}
              </div>
              <span
                className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${PAYOUT_STATUS_COLOR[p.status] ?? ''}`}
              >
                {t(`payoutStatus.teacher.${p.status}`, { defaultValue: p.status })}
              </span>
            </div>
            {p.status !== 'REJECTED' ? (
              <PayoutProgressLabels currentStep={PAYOUT_STATUS_STEP[p.status] ?? 0} />
            ) : null}
          </div>
        ))}
      </div>
    </section>
  )
}

function PayoutProgressLabels({ currentStep }: { currentStep: number }) {
  const { t } = useTranslation('platform')

  return (
    <div className="mt-5 border-t border-border/60 pt-4">
      <div className="mb-2 flex justify-between gap-1 px-0.5 text-[10px] font-medium leading-tight text-muted-foreground sm:text-xs">
        {STEP_KEYS.map(key => (
          <span key={key} className="max-w-[32%] text-center">
            {t(`teacherCabinet.earnings.payoutSteps.${key}`)}
          </span>
        ))}
      </div>
      <div className="flex gap-1.5" role="presentation">
        {STEP_KEYS.map((_, idx) => {
          const active = idx + 1 <= currentStep
          return (
            <div
              key={idx}
              className={`h-1.5 flex-1 rounded-full transition-colors ${active ? 'bg-primary' : 'bg-muted'}`}
            />
          )
        })}
      </div>
    </div>
  )
}
