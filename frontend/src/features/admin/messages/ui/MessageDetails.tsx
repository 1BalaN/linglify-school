import {
  MailOpen,
  CheckCircle,
  Trash2,
  X,
  Save,
} from 'lucide-react'
import { Button } from '@/shared/ui'
import type { ContactMessage } from '@/shared/types/contact'

type MessageDetailsProps = {
  message: ContactMessage
  noteText: string
  onNoteChange: (v: string) => void
  onSaveNote: () => void
  onMarkReplied: () => void
  onDelete: () => void
  onClose: () => void
}

export const MessageDetails = ({
  message,
  noteText,
  onNoteChange,
  onSaveNote,
  onMarkReplied,
  onDelete,
  onClose,
}: MessageDetailsProps) => (
  <div className="rounded-2xl glass-card p-6 backdrop-blur-xl">
    {/* Header */}
    <div className="flex justify-between mb-6 pb-4 border-b border-border">
      <div>
        <h2 className="text-xl font-bold mb-2">{message.subject}</h2>
        <div className="text-sm text-muted-foreground flex gap-2">
          <span>{message.name}</span>
          <span>•</span>
          <a href={`mailto:${message.email}`} className="text-primary">
            {message.email}
          </a>
        </div>
      </div>
      {message.isReplied ? (
        <Badge icon={<CheckCircle />} text="Отвечено" />
      ) : message.isRead ? (
        <Badge icon={<MailOpen />} text="Прочитано" />
      ) : null}
    </div>

    {/* Message */}
    <div className="mb-6">
      <div className="rounded-lg bg-background/50 p-4 border border-border">
        <p className="whitespace-pre-wrap text-sm">{message.message}</p>
      </div>
    </div>

    {/* Note */}
    <textarea
      value={noteText}
      onChange={e => onNoteChange(e.target.value)}
      rows={4}
      className="w-full rounded-xl border-2 border-input bg-background/50 px-4 py-3 mb-6"
      placeholder="Заметка администратора..."
    />

    {/* Actions */}
    <div className="flex gap-2">
      <Button variant="outline" onClick={onSaveNote}>
        <Save className="mr-2 h-4 w-4" />
        Сохранить
      </Button>
      {!message.isReplied && (
        <Button onClick={onMarkReplied}>
          <CheckCircle className="mr-2 h-4 w-4" />
          Отметить отвеченным
        </Button>
      )}
      <Button
        variant="outline"
        className="ml-auto text-destructive"
        onClick={onDelete}
      >
        <Trash2 className="mr-2 h-4 w-4" />
        Удалить
      </Button>
      <Button variant="outline" onClick={onClose}>
        <X className="h-4 w-4" />
      </Button>
    </div>
  </div>
)

const Badge = ({ icon, text }: { icon: React.ReactNode; text: string }) => (
  <span className="flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold">
    {icon}
    {text}
  </span>
)