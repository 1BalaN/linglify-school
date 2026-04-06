import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useVerifyEmailMutation } from '@/entities/user'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { Button } from '@/shared/ui'
import { useTranslation } from 'react-i18next'

export const VerifyEmailPage = () => {
  const { t } = useTranslation('platform')
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [verifyEmail] = useVerifyEmailMutation()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const token = searchParams.get('token')

    if (!token) {
      setStatus('error')
      setMessage(t('authFlow.verify.noToken'))
      return
    }

    const verify = async () => {
      try {
        await verifyEmail({ token }).unwrap()
        setStatus('success')
        setMessage(t('authFlow.verify.successDefault'))
      } catch (error) {
        setStatus('error')
        const errorMessage =
          (error as { data?: { error?: { message?: string } } })?.data?.error?.message ||
          t('authFlow.verify.failDefault')
        setMessage(errorMessage)
      }
    }

    void verify()
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once per token; avoid re-verify on i18n t reference changes
  }, [searchParams, verifyEmail])

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5 px-4 py-12">
      <div className="mx-auto w-full max-w-md space-y-6 rounded-xl border border-border bg-card p-8 shadow-2xl">
        <div className="text-center">
          {status === 'loading' && (
            <>
              <Loader2 className="mx-auto mb-4 h-16 w-16 animate-spin text-primary" />
              <h2 className="text-2xl font-bold text-foreground">
                {t('authFlow.verify.loadingTitle')}
              </h2>
              <p className="mt-2 text-muted-foreground">
                {t('authFlow.verify.loadingWait')}
              </p>
            </>
          )}

          {status === 'success' && (
            <>
              <CheckCircle className="mx-auto mb-4 h-16 w-16 text-green-600 dark:text-green-400" />
              <h2 className="text-2xl font-bold text-foreground">
                {t('authFlow.verify.successTitle')}
              </h2>
              <p className="mt-2 text-muted-foreground">{message}</p>
              <Button
                className="mt-6 w-full"
                onClick={() => navigate('/', { replace: true })}
              >
                {t('authFlow.verify.goHome')}
              </Button>
            </>
          )}

          {status === 'error' && (
            <>
              <XCircle className="mx-auto mb-4 h-16 w-16 text-destructive" />
              <h2 className="text-2xl font-bold text-foreground">
                {t('authFlow.verify.errorTitle')}
              </h2>
              <p className="mt-2 text-muted-foreground">{message}</p>
              <div className="mt-6 space-y-2">
                <Button
                  className="w-full"
                  onClick={() => navigate('/', { replace: true })}
                >
                  {t('authFlow.verify.goHome')}
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => navigate('/login', { replace: true })}
                >
                  {t('authFlow.verify.login')}
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
