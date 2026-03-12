import { useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import { useSearchParams } from 'react-router-dom'
import type { RootState } from '@/app/store'
import { useGetMyThreadsQuery, useEnsureSupportThreadMutation } from '@/entities/chat/api/chatApi'
import type { ChatThread } from '@/shared/types/chat'
import { ChatThreadList } from '@/features/chat/ui/ChatThreadList'
import { ChatWindow } from '@/features/chat/ui/ChatWindow'
import { Button } from '@/shared/ui'

export const ChatsPage = () => {
  const { user } = useSelector((state: RootState) => state.auth)
  const { data, isLoading } = useGetMyThreadsQuery(undefined, {
    refetchOnMountOrArgChange: true,
    refetchOnFocus: true,
    refetchOnReconnect: true,
  })
  const [ensureSupportThread, { isLoading: isEnsuringSupport }] = useEnsureSupportThreadMutation()
  const [selectedThread, setSelectedThread] = useState<ChatThread | null>(null)
  const [searchParams] = useSearchParams()

  const threads = useMemo(() => data?.data ?? [], [data])

  const handleSelect = (thread: ChatThread) => {
    setSelectedThread(thread)
  }

  const handleOpenSupport = async () => {
    try {
      const res = await ensureSupportThread().unwrap()
      setSelectedThread(res.data)
    } catch {
      // noop, можно добавить уведомление об ошибке
    }
  }

  // Автовыбор диалога по courseId из URL (например, /chats?courseId=123)
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
            <h1 className="text-2xl font-bold text-foreground">Чаты</h1>
            <p className="text-sm text-muted-foreground">
              Общайтесь с преподавателями по курсам или пишите в поддержку платформы.
            </p>
          </div>
          {user.role !== 'ADMIN' && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleOpenSupport}
              isLoading={isEnsuringSupport}
            >
              Написать в поддержку
            </Button>
          )}
        </div>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,2fr)] lg:h-[calc(100vh-200px)]">
          <div className="flex flex-col rounded-2xl border border-border bg-card p-4">
            <h2 className="mb-2 text-sm font-semibold text-foreground">Диалоги</h2>
            {isLoading ? (
              <p className="text-xs text-muted-foreground">Загрузка чатов...</p>
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

