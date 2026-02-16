import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useChangePasswordMutation } from '@/entities/user'
import { Button, Input } from '@/shared/ui'
import { useState } from 'react'
import { CheckCircle, Lock } from 'lucide-react'

const passwordSchema = z
  .object({
    currentPassword: z.string().min(6, 'Минимум 6 символов'),
    newPassword: z.string().min(6, 'Пароль должен содержать минимум 6 символов'),
    confirmPassword: z.string(),
  })
  .refine(data => data.newPassword === data.confirmPassword, {
    message: 'Пароли не совпадают',
    path: ['confirmPassword'],
  })

type PasswordFormData = z.infer<typeof passwordSchema>

export const PasswordChange = () => {
  const [changePassword, { isLoading, error }] = useChangePasswordMutation()
  const [success, setSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  })

  const onSubmit = async (data: PasswordFormData) => {
    try {
      setSuccess(false)
      await changePassword({
        currentPassword: data.currentPassword,
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
            Изменить пароль
          </h3>
          <p className="text-muted-foreground mt-1">
            Обновите свой пароль для повышения безопасности
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          {...register('currentPassword')}
          type="password"
          label="Текущий пароль"
          placeholder="••••••••"
          error={errors.currentPassword?.message}
          autoComplete="current-password"
        />

        <Input
          {...register('newPassword')}
          type="password"
          label="Новый пароль"
          placeholder="••••••••"
          error={errors.newPassword?.message}
          autoComplete="new-password"
          helperText="Минимум 6 символов"
        />

        <Input
          {...register('confirmPassword')}
          type="password"
          label="Подтвердите новый пароль"
          placeholder="••••••••"
          error={errors.confirmPassword?.message}
          autoComplete="new-password"
        />

        {error && (
          <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
            {'data' in error
              ? (error.data as { error: { message: string } }).error.message
              : 'Произошла ошибка при смене пароля'}
          </div>
        )}

        {success && (
          <div className="flex items-center gap-2 rounded-lg border border-green-500/20 bg-green-500/10 p-3 text-sm text-green-600 dark:text-green-400">
            <CheckCircle className="h-4 w-4" />
            Пароль успешно изменен!
          </div>
        )}

        <Button type="submit" className="w-full" isLoading={isLoading}>
          Изменить пароль
        </Button>
      </form>

      <div className="rounded-xl glass p-5">
        <h4 className="mb-3 text-sm font-semibold text-gradient">
          Рекомендации по безопасности
        </h4>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex items-center space-x-2">
            <span className="text-primary">✓</span>
            <span>Используйте минимум 8 символов</span>
          </li>
          <li className="flex items-center space-x-2">
            <span className="text-primary">✓</span>
            <span>Включайте заглавные и строчные буквы</span>
          </li>
          <li className="flex items-center space-x-2">
            <span className="text-primary">✓</span>
            <span>Добавьте цифры и специальные символы</span>
          </li>
          <li className="flex items-center space-x-2">
            <span className="text-primary">✓</span>
            <span>Не используйте очевидные пароли</span>
          </li>
        </ul>
      </div>
    </div>
  )
}
