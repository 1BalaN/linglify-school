import { useSelector } from 'react-redux'
import type { RootState } from '@/app/store'
import { useGetTeacherEarningsQuery } from '@/entities/revenue'
import {
  TeacherEarningsPageSkeleton,
  TeacherEarningsScreen,
  useTeacherPayoutForm,
} from '@/features/teacher-earnings'

export const TeacherEarningsPage = () => {
  const userId = useSelector((s: RootState) => s.auth.user?.id)
  const { data, isLoading } = useGetTeacherEarningsQuery(userId ?? '', { skip: !userId })
  const earnings = data?.data
  const payout = useTeacherPayoutForm(earnings, userId)

  if (!userId || isLoading) {
    return <TeacherEarningsPageSkeleton />
  }

  return <TeacherEarningsScreen earnings={earnings} payout={payout} />
}
