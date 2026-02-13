import { useState } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '@/app/store'
import { Button } from '@/shared/ui'
import { Mail, X, AlertCircle } from 'lucide-react'
import { useResendVerificationMutation } from '@/entities/user'

export const EmailVerificationBanner = () => {
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth)
  const [isVisible, setIsVisible] = useState(true)
  const [resendEmail] = useResendVerificationMutation()
  const [isSuccess, setIsSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  if (!isAuthenticated || !user || user.isEmailVerified || !isVisible) {
    return null
  }

  const handleResend = async () => {
    try {
      setIsLoading(true)
      await resendEmail({ email: user.email }).unwrap()
      setIsSuccess(true)
      setTimeout(() => setIsSuccess(false), 5000)
    } catch (error) {
      console.error('Resend email error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="border-b border-yellow-200 bg-yellow-50 dark:border-yellow-900/50 dark:bg-yellow-900/20">
      <div className="container mx-auto flex items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex flex-1 items-center space-x-3">
          <AlertCircle className="h-5 w-5 flex-shrink-0 text-yellow-600 dark:text-yellow-400" />
          <div className="flex-1">
            <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
              {isSuccess
                ? 'Письмо с подтверждением отправлено! Проверьте свою почту.'
                : 'Пожалуйста, подтвердите ваш email адрес для полного доступа к платформе.'}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {!isSuccess && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleResend}
              isLoading={isLoading}
              className="text-yellow-800 hover:bg-yellow-100 dark:text-yellow-200 dark:hover:bg-yellow-900/40"
            >
              <Mail className="mr-2 h-4 w-4" />
              Отправить повторно
            </Button>
          )}
          <button
            onClick={() => setIsVisible(false)}
            className="rounded-lg p-1 text-yellow-600 transition-colors hover:bg-yellow-100 dark:text-yellow-400 dark:hover:bg-yellow-900/40"
            aria-label="Закрыть"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
