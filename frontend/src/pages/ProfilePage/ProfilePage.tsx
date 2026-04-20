import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { Navigate, useSearchParams } from 'react-router-dom'
import { RootState } from '@/app/store'
import { User, Settings, Shield, Phone, Award, Crown } from 'lucide-react'
import { ProfileInfo } from './components/ProfileInfo'
import { ProfileEdit } from './components/ProfileEdit'
import { PasswordChange } from './components/PasswordChange'
import { PhoneVerification } from './components/PhoneVerification'
import { ProfileCertificates } from './components/ProfileCertificates'
import { TeacherSubscriptionTab } from './components/TeacherSubscriptionTab'
import { useGetCurrentUserQuery } from '@/entities/user'
import { useTranslation } from 'react-i18next'

type Tab = 'info' | 'edit' | 'password' | 'phone' | 'certificates' | 'subscription'

export const ProfilePage = () => {
  const { t } = useTranslation('profile')
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth)
  const { data: currentUserData } = useGetCurrentUserQuery(undefined, {
    skip: !isAuthenticated,
  })
  const effectiveUser = currentUserData?.data ?? user
  const [searchParams] = useSearchParams()
  const [activeTab, setActiveTab] = useState<Tab>(
    () => (searchParams.get('tab') as Tab | null) ?? 'info'
  )

  useEffect(() => {
    const tabParam = searchParams.get('tab') as Tab | null
    if (tabParam) setActiveTab(tabParam)
  }, [searchParams])

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  const tabs = [
    { id: 'info' as Tab, label: t('page.tabs.info'), icon: User },
    { id: 'edit' as Tab, label: t('page.tabs.edit'), icon: Settings },
    { id: 'password' as Tab, label: t('page.tabs.password'), icon: Shield },
    { id: 'phone' as Tab, label: t('page.tabs.phone'), icon: Phone },
    ...(effectiveUser?.role === 'STUDENT'
      ? [{ id: 'certificates' as Tab, label: t('page.tabs.certificates'), icon: Award }]
      : []),
    ...(effectiveUser?.role === 'TEACHER'
      ? [{ id: 'subscription' as Tab, label: t('page.tabs.subscription'), icon: Crown }]
      : []),
  ]

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-cyan-50/50 via-background to-blue-50/50 dark:from-cyan-950/20 dark:via-background dark:to-blue-950/20 py-12">
      <div className="container mx-auto max-w-5xl px-4">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gradient mb-3">
            {t('page.title')}
          </h1>
          <p className="text-lg text-muted-foreground">
            {t('page.subtitle')}
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex flex-wrap gap-4 rounded-2xl glass-card p-2 backdrop-blur-xl">
          {tabs.map(tab => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30 scale-105'
                    : 'text-muted-foreground hover:bg-primary/5 hover:text-primary hover:scale-105'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            )
          })}
        </div>

        {/* Content */}
        <div className="rounded-2xl glass-card p-8 backdrop-blur-xl transition-all duration-300 hover:shadow-2xl hover:shadow-primary/10">
          {activeTab === 'info' && effectiveUser && <ProfileInfo user={effectiveUser} />}
          {activeTab === 'edit' && effectiveUser && <ProfileEdit user={effectiveUser} />}
          {activeTab === 'password' && <PasswordChange />}
          {activeTab === 'phone' && effectiveUser && <PhoneVerification user={effectiveUser} />}
          {activeTab === 'certificates' && <ProfileCertificates />}
          {activeTab === 'subscription' && <TeacherSubscriptionTab />}
        </div>
      </div>
    </div>
  )
}
