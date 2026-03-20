import { Check, Zap, AlertTriangle, Crown } from 'lucide-react'
import { daysLeft } from '@/shared/lib'
import type { TeacherSubscription } from '@/shared/types/user'

interface Props {
  subscription: Pick<TeacherSubscription, 'status' | 'trialEndsAt' | 'currentPeriodEnd'>
  /** If true, shows days remaining inline */
  showDays?: boolean
}

/**
 * Pill badge showing subscription status with optional days-remaining counter.
 * Placed in the entities layer because it only renders entity data — no mutations.
 */
export const SubscriptionStatusBadge = ({ subscription, showDays = true }: Props) => {
  const { status, trialEndsAt, currentPeriodEnd } = subscription

  if (status === 'ACTIVE') {
    const days = showDays ? daysLeft(currentPeriodEnd) : null
    return (
      <span
        title={currentPeriodEnd ? `До: ${new Date(currentPeriodEnd).toLocaleDateString('ru-RU')}` : undefined}
        className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400"
      >
        <Crown className="h-3 w-3" />
        Подписка активна{days !== null ? ` · ${days} дн.` : ''}
      </span>
    )
  }

  if (status === 'TRIAL') {
    const days = showDays ? daysLeft(trialEndsAt) : null
    return (
      <span
        title={trialEndsAt ? `Пробный период до: ${new Date(trialEndsAt).toLocaleDateString('ru-RU')}` : undefined}
        className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1.5 text-xs font-semibold text-amber-700 dark:bg-amber-950/50 dark:text-amber-400"
      >
        <Zap className="h-3 w-3" />
        Пробный период{days !== null ? ` · ${days} дн.` : ''}
      </span>
    )
  }

  if (status === 'EXPIRED') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-destructive/10 px-3 py-1.5 text-xs font-semibold text-destructive">
        <AlertTriangle className="h-3 w-3" />
        Подписка истекла
      </span>
    )
  }

  if (status === 'CANCELLED') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 text-xs font-semibold text-muted-foreground">
        Подписка отменена
      </span>
    )
  }

  // Compact variant (used inside TeacherSubscriptionPanel details)
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
      <Check className="h-3 w-3" /> {status}
    </span>
  )
}
