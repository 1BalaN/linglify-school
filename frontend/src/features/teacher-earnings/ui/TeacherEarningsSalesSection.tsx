import { useTranslation } from 'react-i18next'
import { formatDateShort, formatMoney } from '@/shared/lib/format'
import type { CourseRevenue } from '@/shared/types/user'

const SALES_PREVIEW = 20

export const TeacherEarningsSalesSection = ({ salesHistory }: { salesHistory: CourseRevenue[] }) => {
  const { t } = useTranslation('platform')

  if (salesHistory.length === 0) return null

  const rows = salesHistory.slice(0, SALES_PREVIEW)

  return (
    <section>
      <h2 className="mb-4 text-lg font-semibold">{t('teacherCabinet.earnings.salesHistory')}</h2>

      <div className="hidden overflow-hidden rounded-2xl border border-border/80 bg-card/50 shadow-sm backdrop-blur-sm md:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/80 bg-muted/40 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <th className="px-5 py-3">{t('teacherCabinet.earnings.salesColCourse')}</th>
              <th className="px-5 py-3">{t('teacherCabinet.earnings.salesColStudent')}</th>
              <th className="px-5 py-3">{t('teacherCabinet.earnings.salesColDate')}</th>
              <th className="px-5 py-3 text-right">{t('teacherCabinet.earnings.salesColShare')}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr
                key={r.id}
                className={`border-b border-border/60 last:border-0 ${i % 2 === 1 ? 'bg-muted/20' : ''}`}
              >
                <td className="max-w-[200px] truncate px-5 py-3 font-medium text-foreground">{r.course.title}</td>
                <td className="px-5 py-3 text-muted-foreground">
                  {r.student.firstName} {r.student.lastName}
                </td>
                <td className="whitespace-nowrap px-5 py-3 text-muted-foreground tabular-nums">
                  {formatDateShort(r.createdAt)}
                </td>
                <td className="px-5 py-3 text-right">
                  <p className="font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
                    +{formatMoney(r.teacherEarning)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {t('teacherCabinet.earnings.fromAmount', { amount: formatMoney(r.amount) })}
                  </p>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border/80 bg-card/50 md:hidden">
        {rows.map((r, i) => (
          <div
            key={r.id}
            className={`flex items-center gap-4 px-5 py-3.5 ${i > 0 ? 'border-t border-border/80' : ''}`}
          >
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{r.course.title}</p>
              <p className="text-xs text-muted-foreground">
                {r.student.firstName} {r.student.lastName} · {formatDateShort(r.createdAt)}
              </p>
            </div>
            <div className="shrink-0 text-right">
              <p className="text-sm font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
                +{formatMoney(r.teacherEarning)}
              </p>
              <p className="text-xs text-muted-foreground">
                {t('teacherCabinet.earnings.fromAmount', { amount: formatMoney(r.amount) })}
              </p>
            </div>
          </div>
        ))}
      </div>

      {salesHistory.length > SALES_PREVIEW ? (
        <p className="mt-2 text-center text-xs text-muted-foreground">
          {t('teacherCabinet.earnings.salesShown', { total: salesHistory.length })}
        </p>
      ) : null}
    </section>
  )
}
