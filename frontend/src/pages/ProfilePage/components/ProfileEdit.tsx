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

const profileSchema = z.object({
  firstName: z.string().min(2, 'Имя должно содержать минимум 2 символа'),
  lastName: z.string().optional(),
  bio: z.string().max(500, 'Максимум 500 символов').optional(),
  dateOfBirth: z.string().optional(),
  preferredLanguage: z.string().optional(),
})

type ProfileFormData = z.infer<typeof profileSchema>

interface ProfileEditProps {
  user: User
}

export const ProfileEdit = ({ user }: ProfileEditProps) => {
  const dispatch = useDispatch()
  const [updateProfile, { isLoading, error }] = useUpdateProfileMutation()
  const [success, setSuccess] = useState(false)
  const [avatarBase64, setAvatarBase64] = useState<string>(user.avatar || '')

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
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
          Редактировать профиль
        </h3>
        <p className="text-muted-foreground mt-1">
          Обновите свою личную информацию
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
            label="Имя"
            placeholder="Иван"
            error={errors.firstName?.message}
          />

          <Input
            {...register('lastName')}
            label="Фамилия"
            placeholder="Иванов"
            error={errors.lastName?.message}
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-foreground">
            Дата рождения
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
          label="Предпочитаемые языки"
          placeholder="Например: Английский, Немецкий"
          error={errors.preferredLanguage?.message}
        />

        <div>
          <label
            htmlFor="bio"
            className="mb-1.5 block text-sm font-medium text-foreground"
          >
            О себе
          </label>
          <textarea
            {...register('bio')}
            id="bio"
            rows={4}
            placeholder="Расскажите о себе..."
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
              : 'Произошла ошибка при обновлении профиля'}
          </div>
        )}

        {success && (
          <div className="flex items-center gap-2 rounded-lg border border-green-500/20 bg-green-500/10 p-3 text-sm text-green-600 dark:text-green-400">
            <CheckCircle className="h-4 w-4" />
            Профиль успешно обновлен!
          </div>
        )}

        <Button type="submit" className="w-full" isLoading={isLoading}>
          Сохранить изменения
        </Button>
      </form>
    </div>
  )
}
