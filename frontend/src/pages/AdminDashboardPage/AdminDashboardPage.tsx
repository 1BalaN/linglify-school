import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import type { RootState } from '@/app/store'
import { LayoutDashboard } from 'lucide-react'
import {
  AdminQuickLinks,
  AdminRecentMessages,
  AdminStatsGrid,
  useAdminDashboardData,
} from '@/features/admin/dashboard'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

export const AdminDashboardPage = () => {
  const { t } = useTranslation('platform', { keyPrefix: 'admin.dashboard' })
  const navigate = useNavigate()
  const user = useSelector((state: RootState) => state.auth.user)
  const { messages, stats } = useAdminDashboardData()

  useEffect(() => {
    if (user && user.role !== 'ADMIN') {
      navigate('/', { replace: true })
    }
  }, [user, navigate])

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-primary/5 via-background to-secondary/5 py-8">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/30">
              <LayoutDashboard className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gradient">{t('title')}</h1>
              <p className="text-muted-foreground">
                {t('welcome', { name: user?.firstName || t('welcomeFallback') })}
              </p>
            </div>
          </div>
        </div>
        {/* Stats Grid */}
        <AdminStatsGrid stats={stats} />

        {/* Quick Links */}
        <AdminQuickLinks />

        {/* Recent Activity */}
        <AdminRecentMessages messages={messages} />
      </div>
    </div>
  )
}
