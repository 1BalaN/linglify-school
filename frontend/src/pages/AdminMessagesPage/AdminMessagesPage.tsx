import { useState } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import type { RootState } from '@/app/store'
import {
  useGetAllContactMessagesQuery,
  useMarkMessageAsReadMutation,
  useMarkMessageAsRepliedMutation,
  useUpdateAdminNoteMutation,
  useDeleteContactMessageMutation,
} from '@/entities/contact'
import { Button } from '@/shared/ui'
import {
  Mail,
  MailOpen,
  CheckCircle,
  Clock,
  Trash2,
  MessageSquare,
  X,
  Save,
  ArrowLeft,
} from 'lucide-react'
import type { ContactMessage } from '@/shared/types/contact'

export const AdminMessagesPage = () => {
  const navigate = useNavigate()
  const user = useSelector((state: RootState) => state.auth.user)
  const { data, isLoading } = useGetAllContactMessagesQuery({ includeRead: true })
  const [markAsRead] = useMarkMessageAsReadMutation()
  const [markAsReplied] = useMarkMessageAsRepliedMutation()
  const [updateNote] = useUpdateAdminNoteMutation()
  const [deleteMessage] = useDeleteContactMessageMutation()

  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null)
  const [filter, setFilter] = useState<'all' | 'unread' | 'unreplied'>('all')
  const [noteText, setNoteText] = useState('')

  if (user?.role !== 'ADMIN') {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <div className="text-center rounded-2xl glass-card p-8 backdrop-blur-xl">
          <h1 className="text-2xl font-bold text-foreground mb-4">
            Доступ запрещён
          </h1>
          <p className="text-muted-foreground mb-6">
            Только администраторы могут просматривать сообщения
          </p>
          <Button onClick={() => navigate('/')}>На главную</Button>
        </div>
      </div>
    )
  }

  const messages = data?.data?.messages || []
  const filteredMessages = messages.filter(msg => {
    if (filter === 'unread') return !msg.isRead
    if (filter === 'unreplied') return !msg.isReplied
    return true
  })

  const handleSelectMessage = async (message: ContactMessage) => {
    setSelectedMessage(message)
    setNoteText(message.adminNote || '')
    
    if (!message.isRead) {
      try {
        await markAsRead(message.id).unwrap()
      } catch (error) {
        console.error('Failed to mark as read:', error)
      }
    }
  }

  const handleMarkReplied = async () => {
    if (!selectedMessage) return

    try {
      await markAsReplied({
        id: selectedMessage.id,
        adminNote: noteText,
      }).unwrap()
      setSelectedMessage(null)
    } catch (error) {
      console.error('Failed to mark as replied:', error)
      alert('Ошибка при пометке ответа')
    }
  }

  const handleSaveNote = async () => {
    if (!selectedMessage) return

    try {
      await updateNote({
        id: selectedMessage.id,
        adminNote: noteText,
      }).unwrap()
      alert('Заметка сохранена')
    } catch (error) {
      console.error('Failed to save note:', error)
      alert('Ошибка при сохранении заметки')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Вы уверены, что хотите удалить это сообщение?')) {
      return
    }

    try {
      await deleteMessage(id).unwrap()
      if (selectedMessage?.id === id) {
        setSelectedMessage(null)
      }
    } catch (error) {
      console.error('Failed to delete message:', error)
      alert('Ошибка при удалении сообщения')
    }
  }

  const stats = {
    total: messages.length,
    unread: messages.filter(m => !m.isRead).length,
    unreplied: messages.filter(m => !m.isReplied).length,
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-primary/5 via-background to-secondary/5 py-8">
      <div className="container mx-auto max-w-7xl px-4">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/admin/dashboard')}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Назад
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gradient">
                Сообщения пользователей
              </h1>
              <p className="text-sm text-muted-foreground">
                Управление обращениями через форму контактов
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3 mb-6">
          <div className="rounded-xl glass-card p-4 backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
                <MessageSquare className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Всего</p>
                <p className="text-2xl font-bold text-foreground">{stats.total}</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl glass-card p-4 backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/10">
                <Mail className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Непрочитано</p>
                <p className="text-2xl font-bold text-foreground">{stats.unread}</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl glass-card p-4 backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10">
                <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Без ответа</p>
                <p className="text-2xl font-bold text-foreground">{stats.unreplied}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Messages List */}
          <div className="lg:col-span-1">
            <div className="rounded-2xl glass-card p-4 backdrop-blur-xl">
              {/* Filters */}
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => setFilter('all')}
                  className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    filter === 'all'
                      ? 'bg-primary text-white'
                      : 'bg-background/50 text-muted-foreground hover:bg-primary/10'
                  }`}
                >
                  Все
                </button>
                <button
                  onClick={() => setFilter('unread')}
                  className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    filter === 'unread'
                      ? 'bg-primary text-white'
                      : 'bg-background/50 text-muted-foreground hover:bg-primary/10'
                  }`}
                >
                  Новые
                </button>
                <button
                  onClick={() => setFilter('unreplied')}
                  className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    filter === 'unreplied'
                      ? 'bg-primary text-white'
                      : 'bg-background/50 text-muted-foreground hover:bg-primary/10'
                  }`}
                >
                  Без ответа
                </button>
              </div>

              {/* List */}
              {isLoading ? (
                <div className="py-8 text-center">
                  <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                  <p className="text-sm text-muted-foreground">Загрузка...</p>
                </div>
              ) : filteredMessages.length === 0 ? (
                <div className="py-8 text-center">
                  <p className="text-sm text-muted-foreground">Сообщений нет</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[600px] overflow-y-auto">
                  {filteredMessages.map(message => (
                    <button
                      key={message.id}
                      onClick={() => handleSelectMessage(message)}
                      className={`w-full rounded-lg border p-3 text-left transition-all ${
                        selectedMessage?.id === message.id
                          ? 'border-primary bg-primary/5'
                          : 'border-border bg-background/50 hover:border-primary/50'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <p className="font-semibold text-foreground text-sm truncate">
                          {message.name}
                        </p>
                        <div className="flex gap-1 flex-shrink-0">
                          {!message.isRead && (
                            <Mail className="h-4 w-4 text-orange-500" />
                          )}
                          {message.isReplied && (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground truncate mb-1">
                        {message.subject}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(message.createdAt).toLocaleString('ru-RU')}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Message Detail */}
          <div className="lg:col-span-2">
            {selectedMessage ? (
              <div className="rounded-2xl glass-card p-6 backdrop-blur-xl">
                {/* Header */}
                <div className="flex items-start justify-between mb-6 pb-4 border-b border-border">
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-foreground mb-2">
                      {selectedMessage.subject}
                    </h2>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>От: {selectedMessage.name}</span>
                      <span>•</span>
                      <a
                        href={`mailto:${selectedMessage.email}`}
                        className="text-primary hover:underline"
                      >
                        {selectedMessage.email}
                      </a>
                      <span>•</span>
                      <span>
                        {new Date(selectedMessage.createdAt).toLocaleString('ru-RU')}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {selectedMessage.isReplied ? (
                      <span className="flex items-center gap-2 rounded-full bg-green-500/10 px-3 py-1 text-xs font-semibold text-green-600 dark:text-green-400">
                        <CheckCircle className="h-4 w-4" />
                        Отвечено
                      </span>
                    ) : selectedMessage.isRead ? (
                      <span className="flex items-center gap-2 rounded-full bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-600 dark:text-blue-400">
                        <MailOpen className="h-4 w-4" />
                        Прочитано
                      </span>
                    ) : null}
                  </div>
                </div>

                {/* Message */}
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-foreground mb-2">
                    Сообщение:
                  </h3>
                  <div className="rounded-lg bg-background/50 p-4 border border-border">
                    <p className="text-sm text-foreground whitespace-pre-wrap">
                      {selectedMessage.message}
                    </p>
                  </div>
                </div>

                {/* Admin Note */}
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-foreground mb-2">
                    Заметка администратора:
                  </h3>
                  <textarea
                    value={noteText}
                    onChange={e => setNoteText(e.target.value)}
                    rows={4}
                    className="w-full rounded-xl border-2 border-input bg-background/50 px-4 py-3 text-foreground transition-all duration-300 placeholder:text-muted-foreground hover:border-primary/50 focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    placeholder="Добавьте заметку (видна только администраторам)..."
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button onClick={handleSaveNote} variant="outline">
                    <Save className="mr-2 h-4 w-4" />
                    Сохранить заметку
                  </Button>
                  {!selectedMessage.isReplied && (
                    <Button onClick={handleMarkReplied}>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Отметить как отвечено
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    onClick={() => handleDelete(selectedMessage.id)}
                    className="ml-auto text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Удалить
                  </Button>
                  <Button variant="outline" onClick={() => setSelectedMessage(null)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl glass-card p-12 backdrop-blur-xl text-center">
                <MessageSquare className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  Выберите сообщение для просмотра
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
