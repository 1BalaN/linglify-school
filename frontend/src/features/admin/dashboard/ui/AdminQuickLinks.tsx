import { adminDashboardQuickLinks } from '@/shared/constants/adminDashboardConstants'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

export const AdminQuickLinks = () => {
  const { t } = useTranslation('platform', { keyPrefix: 'admin.dashboard' })
  return (
    <div>
      <h2 className="text-xl font-bold text-foreground mb-4">{t('quickAccess')}</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {adminDashboardQuickLinks.map(link => (
          <Link
            key={link.id}
            to={link.link}
            className={`group rounded-2xl glass-card p-6 backdrop-blur-xl transition-all duration-300 hover:shadow-xl hover:shadow-primary/10`}
          >
            <div className="flex items-start justify-between mb-3">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br ${link.color}`}
              >
                <link.icon className="h-5 w-5 text-white" />
              </div>
            </div>
            <h3 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
              {t(`quickLinks.${link.id}.title`)}
            </h3>
            <p className="text-sm text-muted-foreground">
              {t(`quickLinks.${link.id}.description`)}
            </p>
          </Link>
        ))}
      </div>
    </div>
  )
}
