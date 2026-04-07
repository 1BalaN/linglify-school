import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useResetPasswordMutation } from '@/entities/user'
import { Button, Input } from '@/shared/ui'
import { Lock, CheckCircle, AlertCircle } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

const createResetPasswordSchema = (t: (k: string) => string) =>
  z
    .object({
      password: z
        .string()
        .min(8, t('authFlow.reset.validation.min8'))
        .max(128, t('authFlow.reset.validation.max128'))
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, t('authFlow.reset.validation.pattern')),
      confirmPassword: z.string(),
    })
    .refine(data => data.password === data.confirmPassword, {
      message: t('authFlow.reset.validation.mismatch'),
      path: ['confirmPassword'],
    })

type ResetPasswordFormData = z.infer<ReturnType<typeof createResetPasswordSchema>>

export const ResetPasswordPage = () => {
  const { t } = useTranslation('platform')
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token')
  const [resetPassword, { isLoading }] = useResetPasswordMutation()
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const schema = useMemo(() => createResetPasswordSchema(t), [t])

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(schema),
  })

  const ruleItems = t('authFlow.reset.rules', { returnObjects: true }) as string[]

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) {
      setError(t('authFlow.reset.missingToken'))
      return
    }

    try {
      setError(null)
      await resetPassword({ token, password: data.password }).unwrap()
      setSuccess(true)
      setTimeout(() => {
        navigate('/login')
      }, 3000)
    } catch (err) {
      const errorData = err as { data?: { error?: { message?: string } } }
      setError(errorData.data?.error?.message || t('authFlow.reset.errorDefault'))
    }
  }

  if (!token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 py-12">
        <div className="container mx-auto max-w-md px-4">
          <div className="mx-auto w-full max-w-md space-y-6 rounded-2xl glass-card p-8 backdrop-blur-xl transition-all duration-300">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10">
                <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
              </div>
              <h1 className="mb-3 text-2xl font-bold text-foreground">
                {t('authFlow.reset.invalidTitle')}
              </h1>
              <p className="text-muted-foreground mb-6">
                {t('authFlow.reset.invalidBody')}
              </p>
              <Button
                variant="primary"
                className="w-full"
                onClick={() => navigate('/forgot-password')}
              >
                {t('authFlow.reset.requestNew')}
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 py-12">
        <div className="container mx-auto max-w-md px-4">
          <div className="mx-auto w-full max-w-md space-y-6 rounded-2xl glass-card p-8 backdrop-blur-xl transition-all duration-300">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
                <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <h1 className="mb-3 text-2xl font-bold text-gradient">
                {t('authFlow.reset.doneTitle')}
              </h1>
              <p className="text-muted-foreground mb-6">
                {t('authFlow.reset.doneBody')}
              </p>
              <p className="text-sm text-muted-foreground">
                {t('authFlow.reset.redirecting')}
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 py-12">
      <div className="container mx-auto max-w-md px-4">
        <div className="mx-auto w-full max-w-md space-y-6 rounded-2xl glass-card p-8 backdrop-blur-xl transition-all duration-300 hover:shadow-2xl hover:shadow-primary/10">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/30">
              <Lock className="h-8 w-8 text-white" />
            </div>
            <h1 className="mb-2 text-3xl font-bold text-gradient">
              {t('authFlow.reset.title')}
            </h1>
            <p className="text-muted-foreground">
              {t('authFlow.reset.subtitle')}
            </p>
          </div>

          {error && (
            <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              {...register('password')}
              type="password"
              label={t('authFlow.reset.newPassword')}
              placeholder={t('authFlow.reset.newPasswordPh')}
              error={errors.password?.message}
            />

            <Input
              {...register('confirmPassword')}
              type="password"
              label={t('authFlow.reset.confirmPassword')}
              placeholder={t('authFlow.reset.confirmPasswordPh')}
              error={errors.confirmPassword?.message}
            />

            <div className="rounded-xl glass p-4">
              <h4 className="mb-2 text-sm font-semibold text-gradient">
                {t('authFlow.reset.rulesTitle')}
              </h4>
              <ul className="space-y-1 text-xs text-muted-foreground">
                {ruleItems.map(rule => (
                  <li key={rule}>• {rule}</li>
                ))}
              </ul>
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? t('authFlow.reset.saving') : t('authFlow.reset.saveSubmit')}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
