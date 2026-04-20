import { useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import { useSearchParams } from 'react-router-dom'
import type { RootState } from '@/app/store'
import { useGetMyThreadsQuery, useEnsureSupportThreadMutation } from '@/entities/chat/api/chatApi'
import type { ChatThread } from '@/shared/types/chat'
import { ChatThreadList } from '@/features/chat/ui/ChatThreadList'
import { ChatWindow } from '@/features/chat/ui/ChatWindow'
import { Button } from '@/shared/ui'
import { getSocket } from '@/shared/lib'
import { WifiOff } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export const ChatsPage = () => {
  const { t } = useTranslation('platform')
  const { user } = useSelector((state: RootState) => state.auth)
  const { data, isLoading, refetch } = useGetMyThreadsQuery(undefined, {
    refetchOnMountOrArgChange: true,
    refetchOnFocus: true,
    refetchOnReconnect: true,
  })
  const [ensureSupportThread, { isLoading: isEnsuringSupport }] = useEnsureSupportThreadMutation()
  const [selectedThread, setSelectedThread] = useState<ChatThread | null>(null)
  const [searchParams] = useSearchParams()
  const [socketStatus, setSocketStatus] = useState<'connected' | 'disconnected' | 'reconnecting'>('connected')

  const threads = useMemo(() => data?.data ?? [], [data])

  // Track socket connect/disconnect to show a status banner
  useEffect(() => {
    const socket = getSocket()
    if (!socket) return

    const onConnect = () => {
      setSocketStatus('connected')
      void refetch()
    }
    const onDisconnect = () => setSocketStatus('disconnected')
    const onReconnectAttempt = () => setSocketStatus('reconnecting')
    const onReconnect = () => {
      setSocketStatus('connected')
      void refetch()
    }

    socket.on('connect', onConnect)
    socket.on('disconnect', onDisconnect)
    socket.io.on('reconnect_attempt', onReconnectAttempt)
    socket.io.on('reconnect', onReconnect)

    if (socket.connected) setSocketStatus('connected')
    else setSocketStatus('disconnected')

    return () => {
      socket.off('connect', onConnect)
      socket.off('disconnect', onDisconnect)
      socket.io.off('reconnect_attempt', onReconnectAttempt)
      socket.io.off('reconnect', onReconnect)
    }
  }, [refetch])

  const handleSelect = (thread: ChatThread) => {
    setSelectedThread(thread)
  }

  const handleOpenSupport = async () => {
    try {
      const res = await ensureSupportThread().unwrap()
      setSelectedThread(res.data)
    } catch {
      // noop — could surface an error toast here
    }
  }

  // Auto-select thread when courseId is in the URL (e.g. /chats?courseId=123)
  useEffect(() => {
    if (!threads.length) return
    const courseId = searchParams.get('courseId')
    if (!courseId) return

    const courseThread = threads.find(
      t => t.type === 'COURSE_DM' && t.courseId === courseId
    )
    if (courseThread) {
      setSelectedThread(courseThread)
    }
  }, [threads, searchParams])

  if (!user) {
    return null
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-primary/5 via-background to-secondary/5 py-8">
      <div className="container mx-auto max-w-6xl px-4">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{t('chat.pageTitle')}</h1>
            <p className="text-sm text-muted-foreground">
              {t('chat.pageSubtitle')}
            </p>
          </div>
          {user.role !== 'ADMIN' && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleOpenSupport}
              isLoading={isEnsuringSupport}
            >
              {t('chat.support')}
            </Button>
          )}
        </div>

        {socketStatus !== 'connected' && (
          <div className="mb-3 flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300">
            <WifiOff className="h-4 w-4 shrink-0" />
            {socketStatus === 'reconnecting'
              ? t('chat.reconnecting')
              : t('chat.disconnected')}
          </div>
        )}

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,2fr)] lg:h-[calc(100vh-200px)]">
          <div className="flex flex-col rounded-2xl border border-border bg-card p-4">
            <h2 className="mb-2 text-sm font-semibold text-foreground">{t('chat.dialogs')}</h2>
            {isLoading ? (
              <p className="text-xs text-muted-foreground">{t('chat.loadingThreads')}</p>
            ) : (
              <ChatThreadList
                threads={threads}
                selectedId={selectedThread?.id ?? null}
                currentUserRole={user.role}
                onSelect={handleSelect}
              />
            )}
          </div>

          <div className="min-h-[360px] lg:h-full">
            <ChatWindow
              thread={selectedThread}
              onClose={() => setSelectedThread(null)}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChatsPage

