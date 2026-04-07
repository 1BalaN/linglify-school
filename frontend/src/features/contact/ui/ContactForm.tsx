import { useSendContactMessageMutation } from '@/entities/contact'
import { Button, Input } from '@/shared/ui'
import { zodResolver } from '@hookform/resolvers/zod'
import { AlertCircle, CheckCircle, Send } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { useTranslation } from 'react-i18next'

const createContactSchema = (t: (key: string) => string) =>
  z.object({
    name: z.string().min(2, t('contact.validation.nameMin')),
    email: z.string().email(t('contact.validation.invalidEmail')),
    subject: z.string().min(5, t('contact.validation.subjectMin')),
    message: z.string().min(10, t('contact.validation.messageMin')),
  })

type ContactFormData = z.infer<ReturnType<typeof createContactSchema>>

// ContactForm.tsx
export const ContactForm = () => {
  const { t } = useTranslation('support')
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [sendMessage, { isLoading, error }] = useSendContactMessageMutation()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ContactFormData>({
    resolver: zodResolver(createContactSchema(t)),
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
    <div className="rounded-2xl glass-card p-8 backdrop-blur-xl">
      <h2 className="mb-6 text-2xl font-bold text-foreground">
        {t('contact.formTitle')}
      </h2>

      {isSubmitted && (
        <div className="mb-6 flex items-center gap-3 rounded-xl bg-green-500/10 border border-green-500/20 p-4 text-green-600 dark:text-green-400">
          <CheckCircle className="h-5 w-5" />
          <p className="text-sm">
            {t('contact.success')}
          </p>
        </div>
      )}

      {error && (
        <div className="mb-6 flex items-center gap-3 rounded-xl bg-red-500/10 border border-red-500/20 p-4 text-red-600 dark:text-red-400">
          <AlertCircle className="h-5 w-5" />
          <p className="text-sm">
            { 'data' in error
              ? (error.data as { error: { message: string } }).error.message
              : t('contact.error')
            }
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <Input
            {...register('name')}
            label={t('contact.fields.name')}
            placeholder={t('contact.placeholders.name')}
            error={errors.name?.message}
          />
          <Input
            {...register('email')}
            type="email"
            label={t('contact.fields.email')}
            placeholder={t('contact.placeholders.email')}
            error={errors.email?.message}
          />
        </div>
        <Input
          {...register('subject')}
          label={t('contact.fields.subject')}
          placeholder={t('contact.placeholders.subject')}
          error={errors.subject?.message}
        />
        <div>
          <label className="mb-2 block text-sm font-medium text-foreground">
            {t('contact.fields.message')}
          </label>
          <textarea
            {...register('message')}
            rows={6}
            className="w-full rounded-xl border-2 border-input bg-background/50 px-4 py-3 text-foreground transition-all duration-300 placeholder:text-muted-foreground hover:border-primary/50 focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            placeholder={t('contact.placeholders.message')}
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
          {isLoading ? t('contact.actions.sending') : t('contact.actions.send')}
        </Button>
      </form>

      <div className="mt-8 rounded-xl glass p-4">
        <p className="text-sm text-muted-foreground">
          <strong className="text-foreground">{t('contact.schedule.title')}</strong> {t('contact.schedule.hours')}
          <br />
          {t('contact.schedule.note')}
        </p>
      </div>
    </div>
  )
}