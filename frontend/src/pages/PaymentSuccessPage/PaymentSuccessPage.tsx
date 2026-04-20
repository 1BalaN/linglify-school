import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { CheckCircle, ArrowRight, Loader2, AlertCircle } from 'lucide-react'
import { Button } from '@/shared/ui'
import { useConfirmPaymentMutation } from '@/entities/payment'
import { useTranslation } from 'react-i18next'

export const PaymentSuccessPage = () => {
  const { t } = useTranslation('platform')
  const location = useLocation()
  const navigate = useNavigate()

  const searchParams = new URLSearchParams(location.search)
  const courseId = searchParams.get('courseId')
  const sessionId = searchParams.get('session_id')

  const [confirmPayment, { isLoading, isError }] = useConfirmPaymentMutation()

  useEffect(() => {
    if (!sessionId) return
    void (async () => {
      try {
        await confirmPayment({ sessionId }).unwrap()
      } catch {
        // Error surfaces via isError in the UI
      }
    })()
  }, [sessionId, confirmPayment])

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-cyan-50 dark:from-emerald-950/30 dark:via-slate-950 dark:to-cyan-950/30 flex items-center justify-center px-4">
      <div className="max-w-md rounded-2xl bg-white shadow-xl shadow-emerald-500/10 ring-1 ring-emerald-100 dark:bg-slate-900 dark:ring-emerald-900/40 p-8 text-center space-y-4">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-300">
          <CheckCircle className="h-9 w-9" />
        </div>
        <h1 className="text-2xl font-bold text-foreground">{t('payments.success.title')}</h1>
        {isLoading && (
          <p className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            {t('payments.success.confirming')}
          </p>
        )}
        {!isLoading && isError && (
          <p className="flex items-center justify-center gap-2 text-sm text-red-600 dark:text-red-300">
            <AlertCircle className="h-4 w-4" />
            {t('payments.success.confirmError')}
          </p>
        )}
        {!isLoading && !isError && (
          <p className="text-sm text-muted-foreground">
            {t('payments.success.accessReady')}
          </p>
        )}
        <div className="flex flex-col gap-3 pt-2">
          {courseId ? (
            <Button
              onClick={() => navigate(`/courses/${courseId}/learn`)}
              className="w-full"
              size="lg"
            >
              {t('payments.success.startLearning')}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : null}
          <Button
            variant="outline"
            onClick={() => navigate('/my-courses')}
            className="w-full"
            size="sm"
          >
            {t('payments.success.myCourses')}
          </Button>
        </div>
      </div>
    </div>
  )
}
