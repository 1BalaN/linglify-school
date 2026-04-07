import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useChangePasswordMutation } from '@/entities/user'
import { Button, Input } from '@/shared/ui'
import { useState } from 'react'
import { CheckCircle, Lock, Info } from 'lucide-react'
import { useSelector } from 'react-redux'
import { RootState } from '@/app/store'
import { useTranslation } from 'react-i18next'

const createPasswordSchema = (t: (key: string) => string) =>
  z
    .object({
      currentPassword: z.string().min(6, t('password.validation.min6')).optional(),
      newPassword: z.string().min(6, t('password.validation.newMin6')),
      confirmPassword: z.string(),
    })
    .refine(data => data.newPassword === data.confirmPassword, {
      message: t('password.validation.mismatch'),
      path: ['confirmPassword'],
    })

type PasswordFormData = z.infer<ReturnType<typeof createPasswordSchema>>

export const PasswordChange = () => {
  const { t } = useTranslation('profile')
  const { user } = useSelector((state: RootState) => state.auth)
  const [changePassword, { isLoading, error }] = useChangePasswordMutation()
  const [success, setSuccess] = useState(false)
  const hasPassword = user?.hasPassword ?? true

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PasswordFormData>({
    resolver: zodResolver(createPasswordSchema(t)),
  })

  const onSubmit = async (data: PasswordFormData) => {
    try {
      setSuccess(false)
      await changePassword({
        currentPassword: data.currentPassword || '',
        newPassword: data.newPassword,
      }).unwrap()
      setSuccess(true)
      reset()
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      console.error('Password change error:', err)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start space-x-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/30">
          <Lock className="h-7 w-7 text-white" />
        </div>
        <div>
          <h3 className="text-2xl font-bold text-gradient">
            {!hasPassword ? t('password.setTitle') : t('password.changeTitle')}
          </h3>
          <p className="text-muted-foreground mt-1">
            {!hasPassword
              ? t('password.setSubtitle')
              : t('password.changeSubtitle')}
          </p>
        </div>
      </div>

      {!hasPassword && user?.oauthProvider && (
        <div className="flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950/30">
          <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-800 dark:text-blue-200">
            <p className="font-medium mb-1">
              {t('password.oauthTitle', {
                provider: user.oauthProvider === 'GOOGLE' ? 'Google' : user.oauthProvider,
              })}
            </p>
            <p>
              {t('password.oauthBody', {
                provider: user.oauthProvider === 'GOOGLE' ? 'Google' : 'OAuth',
              })}
            </p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {hasPassword && (
          <Input
            {...register('currentPassword')}
            type="password"
            label={t('password.currentPassword')}
            placeholder="••••••••"
            error={errors.currentPassword?.message}
            autoComplete="current-password"
          />
        )}

        <Input
          {...register('newPassword')}
          type="password"
          label={t('password.newPassword')}
          placeholder="••••••••"
          error={errors.newPassword?.message}
          autoComplete="new-password"
          helperText={t('password.minHint')}
        />

        <Input
          {...register('confirmPassword')}
          type="password"
          label={t('password.confirmPassword')}
          placeholder="••••••••"
          error={errors.confirmPassword?.message}
          autoComplete="new-password"
        />

        {error && (
          <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
            {'data' in error
              ? (error.data as { error: { message: string } }).error.message
              : t('password.error')}
          </div>
        )}

        {success && (
          <div className="flex items-center gap-2 rounded-lg border border-green-500/20 bg-green-500/10 p-3 text-sm text-green-600 dark:text-green-400">
            <CheckCircle className="h-4 w-4" />
            {t('password.success')}
          </div>
        )}

        <Button type="submit" className="w-full" isLoading={isLoading}>
          {t('password.submit')}
        </Button>
      </form>

      <div className="rounded-xl glass p-5">
        <h4 className="mb-3 text-sm font-semibold text-gradient">
          {t('password.securityTips')}
        </h4>
        <ul className="space-y-2 text-sm text-muted-foreground">
          {(t('password.tips', { returnObjects: true }) as string[]).map(tip => (
            <li key={tip} className="flex items-center space-x-2">
              <span className="text-primary">✓</span>
              <span>{tip}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
