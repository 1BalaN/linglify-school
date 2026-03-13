import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import type { ChatMessage, ChatThread } from '@/shared/types/chat'
import {
  useGetThreadMessagesQuery,
  useSendMessageMutation,
  useMarkThreadAsReadMutation,
} from '@/entities/chat/api/chatApi'
import { Button, Input } from '@/shared/ui'
import { getSocket } from '@/shared/lib'
import type { RootState } from '@/app/store'
import { Paperclip, X } from 'lucide-react'
import { uploadDocument } from '@/shared/lib/uploadDocument'

interface ChatWindowProps {
  thread: ChatThread | null
  onClose?: () => void
}

export const ChatWindow = ({ thread, onClose }: ChatWindowProps) => {
  const [messageText, setMessageText] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [pendingAttachments, setPendingAttachments] = useState<
    NonNullable<ChatMessage['attachments']>
  >([])
  const [isUploading, setIsUploading] = useState(false)
  const bottomRef = useRef<HTMLDivElement | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const currentUser = useSelector((state: RootState) => state.auth.user)

  const threadId = thread?.id ?? ''

  const { data, isLoading, refetch } = useGetThreadMessagesQuery(
    threadId ? { threadId } : { threadId: '' },
    { skip: !threadId }
  )
  const [sendMessage, { isLoading: isSending }] = useSendMessageMutation()
  const [markAsRead] = useMarkThreadAsReadMutation()

  useEffect(() => {
    if (data?.data) {
      // приходят в порядке desc, разворачиваем
      const sorted = [...data.data].sort((a, b) => a.createdAt.localeCompare(b.createdAt))
      setMessages(sorted)
    } else {
      setMessages([])
    }
  }, [data])

  useEffect(() => {
    if (!threadId) return

    const socket = getSocket()
    if (!socket) return

    // присоединяемся к комнате треда
    socket.emit('chat:thread:join', { threadId })

    const handleNewMessage = (payload: { threadId: string; message: ChatMessage }) => {
      if (payload.threadId !== threadId) return
      setMessages(prev => [...prev, payload.message])
    }

    socket.on('chat:message:new', handleNewMessage)

    return () => {
      socket.off('chat:message:new', handleNewMessage)
      socket.emit('chat:thread:leave', { threadId })
    }
  }, [threadId])

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' })
    }
  }, [messages.length])

  useEffect(() => {
    if (!threadId) return
    markAsRead({ threadId }).catch(() => {})
  }, [threadId, markAsRead])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!threadId || (!messageText.trim() && pendingAttachments.length === 0)) return

    const text = messageText.trim()
    const attachments = pendingAttachments.length ? pendingAttachments : undefined
    const prevAttachments = pendingAttachments
    setMessageText('')
    setPendingAttachments([])
    try {
      await sendMessage({ threadId, text, attachments }).unwrap()
      // сервер всё равно пришлёт сообщение по сокету, но можно подстраховаться refetch’ем
      await refetch()
    } catch {
      // при ошибке можно вернуть текст и вложения обратно
      setMessageText(text)
      setPendingAttachments(prevAttachments)
    }
  }

  const title = useMemo(() => {
    if (!thread) return 'Выберите диалог'
    if (thread.type === 'SUPPORT') {
      if (currentUser?.role === 'ADMIN' && thread.user) {
        const name = `${thread.user.firstName ?? ''} ${thread.user.lastName ?? ''}`.trim()
        return name || thread.user.email
      }
      return 'Поддержка Linglify'
    }
    if (thread.type === 'COURSE_DM') {
      return thread.course?.title ?? 'Диалог по курсу'
    }
    return 'Диалог'
  }, [thread, currentUser])

  const handleFilesSelected = useCallback(async (files: FileList | null) => {
    if (!files || !files.length) return
    setIsUploading(true)
    try {
      const uploads = await Promise.all(
        Array.from(files).map(async file => {
          const res = await uploadDocument(file)
          return {
            url: res.url,
            name: res.name,
            size: res.size,
            mimeType: file.type || undefined,
          }
        })
      )
      setPendingAttachments(prev => [...(prev ?? []), ...uploads])
    } catch (error) {
      console.error('Ошибка загрузки файла в чат', error)
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }, [])

  // Извлекает файлы из ClipboardData (работает для файлов и скриншотов)
  const extractFilesFromClipboard = useCallback((clipboardData: DataTransfer): File[] => {
    const files: File[] = []
    if (clipboardData.files?.length > 0) {
      files.push(...Array.from(clipboardData.files))
    } else {
      for (const item of Array.from(clipboardData.items)) {
        if (item.kind === 'file') {
          const file = item.getAsFile()
          if (file) files.push(file)
        }
      }
    }
    return files
  }, [])

  // Глобальный обработчик вставки — срабатывает даже когда фокус на сообщениях,
  // а не в поле ввода (например, пользователь скроллит историю и жмёт Ctrl+V)
  useEffect(() => {
    if (!threadId) return

    const handleGlobalPaste = (e: ClipboardEvent) => {
      if (!e.clipboardData) return
      const files = extractFilesFromClipboard(e.clipboardData)
      if (!files.length) return
      e.preventDefault()
      const dt = new DataTransfer()
      files.forEach(f => dt.items.add(f))
      void handleFilesSelected(dt.files)
    }

    document.addEventListener('paste', handleGlobalPaste)
    return () => {
      document.removeEventListener('paste', handleGlobalPaste)
    }
  }, [threadId, handleFilesSelected, extractFilesFromClipboard])

  const handlePaste = useCallback(
    async (event: React.ClipboardEvent<HTMLDivElement | HTMLFormElement | HTMLInputElement>) => {
      const { clipboardData } = event
      if (!clipboardData) return
      const files = extractFilesFromClipboard(clipboardData)
      if (!files.length) return
      event.preventDefault()
      const dt = new DataTransfer()
      files.forEach(f => dt.items.add(f))
      await handleFilesSelected(dt.files)
    },
    [extractFilesFromClipboard, handleFilesSelected]
  )
  if (!thread) {
    return (
      <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-border/60 bg-muted/40 text-sm text-muted-foreground">
        Выберите диалог, чтобы начать общение
      </div>
    )
  }

  const formatTime = (iso: string) =>
    new Date(iso).toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
    })

  const getMessageMeta = (msg: ChatMessage) => {
    if (msg.type === 'SYSTEM') {
      return {
        position: 'center' as const,
        bubbleClass: 'mx-auto bg-muted text-muted-foreground',
        label: 'Система',
      }
    }

    if (!currentUser) {
      return {
        position: 'left' as const,
        bubbleClass: 'mr-auto bg-secondary text-secondary-foreground',
        label: '',
      }
    }

    if (msg.senderId === currentUser.id) {
      return {
        position: 'right' as const,
        bubbleClass:
          'ml-auto bg-primary text-primary-foreground rounded-br-sm rounded-tl-2xl rounded-tr-2xl',
        label: 'Вы',
      }
    }

    let label = 'Собеседник'
    if (thread?.type === 'COURSE_DM') {
      if (msg.senderId === thread?.teacherId && thread.teacher) {
        const name = `${thread.teacher.firstName ?? ''} ${thread.teacher.lastName ?? ''}`.trim()
        label = name ? `${name}` : `${thread.teacher.email}`
      } else if (msg.senderId === thread?.studentId && thread.student) {
        const name = `${thread.student.firstName ?? ''} ${thread.student.lastName ?? ''}`.trim()
        label = name ? `${name}` : `${thread.student.email}`
      }
    } else if (thread?.type === 'SUPPORT') {
      if (msg.senderId === thread.userId && thread.user) {
        const name = `${thread.user.firstName ?? ''} ${thread.user.lastName ?? ''}`.trim()
        label = name ? `Пользователь: ${name}` : `Пользователь: ${thread.user.email}`
      } else {
        label = 'Поддержка'
      }
    }

    return {
      position: 'left' as const,
      bubbleClass:
        'mr-auto bg-secondary text-secondary-foreground rounded-bl-sm rounded-tr-2xl rounded-tl-2xl',
      label,
    }
  }

  return (
    <div className="flex h-full flex-col rounded-2xl border border-border bg-gradient-to-br from-background via-card to-background">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div>
          <h2 className="text-sm font-semibold text-foreground">{title}</h2>
          {thread.type === 'COURSE_DM' && thread.course && (
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              Диалог по курсу «{thread.course.title}»
            </p>
          )}
          {thread.type === 'SUPPORT' && (
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              Задайте вопрос команде поддержки платформы
            </p>
          )}
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="ml-2 inline-flex h-7 w-7 items-center justify-center rounded-full border border-border text-xs text-muted-foreground transition hover:border-destructive/60 hover:text-destructive"
            aria-label="Закрыть диалог"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <div
        className="flex-1 space-y-3 overflow-y-auto px-4 py-3 scroll-soft"
        onPaste={handlePaste}
      >
        {isLoading && (
          <p className="text-xs text-muted-foreground">Загрузка сообщений...</p>
        )}
        {!isLoading && messages.length === 0 && (
          <p className="text-xs text-muted-foreground">
            Здесь пока нет сообщений. Напишите первое, чтобы начать диалог.
          </p>
        )}

        {messages.map(msg => {
          const meta = getMessageMeta(msg)
          const hasAttachments = msg.attachments && msg.attachments.length > 0

          return (
            <div
              key={msg.id}
              className={`flex w-full ${meta.position === 'right' ? 'justify-end' : meta.position === 'left' ? 'justify-start' : 'justify-center'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-3 py-2 text-xs shadow-sm ${meta.bubbleClass}`}
              >
                {meta.label && (
                  <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide opacity-80">
                    {meta.label}
                  </p>
                )}
                {msg.text && <p className="whitespace-pre-wrap break-words">{msg.text}</p>}

                {hasAttachments && (
                  <div className="mt-2 space-y-1">
                    {msg.attachments!.map(file => {
                      const downloadUrl = `/api/upload/document/download?url=${encodeURIComponent(file.url)}&name=${encodeURIComponent(file.name)}`
                      return (
                        <a
                          key={file.url}
                          href={downloadUrl}
                          className="flex items-center gap-2 rounded-lg bg-black/5 px-2 py-1 text-[11px] underline-offset-2 hover:underline dark:bg-white/5"
                        >
                          <Paperclip className="h-3 w-3" />
                          <span className="truncate">{file.name}</span>
                        </a>
                      )
                    })}
                  </div>
                )}

                <p className="mt-1 text-[10px] opacity-70">{formatTime(msg.createdAt)}</p>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      <form
        onSubmit={handleSend}
        className="border-t border-border px-3 py-2"
        onPaste={handlePaste}
      >
        {pendingAttachments.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-2">
            {pendingAttachments.map(file => (
              <div
                key={file.url}
                className="flex items-center gap-2 rounded-full bg-muted px-3 py-1 text-[11px]"
              >
                <Paperclip className="h-3 w-3" />
                <span className="max-w-[140px] truncate">{file.name}</span>
              </div>
            ))}
          </div>
        )}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-dashed border-border/60 text-muted-foreground transition hover:border-primary hover:text-primary"
            title="Прикрепить файл"
          >
            <Paperclip className="h-4 w-4" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={e => handleFilesSelected(e.target.files)}
          />
          <Input
            value={messageText}
            onChange={e => setMessageText(e.target.value)}
            placeholder={
              isUploading ? 'Загружаем вложения...' : 'Напишите сообщение или вставьте скриншот Ctrl+V'
            }
            disabled={isUploading}
            onPaste={handlePaste}
          />
          <Button type="submit" size="sm" isLoading={isSending || isUploading}>
            Отправить
          </Button>
        </div>
      </form>
    </div>
  )
}

