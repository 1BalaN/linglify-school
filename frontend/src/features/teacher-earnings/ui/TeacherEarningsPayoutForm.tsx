import { Trans, useTranslation } from 'react-i18next'
import { CreditCard, Info } from 'lucide-react'
import { Button } from '@/shared/ui'
import { formatMoney } from '@/shared/lib/format'
import type { TeacherEarnings } from '@/entities/revenue'
import type { useTeacherPayoutForm } from '@/features/teacher-earnings/model/useTeacherPayoutForm'

type PayoutFormState = ReturnType<typeof useTeacherPayoutForm>

interface TeacherEarningsPayoutFormProps {
  earnings: TeacherEarnings
  form: PayoutFormState
}

export const TeacherEarningsPayoutForm = ({ earnings, form }: TeacherEarningsPayoutFormProps) => {
  const { t } = useTranslation('platform')
  const available = earnings.availableForPayout

  return (
    <div className="mb-8 grid gap-6 lg:grid-cols-[1fr_minmax(240px,280px)]">
      <div className="rounded-2xl glass-card border border-border/80 p-6 shadow-sm backdrop-blur-xl lg:border-l-4 lg:border-l-primary/50">
        <div className="mb-5 flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
            <CreditCard className="h-5 w-5 text-primary" />
          </div>
          <h2 className="text-lg font-semibold">{t('teacherCabinet.earnings.requestPayout')}</h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium">
              {t('teacherCabinet.earnings.amountLabel')}{' '}
              <span className="font-normal text-muted-foreground">
                {t('teacherCabinet.earnings.amountMinHint', { min: form.minPayoutByn })}
              </span>
            </label>
            <input
              type="number"
              min={form.minPayoutByn}
              step="0.01"
              value={form.payoutAmount}
              onChange={e => form.setPayoutAmount(e.target.value)}
              placeholder={t('teacherCabinet.earnings.amountPlaceholder', { max: formatMoney(available) })}
              className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm tabular-nums focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">
              {t('teacherCabinet.earnings.payoutDetailsLabel')}
            </label>
            <input
              type="text"
              value={form.payoutDetails}
              onChange={e => form.setPayoutDetails(e.target.value)}
              placeholder={t('teacherCabinet.earnings.payoutDetailsPlaceholder')}
              className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>
        </div>

        {form.payoutError ? (
          <p className="mt-3 flex items-start gap-2 rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive">
            <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            {form.payoutError}
          </p>
        ) : null}
        {form.payoutSuccess ? (
          <div className="mt-3 flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden />
            {t('teacherCabinet.earnings.successNote')}
          </div>
        ) : null}

        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground sm:max-w-[60%]">{t('teacherCabinet.earnings.feeNote')}</p>
          <Button type="button" onClick={() => void form.submit()} isLoading={form.payoutLoading} className="shrink-0">
            {t('teacherCabinet.earnings.submitRequest')}
          </Button>
        </div>
      </div>

      <aside className="hidden rounded-2xl border border-dashed border-border/80 bg-muted/20 p-5 text-sm text-muted-foreground lg:block">
        <p className="font-medium text-foreground">{t('teacherCabinet.earnings.sidebarTitle')}</p>
        <p className="mt-2 leading-relaxed">{t('teacherCabinet.earnings.sidebarBody')}</p>
      </aside>
    </div>
  )
}

interface MinNoticeProps {
  available: number
  minByn: number
}

export const TeacherEarningsMinAccumulateNotice = ({ available, minByn }: MinNoticeProps) => {
  const { t } = useTranslation('platform')

  return (
    <div className="mb-8 flex gap-3 rounded-2xl border border-dashed border-primary/25 bg-primary/5 p-5 text-sm text-muted-foreground backdrop-blur-sm">
      <Info className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden />
      <div>
        <Trans
          i18nKey="teacherCabinet.earnings.minAccumulate"
          ns="platform"
          values={{ min: minByn }}
          components={{ strong: <strong className="text-foreground" /> }}
        />{' '}
        {t('teacherCabinet.earnings.availableLine', { amount: formatMoney(available) })}
      </div>
    </div>
  )
}
