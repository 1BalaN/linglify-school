import type { TeacherEarnings } from '@/entities/revenue'
import { MIN_PAYOUT_CENTS } from '@/features/teacher-earnings/lib/payoutUi'
import type { useTeacherPayoutForm } from '@/features/teacher-earnings/model/useTeacherPayoutForm'
import { TeacherEarningsHeader } from '@/features/teacher-earnings/ui/TeacherEarningsHeader'
import { TeacherEarningsStatsGrid } from '@/features/teacher-earnings/ui/TeacherEarningsStatsGrid'
import {
  TeacherEarningsMinAccumulateNotice,
  TeacherEarningsPayoutForm,
} from '@/features/teacher-earnings/ui/TeacherEarningsPayoutForm'
import { TeacherEarningsByCourseSection } from '@/features/teacher-earnings/ui/TeacherEarningsByCourseSection'
import { TeacherEarningsPayoutHistory } from '@/features/teacher-earnings/ui/TeacherEarningsPayoutHistory'
import { TeacherEarningsSalesSection } from '@/features/teacher-earnings/ui/TeacherEarningsSalesSection'
import { TeacherEarningsEmptyState } from '@/features/teacher-earnings/ui/TeacherEarningsEmptyState'

type PayoutForm = ReturnType<typeof useTeacherPayoutForm>

interface TeacherEarningsScreenProps {
  earnings: TeacherEarnings | undefined
  payout: PayoutForm
}

export const TeacherEarningsScreen = ({ earnings, payout }: TeacherEarningsScreenProps) => {
  const available = earnings?.availableForPayout ?? 0
  const showSalesEmptyCta = earnings !== undefined && earnings.salesHistory.length === 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="container mx-auto max-w-5xl px-4 py-10 md:py-12">
        <TeacherEarningsHeader availableForPayout={available} />
        <TeacherEarningsStatsGrid earnings={earnings} />

        {earnings && available >= MIN_PAYOUT_CENTS ? (
          <TeacherEarningsPayoutForm earnings={earnings} form={payout} />
        ) : earnings && available > 0 ? (
          <TeacherEarningsMinAccumulateNotice available={available} minByn={payout.minPayoutByn} />
        ) : null}

        {earnings ? <TeacherEarningsByCourseSection earnings={earnings} /> : null}
        {earnings ? <TeacherEarningsPayoutHistory payouts={earnings.payouts} /> : null}
        {earnings ? <TeacherEarningsSalesSection salesHistory={earnings.salesHistory} /> : null}

        {showSalesEmptyCta ? <TeacherEarningsEmptyState /> : null}
      </div>
    </div>
  )
}
