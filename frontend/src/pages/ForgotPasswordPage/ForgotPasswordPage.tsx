import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link } from 'react-router-dom'
import { useForgotPasswordMutation } from '@/entities/user'
import { Button, Input } from '@/shared/ui'
import { ArrowLeft, Mail, CheckCircle } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

const createForgotSchema = (t: (k: string) => string) =>
  z.object({
    email: z.string().email(t('authFlow.forgot.validation.email')),
  })

type ForgotPasswordFormData = z.infer<ReturnType<typeof createForgotSchema>>

export const ForgotPasswordPage = () => {
  const { t } = useTranslation('platform')
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation()
  const [success, setSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(createForgotSchema(t)),
  })

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      await forgotPassword(data).unwrap()
      setSuccess(true)
    } catch (err) {
      console.error('Forgot password error:', err)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 py-12">
      <div className="container mx-auto max-w-md px-4">
        {success ? (
          <div className="mx-auto w-full max-w-md space-y-6 rounded-2xl glass-card p-8 backdrop-blur-xl transition-all duration-300">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
                <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <h1 className="mb-3 text-2xl font-bold text-gradient">
                {t('authFlow.forgot.successTitle')}
              </h1>
              <p className="text-muted-foreground mb-6">
                {t('authFlow.forgot.successBody')}
              </p>
              <p className="text-sm text-muted-foreground mb-6">
                {t('authFlow.forgot.successSpam')}
              </p>
              <Link to="/login">
                <Button variant="primary" className="w-full">
                  {t('authFlow.forgot.backToLogin')}
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="mx-auto w-full max-w-md space-y-6 rounded-2xl glass-card p-8 backdrop-blur-xl transition-all duration-300 hover:shadow-2xl hover:shadow-primary/10">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/30">
                <Mail className="h-8 w-8 text-white" />
              </div>
              <h1 className="mb-2 text-3xl font-bold text-gradient">
                {t('authFlow.forgot.title')}
              </h1>
              <p className="text-muted-foreground">
                {t('authFlow.forgot.subtitle')}
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input
                {...register('email')}
                type="email"
                label={t('authFlow.forgot.emailLabel')}
                placeholder={t('authFlow.forgot.emailPlaceholder')}
                error={errors.email?.message}
              />

              <Button
                type="submit"
                variant="primary"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? t('authFlow.forgot.sending') : t('authFlow.forgot.submit')}
              </Button>
            </form>

            <div className="text-center">
              <Link
                to="/login"
                className="inline-flex items-center text-sm text-primary hover:text-primary/80 transition-colors"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                {t('authFlow.forgot.backToLogin')}
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
