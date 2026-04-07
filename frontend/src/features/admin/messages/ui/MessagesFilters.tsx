import { useTranslation } from 'react-i18next'

type MessagesFiltersProps = {
  value: 'all' | 'unread' | 'unreplied'
  onChange: (v: MessagesFiltersProps['value']) => void
}

export const MessagesFilters = ({ value, onChange }: MessagesFiltersProps) => {
  const { t } = useTranslation('platform', { keyPrefix: 'admin.messagesUi' })
  const btn = (v: MessagesFiltersProps['value'], label: string) => (
    <button
      type="button"
      onClick={() => onChange(v)}
      className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
        value === v
          ? 'bg-primary text-white'
          : 'bg-background/50 text-muted-foreground hover:bg-primary/10'
      }`}
    >
      {label}
    </button>
  )

  return (
    <div className="flex gap-2 mb-4">
      {btn('all', t('filterAll'))}
      {btn('unread', t('filterUnread'))}
      {btn('unreplied', t('filterUnreplied'))}
    </div>
  )
}
