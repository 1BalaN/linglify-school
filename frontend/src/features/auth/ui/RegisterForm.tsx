import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { useRegisterMutation } from '@/entities/user'
import { setCredentials } from '@/entities/user'
import { useDispatch } from 'react-redux'
import { Button, Input } from '@/shared/ui'
import { UserPlus } from 'lucide-react'

const registerSchema = z.object({
  email: z.string().email('Введите корректный email'),
  password: z
    .string()
    .min(8, 'Пароль должен быть не менее 8 символов')
    .max(128, 'Пароль не должен превышать 128 символов')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Пароль должен содержать хотя бы одну заглавную букву, одну строчную букву и одну цифру'
    ),
  firstName: z.string().min(2, 'Имя должно содержать минимум 2 символа').max(50, 'Имя не должно превышать 50 символов'),
  lastName: z.string().min(2, 'Фамилия должна содержать минимум 2 символа').max(50, 'Фамилия не должна превышать 50 символов'),
})

type RegisterFormData = z.infer<typeof registerSchema>

export const RegisterForm = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [register, { isLoading, error }] = useRegisterMutation()

  const {
    register: registerField,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = async (data: RegisterFormData) => {
    try {
      const result = await register(data).unwrap()
      dispatch(setCredentials(result.data))
      navigate('/')
    } catch (err) {
      console.error('Register error:', err)
    }
  }

  const handleGoogleRegister = () => {
    window.location.href = `${import.meta.env.VITE_API_URL}/auth/google?mode=register`
  }

  return (
    <div className="mx-auto w-full max-w-md space-y-6 rounded-2xl glass-card p-8 backdrop-blur-xl transition-all duration-300 hover:shadow-2xl hover:shadow-primary/10">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 shadow-lg shadow-violet-500/30 animate-float">
          <UserPlus className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-gradient">Создать аккаунт</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Начните свое обучение уже сегодня
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          {...registerField('firstName')}
          type="text"
          label="Имя"
          placeholder="Иван"
          error={errors.firstName?.message}
          autoComplete="given-name"
        />

        <Input
          {...registerField('lastName')}
          type="text"
          label="Фамилия"
          placeholder="Иванов"
          error={errors.lastName?.message}
          autoComplete="family-name"
        />

        <Input
          {...registerField('email')}
          type="email"
          label="Email"
          placeholder="your@email.com"
          error={errors.email?.message}
          autoComplete="email"
        />

        <Input
          {...registerField('password')}
          type="password"
          label="Пароль"
          placeholder="••••••••"
          error={errors.password?.message}
          autoComplete="new-password"
          helperText="Минимум 8 символов, заглавная и строчная буква, цифра"
        />

        {error && (
          <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
            {'data' in error
              ? (error.data as { error: { message: string } }).error.message
              : 'Произошла ошибка при регистрации'}
          </div>
        )}

        <Button type="submit" className="w-full" isLoading={isLoading}>
          Зарегистрироваться
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
        onClick={handleGoogleRegister}
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
        Регистрация через Google
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Уже есть аккаунт?{' '}
        <Link
          to="/login"
          className="font-medium text-primary hover:underline"
        >
          Войти
        </Link>
      </p>
    </div>
  )
}
