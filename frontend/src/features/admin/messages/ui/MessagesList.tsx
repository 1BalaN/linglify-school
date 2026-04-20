import { useTranslation } from 'react-i18next'
import type { ContactMessage } from '@/shared/types/contact'
import { EmptyState, MessageListItem } from '..'

type MessagesListProps = {
  messages: ContactMessage[]
  selectedId?: string
  isLoading: boolean
  onSelect: (m: ContactMessage) => void
}

export const MessagesList = ({
  messages,
  selectedId,
  isLoading,
  onSelect,
}: MessagesListProps) => {
  const { t } = useTranslation('platform', { keyPrefix: 'admin.messagesUi' })

  if (isLoading) {
    return (
      <div className="py-8 text-center">
        <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-sm text-muted-foreground">{t('loadingList')}</p>
      </div>
    )
  }

  if (!messages.length) {
    return <EmptyState text={t('emptyList')} />
  }

  return (
    <div className="space-y-2 max-h-[600px] overflow-y-auto">
      {messages.map(m => (
        <MessageListItem
          key={m.id}
          message={m}
          selected={selectedId === m.id}
          onClick={() => onSelect(m)}
        />
      ))}
    </div>
  )
}
