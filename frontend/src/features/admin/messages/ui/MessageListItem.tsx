import { Mail, CheckCircle } from 'lucide-react'
import type { ContactMessage } from '@/shared/types/contact'
import { memo } from 'react'

type MessageListItemProps = {
  message: ContactMessage
  selected: boolean
  onClick: () => void
}

export const MessageListItem = memo(({ message, selected, onClick }: MessageListItemProps) => (
  <button
    onClick={onClick}
    className={`w-full rounded-lg border p-3 text-left transition-all ${
      selected
        ? 'border-primary bg-primary/5'
        : 'border-border bg-background/50 hover:border-primary/50'
    }`}
  >
    <div className="flex items-start justify-between gap-2 mb-1">
      <p className="font-semibold text-foreground text-sm truncate">
        {message.name}
      </p>
      <div className="flex gap-1">
        {!message.isRead && <Mail className="h-4 w-4 text-orange-500" />}
        {message.isReplied && <CheckCircle className="h-4 w-4 text-green-500" />}
      </div>
    </div>
    <p className="text-xs text-muted-foreground truncate mb-1">
      {message.subject}
    </p>
    <p className="text-xs text-muted-foreground">
      {new Date(message.createdAt).toLocaleString('ru-RU')}
    </p>
  </button>
))