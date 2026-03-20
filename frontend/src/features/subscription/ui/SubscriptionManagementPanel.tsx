import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { Check, Crown, Loader2, CalendarClock, TrendingUp } from 'lucide-react'
import { Button } from '@/shared/ui'
import { daysLeft, formatDateLong } from '@/shared/lib'
import {
  useGetMySubscriptionQuery,
  useCreateSubscriptionCheckoutMutation,
  useCancelSubscriptionMutation,
  useSyncSubscriptionMutation,
  SubscriptionStatusBadge,
} from '@/entities/subscription'

const PLAN_FEATURES = [
  'Публикация неограниченного числа курсов',
  'Детальная аналитика по курсам и студентам',
  'Чат со студентами в реальном времени',
  'Выплата заработанных средств',
  'Приоритетная поддержка платформы',
]

/**
 * Full subscription management panel: current status card + plan purchase form.
 * Lives in features/ because it combines entity hooks with user-triggered mutations.
 */
export const SubscriptionManagementPanel = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [banner, setBanner] = useState<'success' | 'cancelled' | null>(null)
  const [selectedPlan, setSelectedPlan] = useState<'MONTHLY' | 'ANNUAL'>('ANNUAL')

  const { data, isLoading, refetch } = useGetMySubscriptionQuery(undefined, {
    refetchOnMountOrArgChange: true,
  })
  const [createCheckout, { isLoading: checkoutLoading }] = useCreateSubscriptionCheckoutMutation()
  const [cancelSub, { isLoading: cancelLoading }] = useCancelSubscriptionMutation()
  const [syncSub, { isLoading: syncing }] = useSyncSubscriptionMutation()

  const subscription = data?.data

  useEffect(() => {
    if (searchParams.get('success') === 'true') {
      setBanner('success')
      syncSub().unwrap().catch(() => refetch())
      setTimeout(() => setBanner(null), 5000)
      navigate('/profile?tab=subscription', { replace: true })
    } else if (searchParams.get('cancelled') === 'true') {
      setBanner('cancelled')
      setTimeout(() => setBanner(null), 4000)
      navigate('/profile?tab=subscription', { replace: true })
    }
  }, [searchParams, refetch, navigate, syncSub])

  const handleSubscribe = async () => {
    try {
      const res = await createCheckout({ plan: selectedPlan }).unwrap()
      if (res.data.url) window.location.href = res.data.url
    } catch {
      // error handled by RTK Query
    }
  }

  const handleCancel = async () => {
    if (!confirm('Отменить подписку? Она останется активной до конца оплаченного периода.')) return
    await cancelSub()
  }

  const isExpiredOrNone = !subscription || subscription.status === 'EXPIRED' || subscription.status === 'CANCELLED'
  const showPlans = isExpiredOrNone || subscription?.status === 'TRIAL'

  if (isLoading || syncing) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        {syncing && <p className="text-sm text-muted-foreground">Обновляем статус подписки…</p>}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-md">
          <Crown className="h-5 w-5 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold">Подписка преподавателя</h2>
          <p className="text-sm text-muted-foreground">Публикуйте курсы и получайте доход</p>
        </div>
      </div>

      {/* Success / cancelled banners */}
      {banner === 'success' && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300">
          ✅ Подписка успешно оформлена! Теперь вы можете публиковать курсы.
        </div>
      )}
      {banner === 'cancelled' && (
        <div className="rounded-xl border border-muted bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
          Оплата отменена. Вы можете попробовать снова в любой момент.
        </div>
      )}

      {/* Current subscription details */}
      {subscription && (
        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Текущая подписка</p>
          <div className="grid gap-4 sm:grid-cols-3">
            {/* Status */}
            <div>
              <p className="mb-1 text-xs text-muted-foreground">Статус</p>
              <SubscriptionStatusBadge subscription={subscription} showDays={false} />
            </div>

            {/* Plan */}
            {subscription.plan && (
              <div className="flex items-start gap-2">
                <TrendingUp className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Тариф</p>
                  <p className="text-sm font-semibold">
                    {subscription.plan === 'MONTHLY' ? 'Месячный' : 'Годовой'}
                  </p>
                </div>
              </div>
            )}

            {/* Expiry */}
            {(subscription.currentPeriodEnd ?? subscription.trialEndsAt) && (
              <div className="flex items-start gap-2">
                <CalendarClock className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">
                    {subscription.status === 'TRIAL' ? 'Пробный период до' : 'Следующее списание'}
                  </p>
                  <p className="text-sm font-semibold">
                    {formatDateLong(subscription.currentPeriodEnd ?? subscription.trialEndsAt)}
                  </p>
                  <p className={`text-xs font-medium ${subscription.status === 'TRIAL' ? 'text-amber-500' : 'text-muted-foreground'}`}>
                    Осталось {daysLeft(subscription.currentPeriodEnd ?? subscription.trialEndsAt)} дн.
                  </p>
                </div>
              </div>
            )}
          </div>

          {subscription.status === 'ACTIVE' && (
            <div className="mt-4 border-t border-border pt-4">
              <Button variant="outline" size="sm" onClick={handleCancel} isLoading={cancelLoading}>
                Отменить подписку
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Plan purchase */}
      {showPlans && (
        <div className="space-y-4">
          <h3 className="text-sm font-semibold">
            {isExpiredOrNone ? 'Оформить подписку' : 'Перейти на платный тариф'}
          </h3>

          <div className="flex rounded-xl border border-border bg-muted/40 p-1 w-fit">
            {(['MONTHLY', 'ANNUAL'] as const).map(plan => (
              <button
                key={plan}
                onClick={() => setSelectedPlan(plan)}
                className={`relative rounded-lg px-6 py-2 text-sm font-medium transition-all ${
                  selectedPlan === plan
                    ? 'bg-card shadow text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {plan === 'MONTHLY' ? 'Месяц' : 'Год'}
                {plan === 'ANNUAL' && (
                  <span className="ml-2 rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400">
                    −33%
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="rounded-2xl border-2 border-primary/40 bg-card p-6 shadow-md shadow-primary/5">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-3xl font-bold">{selectedPlan === 'MONTHLY' ? '30 BYN' : '240 BYN'}</p>
                <p className="text-sm text-muted-foreground">
                  {selectedPlan === 'MONTHLY' ? 'в месяц' : 'в год (20 BYN/мес)'}
                </p>
              </div>
              <Button onClick={handleSubscribe} isLoading={checkoutLoading}>
                {checkoutLoading
                  ? <Loader2 className="h-4 w-4 animate-spin" />
                  : `Оформить за ${selectedPlan === 'MONTHLY' ? '30 BYN' : '240 BYN'}`}
              </Button>
            </div>

            <ul className="mt-5 space-y-2.5">
              {PLAN_FEATURES.map(f => (
                <li key={f} className="flex items-center gap-2.5 text-sm">
                  <Check className="h-4 w-4 shrink-0 text-emerald-500" />
                  {f}
                </li>
              ))}
            </ul>

            <p className="mt-4 text-xs text-muted-foreground">
              Безопасная оплата через Stripe. Отмените в любой момент.
            </p>
          </div>

          <p className="text-sm text-muted-foreground">
            Платформа удерживает <strong>25%</strong> комиссии с каждой продажи курса.
            Оставшиеся <strong>75%</strong> вы получаете через запрос на выплату.
          </p>
        </div>
      )}
    </div>
  )
}
