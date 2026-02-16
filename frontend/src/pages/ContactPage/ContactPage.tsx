import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Mail, Phone, MapPin, Send, CheckCircle, AlertCircle } from 'lucide-react'
import { Button, Input } from '@/shared/ui'
import { useSendContactMessageMutation } from '@/entities/contact'

const contactSchema = z.object({
  name: z.string().min(2, 'Имя должно содержать минимум 2 символа'),
  email: z.string().email('Введите корректный email'),
  subject: z.string().min(5, 'Тема должна содержать минимум 5 символов'),
  message: z.string().min(10, 'Сообщение должно содержать минимум 10 символов'),
})

type ContactFormData = z.infer<typeof contactSchema>

export const ContactPage = () => {
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [sendMessage, { isLoading, error }] = useSendContactMessageMutation()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  })

  const onSubmit = async (data: ContactFormData) => {
    try {
      await sendMessage(data).unwrap()
      setIsSubmitted(true)
      reset()
      setTimeout(() => setIsSubmitted(false), 5000)
    } catch (err) {
      console.error('Failed to send message:', err)
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-primary/5 via-background to-secondary/5 py-12">
      <div className="container mx-auto max-w-6xl px-4">
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold text-gradient">
            Свяжитесь с нами
          </h1>
          <p className="text-lg text-muted-foreground">
            Мы всегда рады помочь и ответить на ваши вопросы
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-1">
            <div className="rounded-2xl glass-card p-6 backdrop-blur-xl">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/30">
                <Mail className="h-6 w-6 text-white" />
              </div>
              <h3 className="mb-2 text-lg font-bold text-foreground">Email</h3>
              <a
                href="mailto:gormachdv@gmail.com"
                className="text-sm text-primary hover:underline"
              >
                gormachdv@gmail.com
              </a>
              <p className="mt-2 text-xs text-muted-foreground">
                Отвечаем в течение 24 часов
              </p>
            </div>

            <div className="rounded-2xl glass-card p-6 backdrop-blur-xl">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-cyan-600 shadow-lg shadow-blue-500/30">
                <Phone className="h-6 w-6 text-white" />
              </div>
              <h3 className="mb-2 text-lg font-bold text-foreground">
                Telegram
              </h3>
              <a
                href="https://t.me/iBa1aNCe"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline"
              >
                @iBa1aNCe
              </a>
              <p className="mt-2 text-xs text-muted-foreground">
                Быстрая связь в мессенджере
              </p>
            </div>

            <div className="rounded-2xl glass-card p-6 backdrop-blur-xl">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-green-600 to-emerald-600 shadow-lg shadow-green-500/30">
                <MapPin className="h-6 w-6 text-white" />
              </div>
              <h3 className="mb-2 text-lg font-bold text-foreground">Офис</h3>
              <p className="text-sm text-muted-foreground">
                Беларусь, Минск
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                пр. Независимости, 102
              </p>
            </div>

            <div className="rounded-2xl glass-card p-6 backdrop-blur-xl">
              <h3 className="mb-3 text-lg font-bold text-foreground">
                Социальные сети
              </h3>
              <div className="flex space-x-4">
                <a
                  href="https://github.com/1BalaN"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary transition-all hover:bg-primary hover:text-white"
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                  </svg>
                </a>
                <a
                  href="https://t.me/iBa1aNCe"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary transition-all hover:bg-primary hover:text-white"
                >
                  <Send className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="rounded-2xl glass-card p-8 backdrop-blur-xl">
              <h2 className="mb-6 text-2xl font-bold text-foreground">
                Отправить сообщение
              </h2>

              {isSubmitted && (
                <div className="mb-6 flex items-center gap-3 rounded-xl bg-green-500/10 border border-green-500/20 p-4 text-green-600 dark:text-green-400">
                  <CheckCircle className="h-5 w-5" />
                  <p className="text-sm">
                    Спасибо! Ваше сообщение отправлено. Мы свяжемся с вами в ближайшее время.
                  </p>
                </div>
              )}

              {error && (
                <div className="mb-6 flex items-center gap-3 rounded-xl bg-red-500/10 border border-red-500/20 p-4 text-red-600 dark:text-red-400">
                  <AlertCircle className="h-5 w-5" />
                  <p className="text-sm">
                    {'data' in error
                      ? (error.data as { error: { message: string } }).error.message
                      : 'Произошла ошибка при отправке сообщения. Попробуйте позже.'}
                  </p>
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <Input
                    {...register('name')}
                    label="Ваше имя"
                    placeholder="Иван Иванов"
                    error={errors.name?.message}
                  />
                  <Input
                    {...register('email')}
                    type="email"
                    label="Email"
                    placeholder="your@email.com"
                    error={errors.email?.message}
                  />
                </div>

                <Input
                  {...register('subject')}
                  label="Тема сообщения"
                  placeholder="Вопрос по подписке"
                  error={errors.subject?.message}
                />

                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">
                    Сообщение
                  </label>
                  <textarea
                    {...register('message')}
                    rows={6}
                    className="w-full rounded-xl border-2 border-input bg-background/50 px-4 py-3 text-foreground transition-all duration-300 placeholder:text-muted-foreground hover:border-primary/50 focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Расскажите подробнее о вашем вопросе..."
                  />
                  {errors.message && (
                    <p className="mt-1 text-sm text-destructive">
                      {errors.message.message}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  className="w-full"
                  disabled={isLoading}
                >
                  <Send className="mr-2 h-4 w-4" />
                  {isLoading ? 'Отправка...' : 'Отправить сообщение'}
                </Button>
              </form>

              <div className="mt-8 rounded-xl glass p-4">
                <p className="text-sm text-muted-foreground">
                  <strong className="text-foreground">Время работы поддержки:</strong> Пн-Пт, 9:00-18:00 (UTC+3)
                  <br />
                  В нерабочее время ответ может занять до 48 часов.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
