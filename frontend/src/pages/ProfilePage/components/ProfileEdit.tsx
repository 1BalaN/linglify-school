import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useUpdateProfileMutation } from '@/entities/user'
import { useDispatch } from 'react-redux'
import { setUser } from '@/entities/user'
import { Button, Input, AvatarUpload } from '@/shared/ui'
import type { User } from '@/shared/types/user'
import { useState } from 'react'
import { CheckCircle } from 'lucide-react'
import { useTranslation } from 'react-i18next'

const createProfileSchema = (t: (key: string) => string) =>
  z.object({
    firstName: z.string().min(2, t('edit.validation.firstNameMin')),
    lastName: z.string().optional(),
    bio: z.string().max(500, t('edit.validation.bioMax')).optional(),
    dateOfBirth: z.string().optional(),
    preferredLanguage: z.string().optional(),
  })

type ProfileFormData = z.infer<ReturnType<typeof createProfileSchema>>

interface ProfileEditProps {
  user: User
}

export const ProfileEdit = ({ user }: ProfileEditProps) => {
  const { t, i18n } = useTranslation('profile')
  const isEn = i18n.language.startsWith('en')
  const dispatch = useDispatch()
  const [updateProfile, { isLoading, error }] = useUpdateProfileMutation()
  const [success, setSuccess] = useState(false)
  const [avatarBase64, setAvatarBase64] = useState<string>(user.avatar || '')

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(createProfileSchema(t)),
    defaultValues: {
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      bio: user.bio || '',
      dateOfBirth: user.dateOfBirth
        ? new Date(user.dateOfBirth).toISOString().split('T')[0]
        : '',
      preferredLanguage: user.preferredLanguage || '',
    },
  })

  const onSubmit = async (data: ProfileFormData) => {
    try {
      setSuccess(false)
      const payload = {
        ...data,
        avatar: avatarBase64 || undefined,
        dateOfBirth: data.dateOfBirth
          ? new Date(data.dateOfBirth).toISOString()
          : undefined,
      }
      const result = await updateProfile(payload).unwrap()
      dispatch(setUser(result.data))
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      console.error('Profile update error:', err)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold text-gradient">
          {t('edit.title')}
        </h3>
        <p className="text-muted-foreground mt-1">
          {t('edit.subtitle')}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <AvatarUpload
          currentAvatar={user.avatar}
          onImageSelect={setAvatarBase64}
        />

        <div className="h-px bg-border" />

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            {...register('firstName')}
            label={t('edit.firstName')}
            placeholder={isEn ? 'John' : 'Иван'}
            error={errors.firstName?.message}
          />

          <Input
            {...register('lastName')}
            label={t('edit.lastName')}
            placeholder={isEn ? 'Smith' : 'Иванов'}
            error={errors.lastName?.message}
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-foreground">
            {t('edit.dateOfBirth')}
          </label>
          <input
            {...register('dateOfBirth')}
            type="date"
            className="w-full rounded-xl border-2 border-input bg-background/50 px-4 py-3 text-foreground transition-all duration-300 placeholder:text-muted-foreground hover:border-primary/50 focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          />
          {errors.dateOfBirth && (
            <p className="mt-1 text-sm text-destructive">
              {errors.dateOfBirth.message}
            </p>
          )}
        </div>

        <Input
          {...register('preferredLanguage')}
          label={t('edit.preferredLanguage')}
          placeholder={t('edit.preferredLanguagePlaceholder')}
          error={errors.preferredLanguage?.message}
        />

        <div>
          <label
            htmlFor="bio"
            className="mb-1.5 block text-sm font-medium text-foreground"
          >
            {t('edit.bio')}
          </label>
          <textarea
            {...register('bio')}
            id="bio"
            rows={4}
            placeholder={t('edit.bioPlaceholder')}
            className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
          {errors.bio && (
            <p className="mt-1.5 text-sm text-destructive">
              {errors.bio.message}
            </p>
          )}
        </div>

        {error && (
          <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
            {'data' in error
              ? (error.data as { error: { message: string } }).error.message
              : t('edit.error')}
          </div>
        )}

        {success && (
          <div className="flex items-center gap-2 rounded-lg border border-green-500/20 bg-green-500/10 p-3 text-sm text-green-600 dark:text-green-400">
            <CheckCircle className="h-4 w-4" />
            {t('edit.success')}
          </div>
        )}

        <Button type="submit" className="w-full" isLoading={isLoading}>
          {t('edit.save')}
        </Button>
      </form>
    </div>
  )
}
