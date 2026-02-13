import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { useLoginMutation } from '@/entities/user'
import { setCredentials } from '@/entities/user'
import { useDispatch } from 'react-redux'
import { Button, Input } from '@/shared/ui'
import { LogIn } from 'lucide-react'

const loginSchema = z.object({
  email: z.string().email('Введите корректный email'),
  password: z.string().min(1, 'Введите пароль'),
})

type LoginFormData = z.infer<typeof loginSchema>

export const LoginForm = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [login, { isLoading, error }] = useLoginMutation()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormData) => {
    try {
      const result = await login(data).unwrap()
      dispatch(setCredentials(result.data))
      navigate('/')
    } catch (err) {
      console.error('Login error:', err)
    }
  }

  const handleGoogleLogin = () => {
    window.location.href = `${import.meta.env.VITE_API_URL}/auth/google?mode=login`
  }

  return (
    <div className="mx-auto w-full max-w-md space-y-6 rounded-2xl glass-card p-8 backdrop-blur-xl transition-all duration-300 hover:shadow-2xl hover:shadow-primary/10">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 shadow-lg shadow-violet-500/30 animate-float">
          <LogIn className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-gradient">Войти в аккаунт</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Добро пожаловать! Войдите, чтобы продолжить
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          {...register('email')}
          type="email"
          label="Email"
          placeholder="your@email.com"
          error={errors.email?.message}
          autoComplete="email"
        />

        <Input
          {...register('password')}
          type="password"
          label="Пароль"
          placeholder="••••••••"
          error={errors.password?.message}
          autoComplete="current-password"
        />

        {error && (
          <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
            {'data' in error
              ? (error.data as { error: { message: string } }).error.message
              : 'Произошла ошибка при входе'}
          </div>
        )}

        <Button type="submit" className="w-full" isLoading={isLoading}>
          Войти
        </Button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-card px-2 text-muted-foreground">Или</span>
        </div>
      </div>

      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={handleGoogleLogin}
      >
        <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="currentColor"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="currentColor"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="currentColor"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        Войти через Google
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Нет аккаунта?{' '}
        <Link
          to="/register"
          className="font-medium text-primary hover:underline"
        >
          Зарегистрироваться
        </Link>
      </p>
    </div>
  )
}
