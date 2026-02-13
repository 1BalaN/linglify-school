import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useVerifyEmailMutation } from '@/entities/user'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { Button } from '@/shared/ui'

export const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [verifyEmail] = useVerifyEmailMutation()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const token = searchParams.get('token')

    if (!token) {
      setStatus('error')
      setMessage('Отсутствует токен верификации')
      return
    }

    const verify = async () => {
      try {
        await verifyEmail({ token }).unwrap()
        setStatus('success')
        setMessage('Email успешно подтвержден!')
      } catch (error) {
        setStatus('error')
        const errorMessage = 
          (error as { data?: { error?: { message?: string } } })?.data?.error?.message || 
          'Не удалось подтвердить email'
        setMessage(errorMessage)
      }
    }

    verify()
  }, [searchParams, verifyEmail])

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5 px-4 py-12">
      <div className="mx-auto w-full max-w-md space-y-6 rounded-xl border border-border bg-card p-8 shadow-2xl">
        <div className="text-center">
          {status === 'loading' && (
            <>
              <Loader2 className="mx-auto mb-4 h-16 w-16 animate-spin text-primary" />
              <h2 className="text-2xl font-bold text-foreground">
                Подтверждение email
              </h2>
              <p className="mt-2 text-muted-foreground">
                Пожалуйста, подождите...
              </p>
            </>
          )}

          {status === 'success' && (
            <>
              <CheckCircle className="mx-auto mb-4 h-16 w-16 text-green-600 dark:text-green-400" />
              <h2 className="text-2xl font-bold text-foreground">
                Email подтвержден!
              </h2>
              <p className="mt-2 text-muted-foreground">{message}</p>
              <Button
                className="mt-6 w-full"
                onClick={() => navigate('/', { replace: true })}
              >
                Перейти на главную
              </Button>
            </>
          )}

          {status === 'error' && (
            <>
              <XCircle className="mx-auto mb-4 h-16 w-16 text-destructive" />
              <h2 className="text-2xl font-bold text-foreground">
                Ошибка подтверждения
              </h2>
              <p className="mt-2 text-muted-foreground">{message}</p>
              <div className="mt-6 space-y-2">
                <Button
                  className="w-full"
                  onClick={() => navigate('/', { replace: true })}
                >
                  Перейти на главную
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => navigate('/login', { replace: true })}
                >
                  Войти
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
