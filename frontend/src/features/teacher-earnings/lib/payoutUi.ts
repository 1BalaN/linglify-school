export const MIN_PAYOUT_BYN = 10

export const MIN_PAYOUT_CENTS = MIN_PAYOUT_BYN * 100

export const PAYOUT_STATUS_COLOR: Record<string, string> = {
  PENDING: 'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400',
  PROCESSING: 'bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400',
  COMPLETED: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400',
  REJECTED: 'bg-destructive/10 text-destructive',
}

export const PAYOUT_STATUS_STEP: Record<string, number> = {
  PENDING: 1,
  PROCESSING: 2,
  COMPLETED: 3,
  REJECTED: 0,
}
