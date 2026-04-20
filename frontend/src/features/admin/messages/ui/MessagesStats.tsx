import { Mail, Clock, MessageSquare } from 'lucide-react'
import { useTranslation } from 'react-i18next'

type MessagesStatsProps = {
  total: number
  unread: number
  unreplied: number
}

export const MessagesStats = ({ total, unread, unreplied }: MessagesStatsProps) => {
  const { t } = useTranslation('platform', { keyPrefix: 'admin.messagesUi' })
  return (
    <div className="grid gap-4 md:grid-cols-3 mb-6">
      <Stat
        icon={<MessageSquare className="h-5 w-5 text-blue-600 dark:text-blue-400" />}
        label={t('statsTotal')}
        value={total}
        bg="bg-blue-500/10"
      />
      <Stat
        icon={<Mail className="h-5 w-5 text-orange-600 dark:text-orange-400" />}
        label={t('statsUnread')}
        value={unread}
        bg="bg-orange-500/10"
      />
      <Stat
        icon={<Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />}
        label={t('statsUnreplied')}
        value={unreplied}
        bg="bg-amber-500/10"
      />
    </div>
  )
}

const Stat = ({
  icon,
  label,
  value,
  bg,
}: {
  icon: React.ReactNode
  label: string
  value: number
  bg: string
}) => (
  <div className="rounded-xl glass-card p-4 backdrop-blur-xl">
    <div className="flex items-center gap-3">
      <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${bg}`}>
        {icon}
      </div>
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-2xl font-bold text-foreground">{value}</p>
      </div>
    </div>
  </div>
)
