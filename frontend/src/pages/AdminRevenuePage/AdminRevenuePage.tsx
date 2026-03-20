import { useState } from 'react'
import { DollarSign, TrendingUp, Users, ShoppingBag, Loader2, CreditCard, Crown } from 'lucide-react'
import { Button } from '@/shared/ui'
import { formatMoney } from '@/shared/lib'
import { useGetAdminRevenueQuery, useUpdatePayoutStatusMutation } from '@/entities/revenue'
import type { PayoutStatus } from '@/shared/types/user'

const STATUS_LABEL: Record<PayoutStatus, string> = {
  PENDING:    'Ожидает',
  PROCESSING: 'В обработке',
  COMPLETED:  'Выплачено',
  REJECTED:   'Отклонено',
}
const STATUS_COLOR: Record<PayoutStatus, string> = {
  PENDING:    'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400',
  PROCESSING: 'bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400',
  COMPLETED:  'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400',
  REJECTED:   'bg-destructive/10 text-destructive',
}

export const AdminRevenuePage = () => {
  const { data, isLoading } = useGetAdminRevenueQuery()
  const [updatePayout] = useUpdatePayoutStatusMutation()
  const [activeTab, setActiveTab] = useState<'overview' | 'payouts' | 'sales'>('overview')
  const [processingId, setProcessingId] = useState<string | null>(null)

  const revenue = data?.data

  const handlePayoutAction = async (id: string, status: 'PROCESSING' | 'COMPLETED' | 'REJECTED', adminNote?: string) => {
    setProcessingId(id)
    try { await updatePayout({ id, status, adminNote }) } finally { setProcessingId(null) }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const sub = revenue?.summary
  const stats = [
    {
      label: 'Чистая прибыль',
      value: formatMoney(sub?.totalPlatformIncome ?? 0),
      sub: 'подписки + комиссия 25%',
      icon: TrendingUp,
      color: 'text-emerald-500',
      highlight: true,
    },
    {
      label: 'Подписки преподавателей',
      value: formatMoney(sub?.subscriptionRevenue ?? 0),
      sub: `${sub?.subscriptionByPlan.MONTHLY ?? 0} мес. · ${sub?.subscriptionByPlan.ANNUAL ?? 0} год.`,
      icon: Crown,
      color: 'text-amber-500',
      highlight: false,
    },
    {
      label: 'Комиссия с продаж (25%)',
      value: formatMoney(sub?.totalPlatformFee ?? 0),
      sub: `${sub?.totalSales ?? 0} продаж курсов`,
      icon: ShoppingBag,
      color: 'text-primary',
      highlight: false,
    },
    {
      label: 'Выплачено преподавателям',
      value: formatMoney(sub?.totalTeacherPayout ?? 0),
      sub: `75% · ${sub?.teacherCount ?? 0} преп.`,
      icon: Users,
      color: 'text-blue-500',
      highlight: false,
    },
    {
      label: 'Оборот курсов',
      value: formatMoney(sub?.totalRevenue ?? 0),
      sub: 'общая сумма покупок',
      icon: DollarSign,
      color: 'text-muted-foreground',
      highlight: false,
    },
  ]

  const pendingPayouts = revenue?.payouts.filter(p => p.status === 'PENDING' || p.status === 'PROCESSING') ?? []

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-6xl px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Выручка платформы</h1>
          {pendingPayouts.length > 0 && (
            <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700 dark:bg-amber-950/50 dark:text-amber-400">
              {pendingPayouts.length} заявок на выплату
            </span>
          )}
        </div>

        {/* Stats */}
        <div className="mb-8 space-y-4">
          {/* Main income card — full width */}
          {stats.filter(s => s.highlight).map(s => (
            <div
              key={s.label}
              className="rounded-2xl border-2 border-emerald-200 bg-gradient-to-r from-emerald-50 to-emerald-50/40 p-6 dark:border-emerald-900/60 dark:from-emerald-950/30 dark:to-transparent"
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <s.icon className={`h-5 w-5 ${s.color}`} />
                    <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">{s.label}</p>
                  </div>
                  <p className="text-4xl font-bold text-emerald-700 dark:text-emerald-300">{s.value}</p>
                  <p className="mt-1 text-sm text-emerald-600/70 dark:text-emerald-400/70">{s.sub}</p>
                </div>
                <div className="hidden sm:flex flex-col items-end gap-1 text-xs text-emerald-600/60 dark:text-emerald-400/60">
                  <span>Подписки: {formatMoney(sub?.subscriptionRevenue ?? 0)}</span>
                  <span>Комиссия 25%: {formatMoney(sub?.totalPlatformFee ?? 0)}</span>
                </div>
              </div>
            </div>
          ))}
          {/* Secondary stats */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {stats.filter(s => !s.highlight).map(s => (
              <div key={s.label} className="rounded-2xl border border-border bg-card p-5">
                <s.icon className={`mb-2 h-5 w-5 ${s.color}`} />
                <p className="text-2xl font-bold">{s.value}</p>
                <p className="text-xs font-medium text-foreground/70">{s.label}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{s.sub}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex gap-1 rounded-xl border border-border bg-muted/40 p-1 w-fit">
          {(['overview', 'payouts', 'sales'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                activeTab === tab ? 'bg-card shadow text-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab === 'overview' ? 'По преподавателям' : tab === 'payouts' ? `Выплаты${pendingPayouts.length ? ` (${pendingPayouts.length})` : ''}` : 'История продаж'}
            </button>
          ))}
        </div>

        {/* Overview tab */}
        {activeTab === 'overview' && (
          <div className="overflow-hidden rounded-2xl border border-border bg-card">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="px-5 py-3 text-left font-medium text-muted-foreground">Преподаватель</th>
                  <th className="px-5 py-3 text-right font-medium text-muted-foreground">Продаж</th>
                  <th className="px-5 py-3 text-right font-medium text-muted-foreground">Выручка</th>
                  <th className="px-5 py-3 text-right font-medium text-muted-foreground">Платформа (25%)</th>
                  <th className="px-5 py-3 text-right font-medium text-muted-foreground">Преп. (75%)</th>
                </tr>
              </thead>
              <tbody>
                {(revenue?.byTeacher ?? []).map((t, i) => (
                  <tr key={t.teacherId} className={i > 0 ? 'border-t border-border' : ''}>
                    <td className="px-5 py-3">
                      <p className="font-medium">{t.name}</p>
                      <p className="text-xs text-muted-foreground">{t.email}</p>
                    </td>
                    <td className="px-5 py-3 text-right">{t.sales}</td>
                    <td className="px-5 py-3 text-right font-medium">{formatMoney(t.totalAmount)}</td>
                    <td className="px-5 py-3 text-right text-emerald-600 dark:text-emerald-400">{formatMoney(t.platformFee)}</td>
                    <td className="px-5 py-3 text-right text-blue-600 dark:text-blue-400">{formatMoney(t.teacherEarning)}</td>
                  </tr>
                ))}
                {(revenue?.byTeacher.length ?? 0) === 0 && (
                  <tr><td colSpan={5} className="px-5 py-10 text-center text-muted-foreground">Продаж пока нет</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Payouts tab */}
        {activeTab === 'payouts' && (
          <div className="space-y-3">
            {(revenue?.payouts ?? []).map(p => (
              <div key={p.id} className="rounded-2xl border border-border bg-card p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold">{formatMoney(p.amount)}</p>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      {p.teacher.firstName} {p.teacher.lastName} · {p.teacher.email}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{new Date(p.createdAt).toLocaleDateString('ru-RU', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                    {p.payoutDetails && (
                      <p className="mt-1.5 flex items-center gap-1.5 rounded-lg bg-muted/50 px-2.5 py-1.5 text-xs font-medium">
                        <CreditCard className="h-3.5 w-3.5 shrink-0 text-primary" />
                        {p.payoutDetails}
                      </p>
                    )}
                    {p.adminNote && <p className="mt-1 text-xs text-muted-foreground italic">{p.adminNote}</p>}
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${STATUS_COLOR[p.status]}`}>
                      {STATUS_LABEL[p.status]}
                    </span>
                    {(p.status === 'PENDING' || p.status === 'PROCESSING') && (
                      <>
                        <Button size="sm" onClick={() => handlePayoutAction(p.id, 'COMPLETED')} isLoading={processingId === p.id} className="text-xs">
                          ✓ Выплачено
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => {
                          const note = prompt('Причина отклонения (необязательно):') ?? undefined
                          void handlePayoutAction(p.id, 'REJECTED', note)
                        }} isLoading={processingId === p.id} className="text-xs">
                          Отклонить
                        </Button>
                        {p.status === 'PENDING' && (
                          <Button size="sm" variant="outline" onClick={() => handlePayoutAction(p.id, 'PROCESSING')} isLoading={processingId === p.id} className="text-xs">
                            В обработку
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {(revenue?.payouts.length ?? 0) === 0 && (
              <div className="rounded-2xl border border-dashed border-border p-10 text-center text-muted-foreground">
                Заявок на выплату нет
              </div>
            )}
          </div>
        )}

        {/* Sales history tab */}
        {activeTab === 'sales' && (
          <div className="overflow-hidden rounded-2xl border border-border bg-card">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="px-5 py-3 text-left font-medium text-muted-foreground">Курс</th>
                  <th className="px-5 py-3 text-left font-medium text-muted-foreground">Преподаватель</th>
                  <th className="px-5 py-3 text-right font-medium text-muted-foreground">Сумма</th>
                  <th className="px-5 py-3 text-right font-medium text-muted-foreground">Платформа</th>
                  <th className="px-5 py-3 text-right font-medium text-muted-foreground">Дата</th>
                </tr>
              </thead>
              <tbody>
                {(revenue?.revenueHistory ?? []).slice(0, 50).map((r, i) => (
                  <tr key={r.id} className={i > 0 ? 'border-t border-border' : ''}>
                    <td className="px-5 py-3">
                      <p className="font-medium">{r.course.title}</p>
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">
                      {r.teacher.firstName} {r.teacher.lastName}
                    </td>
                    <td className="px-5 py-3 text-right font-medium">{formatMoney(r.amount)}</td>
                    <td className="px-5 py-3 text-right text-emerald-600 dark:text-emerald-400">{formatMoney(r.platformFee)}</td>
                    <td className="px-5 py-3 text-right text-muted-foreground">{new Date(r.createdAt).toLocaleDateString('ru-RU')}</td>
                  </tr>
                ))}
                {(revenue?.revenueHistory.length ?? 0) === 0 && (
                  <tr><td colSpan={5} className="px-5 py-10 text-center text-muted-foreground">Продаж пока нет</td></tr>
                )}
              </tbody>
            </table>
            {(revenue?.revenueHistory.length ?? 0) > 50 && (
              <div className="border-t border-border px-5 py-3 text-center text-xs text-muted-foreground">
                Показаны последние 50 из {revenue!.revenueHistory.length}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
