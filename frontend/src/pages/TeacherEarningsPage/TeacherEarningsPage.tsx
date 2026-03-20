import { useState } from 'react'
import { Wallet, TrendingUp, Clock, BadgeCheck, ChevronRight, Loader2, CreditCard, Info } from 'lucide-react'
import { Button } from '@/shared/ui'
import { formatMoney } from '@/shared/lib'
import { useGetTeacherEarningsQuery, useCreatePayoutRequestMutation } from '@/entities/revenue'

const MIN_PAYOUT = 10 // BYN
const MIN_PAYOUT_CENTS = MIN_PAYOUT * 100

const PAYOUT_STATUS_LABEL: Record<string, string> = {
  PENDING:    'Ожидает обработки',
  PROCESSING: 'В обработке',
  COMPLETED:  'Выплачено',
  REJECTED:   'Отклонено',
}

const PAYOUT_STATUS_COLOR: Record<string, string> = {
  PENDING:    'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400',
  PROCESSING: 'bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400',
  COMPLETED:  'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400',
  REJECTED:   'bg-destructive/10 text-destructive',
}

const PAYOUT_STATUS_STEP: Record<string, number> = {
  PENDING: 1, PROCESSING: 2, COMPLETED: 3, REJECTED: 0,
}

export const TeacherEarningsPage = () => {
  const { data, isLoading } = useGetTeacherEarningsQuery()
  const [requestPayout, { isLoading: payoutLoading }] = useCreatePayoutRequestMutation()
  const [payoutAmount, setPayoutAmount] = useState('')
  const [payoutDetails, setPayoutDetails] = useState('')
  const [payoutError, setPayoutError] = useState('')
  const [payoutSuccess, setPayoutSuccess] = useState(false)

  const earnings = data?.data

  const handlePayoutRequest = async () => {
    setPayoutError('')
    const cents = Math.round(parseFloat(payoutAmount) * 100)
    if (isNaN(cents) || cents < MIN_PAYOUT_CENTS) {
      setPayoutError(`Минимальная сумма выплаты — ${MIN_PAYOUT} BYN`)
      return
    }
    if (earnings && cents > earnings.availableForPayout) {
      setPayoutError(`Максимум: ${formatMoney(earnings.availableForPayout)}`)
      return
    }
    if (!payoutDetails.trim() || payoutDetails.trim().length < 5) {
      setPayoutError('Укажите реквизиты для перевода (номер карты, телефон или IBAN)')
      return
    }
    try {
      await requestPayout({ amount: cents, payoutDetails: payoutDetails.trim() }).unwrap()
      setPayoutAmount('')
      setPayoutDetails('')
      setPayoutSuccess(true)
      setTimeout(() => setPayoutSuccess(false), 5000)
    } catch (e: unknown) {
      const err = e as { data?: { error?: { message?: string } } }
      setPayoutError(err?.data?.error?.message ?? 'Ошибка при запросе выплаты')
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const available = earnings?.availableForPayout ?? 0

  const stats = [
    { label: 'Всего заработано', value: formatMoney(earnings?.totalEarned ?? 0), icon: TrendingUp, color: 'text-emerald-500' },
    { label: 'Выплачено', value: formatMoney(earnings?.totalPaidOut ?? 0), icon: BadgeCheck, color: 'text-blue-500' },
    { label: 'Ожидает выплаты', value: formatMoney(earnings?.pendingPayout ?? 0), icon: Clock, color: 'text-amber-500' },
    { label: 'Доступно к выплате', value: formatMoney(available), icon: Wallet, color: 'text-primary' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="container mx-auto max-w-5xl px-4 py-12">
        <h1 className="mb-8 text-3xl font-bold">Мои заработки</h1>

        {/* Stats */}
        <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {stats.map(s => (
            <div key={s.label} className="rounded-2xl border border-border bg-card p-5">
              <s.icon className={`mb-2 h-5 w-5 ${s.color}`} />
              <p className="text-xl font-bold">{s.value}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Payout request form */}
        {available >= MIN_PAYOUT_CENTS ? (
          <div className="mb-8 rounded-2xl border border-border bg-card p-6">
            <div className="mb-5 flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold">Запросить выплату</h2>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {/* Amount */}
              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Сумма (BYN) <span className="text-muted-foreground font-normal">— мин. {MIN_PAYOUT} BYN</span>
                </label>
                <input
                  type="number"
                  min={MIN_PAYOUT}
                  step="0.01"
                  value={payoutAmount}
                  onChange={e => setPayoutAmount(e.target.value)}
                  placeholder={`до ${formatMoney(available)}`}
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>

              {/* Payout details */}
              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Реквизиты для перевода
                </label>
                <input
                  type="text"
                  value={payoutDetails}
                  onChange={e => setPayoutDetails(e.target.value)}
                  placeholder="Номер карты, телефон или IBAN"
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>
            </div>

            {payoutError && (
              <p className="mt-3 flex items-center gap-1.5 text-sm text-destructive">
                <Info className="h-4 w-4 shrink-0" />{payoutError}
              </p>
            )}
            {payoutSuccess && (
              <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300">
                ✅ Заявка отправлена! Администратор обработает её в течение 1–3 рабочих дней.
              </div>
            )}

            <div className="mt-4 flex items-center justify-between gap-4">
              <p className="text-xs text-muted-foreground">
                После одобрения деньги переводятся на указанные реквизиты. Комиссия платформы — 25%.
              </p>
              <Button onClick={handlePayoutRequest} isLoading={payoutLoading} className="shrink-0">
                Отправить заявку
              </Button>
            </div>
          </div>
        ) : available > 0 ? (
          <div className="mb-8 rounded-2xl border border-dashed border-border bg-muted/20 p-5 text-sm text-muted-foreground">
            <Info className="mb-1 h-4 w-4" />
            Для вывода средств необходимо накопить минимум <strong>{MIN_PAYOUT} BYN</strong>.
            Доступно: {formatMoney(available)}.
          </div>
        ) : null}

        {/* By course */}
        {(earnings?.byCourse.length ?? 0) > 0 && (
          <div className="mb-8">
            <h2 className="mb-4 text-lg font-semibold">По курсам</h2>
            <div className="overflow-hidden rounded-2xl border border-border bg-card">
              {earnings!.byCourse.map((c, i) => (
                <div key={c.courseId} className={`flex items-center gap-4 px-5 py-4 ${i > 0 ? 'border-t border-border' : ''}`}>
                  {c.coverImage
                    ? <img src={c.coverImage} alt="" className="h-10 w-14 rounded-lg object-cover shrink-0" />
                    : <div className="h-10 w-14 rounded-lg bg-muted shrink-0" />
                  }
                  <div className="flex-1 min-w-0">
                    <p className="truncate font-medium text-sm">{c.title}</p>
                    <p className="text-xs text-muted-foreground">{c.sales} продаж</p>
                  </div>
                  <p className="shrink-0 font-semibold text-emerald-600 dark:text-emerald-400">{formatMoney(c.earned)}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Payout history */}
        {(earnings?.payouts.length ?? 0) > 0 && (
          <div className="mb-8">
            <h2 className="mb-4 text-lg font-semibold">История выплат</h2>
            <div className="space-y-3">
              {earnings!.payouts.map(p => (
                <div key={p.id} className="rounded-2xl border border-border bg-card p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-lg font-bold">{formatMoney(p.amount)}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(p.createdAt).toLocaleDateString('ru-RU', { day: '2-digit', month: 'long', year: 'numeric' })}
                      </p>
                      {p.payoutDetails && (
                        <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                          <CreditCard className="h-3.5 w-3.5 shrink-0" />
                          {p.payoutDetails}
                        </p>
                      )}
                      {p.adminNote && (
                        <p className="mt-1 text-xs italic text-muted-foreground">{p.adminNote}</p>
                      )}
                    </div>
                    <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${PAYOUT_STATUS_COLOR[p.status]}`}>
                      {PAYOUT_STATUS_LABEL[p.status]}
                    </span>
                  </div>
                  {/* Progress steps */}
                  {p.status !== 'REJECTED' && (
                    <div className="mt-4 flex items-center gap-1">
                      {(['PENDING', 'PROCESSING', 'COMPLETED'] as const).map((step, idx) => {
                        const current = PAYOUT_STATUS_STEP[p.status]
                        const active = idx + 1 <= current
                        return (
                          <div key={step} className="flex flex-1 items-center gap-1">
                            <div className={`h-1.5 flex-1 rounded-full transition-colors ${active ? 'bg-primary' : 'bg-muted'}`} />
                            {idx === 2 && (
                              <div className={`h-4 w-4 rounded-full border-2 flex items-center justify-center shrink-0 ${active ? 'border-primary bg-primary' : 'border-muted bg-background'}`}>
                                {active && <BadgeCheck className="h-2.5 w-2.5 text-white" />}
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Sales history */}
        {(earnings?.salesHistory.length ?? 0) > 0 && (
          <div>
            <h2 className="mb-4 text-lg font-semibold">История продаж</h2>
            <div className="overflow-hidden rounded-2xl border border-border bg-card">
              {earnings!.salesHistory.slice(0, 20).map((r, i) => (
                <div key={r.id} className={`flex items-center gap-4 px-5 py-3.5 ${i > 0 ? 'border-t border-border' : ''}`}>
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-medium">{r.course.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {r.student.firstName} {r.student.lastName} · {new Date(r.createdAt).toLocaleDateString('ru-RU')}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">+{formatMoney(r.teacherEarning)}</p>
                    <p className="text-xs text-muted-foreground">из {formatMoney(r.amount)}</p>
                  </div>
                </div>
              ))}
            </div>
            {earnings!.salesHistory.length > 20 && (
              <p className="mt-2 text-center text-xs text-muted-foreground">Показаны последние 20 продаж из {earnings!.salesHistory.length}</p>
            )}
          </div>
        )}

        {(earnings?.salesHistory.length ?? 0) === 0 && (
          <div className="rounded-2xl border border-dashed border-border p-12 text-center">
            <Wallet className="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" />
            <p className="text-muted-foreground">Продаж пока нет. Опубликуйте платный курс, чтобы начать зарабатывать.</p>
            <Button variant="outline" className="mt-4" onClick={() => window.location.href = '/admin/courses'}>
              Мои курсы <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
