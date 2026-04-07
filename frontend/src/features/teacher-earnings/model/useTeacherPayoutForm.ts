import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { formatMoney } from '@/shared/lib/format'
import { useCreatePayoutRequestMutation } from '@/entities/revenue'
import type { TeacherEarnings } from '@/entities/revenue'
import { MIN_PAYOUT_BYN, MIN_PAYOUT_CENTS } from '@/features/teacher-earnings/lib/payoutUi'

export function useTeacherPayoutForm(earnings: TeacherEarnings | undefined, teacherUserId: string | undefined) {
  const { t } = useTranslation('platform')
  const [requestPayout, { isLoading: payoutLoading }] = useCreatePayoutRequestMutation()
  const [payoutAmount, setPayoutAmount] = useState('')
  const [payoutDetails, setPayoutDetails] = useState('')
  const [payoutError, setPayoutError] = useState('')
  const [payoutSuccess, setPayoutSuccess] = useState(false)

  useEffect(() => {
    setPayoutAmount('')
    setPayoutDetails('')
    setPayoutError('')
    setPayoutSuccess(false)
  }, [teacherUserId])

  const submit = useCallback(async () => {
    setPayoutError('')
    const cents = Math.round(parseFloat(payoutAmount) * 100)
    if (Number.isNaN(cents) || cents < MIN_PAYOUT_CENTS) {
      setPayoutError(t('teacherCabinet.earnings.minAmountError', { min: MIN_PAYOUT_BYN }))
      return
    }
    if (earnings && cents > earnings.availableForPayout) {
      setPayoutError(
        t('teacherCabinet.earnings.maxAmountError', { amount: formatMoney(earnings.availableForPayout) }),
      )
      return
    }
    if (!payoutDetails.trim() || payoutDetails.trim().length < 5) {
      setPayoutError(t('teacherCabinet.earnings.detailsRequired'))
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
      setPayoutError(err?.data?.error?.message ?? t('teacherCabinet.earnings.payoutRequestError'))
    }
  }, [earnings, payoutAmount, payoutDetails, requestPayout, t])

  return {
    payoutAmount,
    setPayoutAmount,
    payoutDetails,
    setPayoutDetails,
    payoutError,
    payoutSuccess,
    payoutLoading,
    submit,
    minPayoutByn: MIN_PAYOUT_BYN,
  }
}
