import { Link } from 'react-router-dom'
import { Mail, CheckCircle } from 'lucide-react'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ContactMessage } from '@/shared/types/contact'

type AdminRecentMessagesProps = {
  messages: ContactMessage[]
}

export const AdminRecentMessages = ({ messages }: AdminRecentMessagesProps) => {
  const { t, i18n } = useTranslation('platform', { keyPrefix: 'admin.dashboard.recentMessages' })
  const locale = i18n.language?.startsWith('ru') ? 'ru-RU' : 'en-US'

  const recentMessages = useMemo(() => messages.slice(0, 5), [messages])

  return (
    <div className="mt-8 rounded-2xl glass-card p-6 backdrop-blur-xl">
      <h2 className="text-xl font-bold text-foreground mb-4">{t('title')}</h2>
      {messages.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">{t('empty')}</p>
      ) : (
        <div className="space-y-3">
          {recentMessages.map(message => (
            <Link
              key={message.id}
              to="/admin/messages"
              className="flex items-center gap-4 rounded-xl border border-border bg-background/50 p-4 transition-all hover:bg-primary/5 hover:border-primary/50"
            >
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                  message.isReplied
                    ? 'bg-green-500/10 text-green-600 dark:text-green-400'
                    : message.isRead
                      ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                      : 'bg-orange-500/10 text-orange-600 dark:text-orange-400'
                }`}
              >
                {message.isReplied ? (
                  <CheckCircle className="h-5 w-5" />
                ) : (
                  <Mail className="h-5 w-5" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-semibold text-foreground truncate">{message.name}</p>
                  {!message.isRead ? (
                    <span className="rounded-full bg-red-500/10 px-2 py-0.5 text-xs font-semibold text-red-600 dark:text-red-400">
                      {t('badgeNew')}
                    </span>
                  ) : null}
                </div>
                <p className="text-sm text-muted-foreground truncate">{message.subject}</p>
              </div>
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                {new Date(message.createdAt).toLocaleDateString(locale)}
              </span>
            </Link>
          ))}
        </div>
      )}
      {messages.length > 5 ? (
        <div className="mt-4 text-center">
          <Link to="/admin/messages" className="text-sm font-medium text-primary hover:underline">
            {t('viewAll')}
          </Link>
        </div>
      ) : null}
    </div>
  )
}
