import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link } from 'react-router-dom'
import { useForgotPasswordMutation } from '@/entities/user'
import { Button, Input } from '@/shared/ui'
import { ArrowLeft, Mail, CheckCircle } from 'lucide-react'
import { useState } from 'react'

const forgotPasswordSchema = z.object({
  email: z.string().email('Введите корректный email'),
})

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>

export const ForgotPasswordPage = () => {
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation()
  const [success, setSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
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
                Проверьте почту
              </h1>
              <p className="text-muted-foreground mb-6">
                Если указанный email зарегистрирован в системе, на него отправлена ссылка для восстановления пароля.
              </p>
              <p className="text-sm text-muted-foreground mb-6">
                Не получили письмо? Проверьте папку "Спам"
              </p>
              <Link to="/login">
                <Button variant="primary" className="w-full">
                  Вернуться к входу
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
                Забыли пароль?
              </h1>
              <p className="text-muted-foreground">
                Введите email, и мы отправим вам ссылку для восстановления
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input
                {...register('email')}
                type="email"
                label="Email"
                placeholder="your@email.com"
                error={errors.email?.message}
              />

              <Button
                type="submit"
                variant="primary"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? 'Отправка...' : 'Отправить ссылку'}
              </Button>
            </form>

            <div className="text-center">
              <Link
                to="/login"
                className="inline-flex items-center text-sm text-primary hover:text-primary/80 transition-colors"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Вернуться к входу
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
