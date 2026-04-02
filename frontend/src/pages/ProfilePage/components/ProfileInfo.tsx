import { User as UserIcon, Mail, Calendar, Globe, Languages } from 'lucide-react'
import type { User } from '@/shared/types/user'
import { useGetMySubscriptionQuery, SubscriptionStatusBadge } from '@/entities/subscription'
import { formatDateRU } from '@/shared/lib'
import { useTranslation } from 'react-i18next'

interface ProfileInfoProps {
  user: User
}

function TeacherSubscriptionBadge() {
  const { data } = useGetMySubscriptionQuery(undefined, { refetchOnMountOrArgChange: true })
  const sub = data?.data
  if (!sub) return null
  return <SubscriptionStatusBadge subscription={sub} showDays />
}

export const ProfileInfo = ({ user }: ProfileInfoProps) => {
  const { t } = useTranslation('profile')
  const isTeacher = user.role === 'TEACHER'

  return (
    <div className="space-y-6">
      {/* Avatar and Name */}
      <div className="flex flex-col items-center space-y-4 sm:flex-row sm:space-x-6 sm:space-y-0">
        {user.avatar ? (
          <img
            src={user.avatar}
            alt={user.firstName || 'User'}
            className="h-28 w-28 rounded-full object-cover ring-4 ring-primary/30 shadow-xl shadow-primary/20 transition-transform hover:scale-105"
          />
        ) : (
          <div className="flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 ring-4 ring-primary/30 shadow-xl shadow-cyan-500/30 transition-transform hover:scale-105">
            <UserIcon className="h-14 w-14 text-white" />
          </div>
        )}
        <div className="text-center sm:text-left">
          <h2 className="text-3xl font-bold text-gradient mb-1">
            {user.firstName} {user.lastName}
          </h2>
          <p className="text-muted-foreground mb-2">{user.email}</p>
          <div className="flex flex-wrap items-center gap-2">
            {user.isEmailVerified && (
              <span className="inline-block rounded-full bg-green-500/10 px-4 py-1.5 text-xs font-semibold text-green-600 dark:text-green-400 ring-1 ring-green-500/20">
                {t('info.emailVerified')}
              </span>
            )}
            {isTeacher && <TeacherSubscriptionBadge />}
          </div>
        </div>
      </div>

      <div className="h-px bg-border" />

      {/* User Details */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex items-start space-x-3 rounded-xl glass p-5 transition-all hover:scale-105 hover:shadow-md">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <Mail className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Email</p>
            <p className="font-medium text-foreground">{user.email}</p>
          </div>
        </div>

        {user.phone && (
          <div className="flex items-start space-x-3 rounded-xl glass p-5 transition-all hover:scale-105 hover:shadow-md">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <UserIcon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">{t('info.phone')}</p>
              <p className="font-medium text-foreground">{user.phone}</p>
              {user.isPhoneVerified && (
                <span className="text-xs text-green-600 dark:text-green-400">
                  {t('info.phoneVerified')}
                </span>
              )}
            </div>
          </div>
        )}

        {user.dateOfBirth && (
          <div className="flex items-start space-x-3 rounded-xl glass p-5 transition-all hover:scale-105 hover:shadow-md">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <Calendar className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {t('info.dateOfBirth')}
              </p>
              <p className="font-medium text-foreground">
                {formatDateRU(user.dateOfBirth)}
              </p>
            </div>
          </div>
        )}

        {user.preferredLanguage && (
          <div className="flex items-start space-x-3 rounded-xl glass p-5 transition-all hover:scale-105 hover:shadow-md">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <Globe className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {t('info.preferredLanguage')}
              </p>
              <p className="font-medium text-foreground">{user.preferredLanguage}</p>
            </div>
          </div>
        )}

        {user.targetLanguages.length > 0 && (
          <div className="flex items-start space-x-3 rounded-xl glass p-5 sm:col-span-2 transition-all hover:shadow-md">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <Languages className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-muted-foreground mb-2">
                {t('info.targetLanguages')}
              </p>
              <div className="flex flex-wrap gap-2">
                {user.targetLanguages.map(lang => (
                  <span
                    key={lang}
                    className="rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-1.5 text-sm font-medium text-white shadow-md shadow-cyan-500/30"
                  >
                    {lang}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {user.bio && (
          <div className="flex items-start space-x-3 rounded-xl glass p-5 sm:col-span-2 transition-all hover:shadow-md">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <UserIcon className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-muted-foreground mb-1">
                {t('info.bio')}
              </p>
              <p className="text-foreground leading-relaxed">{user.bio}</p>
            </div>
          </div>
        )}
      </div>

      {/* Account Info */}
      <div className="rounded-xl glass p-5">
        <h3 className="mb-4 text-sm font-semibold text-gradient">
          {t('info.accountInfo')}
        </h3>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">{t('info.registeredAt')}</span>
            <span className="font-medium text-foreground">
              {formatDateRU(user.createdAt, true)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">{t('info.role')}</span>
            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              {user.role}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
