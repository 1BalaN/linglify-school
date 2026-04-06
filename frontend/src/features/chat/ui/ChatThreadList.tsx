import { useTranslation } from 'react-i18next'
import type { ChatThread } from '@/shared/types/chat'
import type { UserRole } from '@/shared/types/user'

interface ChatThreadListProps {
  threads: ChatThread[]
  selectedId: string | null
  currentUserRole: UserRole | null
  onSelect: (thread: ChatThread) => void
}

export const ChatThreadList = ({
  threads,
  selectedId,
  currentUserRole,
  onSelect,
}: ChatThreadListProps) => {
  const { t } = useTranslation('platform')
  const tl = (k: string) => t(`chat.threadList.${k}`)
  const getTitle = (thread: ChatThread) => {
    if (thread.type === 'SUPPORT') {
      if (currentUserRole === 'ADMIN') {
        const u = thread.user
        if (u) {
          const name = `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim()
          return name || u.email
        }
        return tl('supportRequest')
      }
      return tl('supportLinglify')
    }

    if (currentUserRole === 'STUDENT') {
      return thread.course?.title ?? tl('courseFallback')
    }

    if (currentUserRole === 'TEACHER') {
      const s = thread.student
      if (s) {
        const name = `${s.firstName ?? ''} ${s.lastName ?? ''}`.trim()
        return name || s.email
      }
      return thread.course?.title ?? tl('studentFallback')
    }

    return thread.course?.title ?? tl('chatFallback')
  }

  const hasUnreadForMe = (thread: ChatThread) => {
    if (!currentUserRole) return false
    if (currentUserRole === 'STUDENT') return thread.hasUnreadForStudent
    if (currentUserRole === 'TEACHER') return thread.hasUnreadForTeacher
    if (currentUserRole === 'ADMIN') return thread.hasUnreadForAdmin
    return false
  }

  const getAvatarData = (thread: ChatThread) => {
    if (thread.type === 'SUPPORT') {
      // Admin sees the user who opened support
      if (currentUserRole === 'ADMIN') {
        const u = thread.user
        if (!u) {
          return {
            avatar: null,
            initials: 'A',
            color: 'bg-red-600',
          }
        }
        const initials = `${(u.firstName?.[0] ?? '').toUpperCase()}${(u.lastName?.[0] ?? '').toUpperCase()}`
        return {
          avatar: u.avatar ?? null,
          initials: initials || u.email[0]?.toUpperCase() || '?',
          color: 'bg-amber-500',
        }
      }

      // Student/teacher: support thread
      return {
        avatar: null,
        initials: 'S',
        color: 'bg-indigo-600',
      }
    }

    if (currentUserRole === 'STUDENT') {
      const teacher = thread.teacher
      if (!teacher) return null
      const initials = `${(teacher.firstName?.[0] ?? '').toUpperCase()}${(teacher.lastName?.[0] ?? '').toUpperCase()}`
      return {
        avatar: teacher.avatar ?? null,
        initials: initials || teacher.email[0]?.toUpperCase() || 'T',
        color: 'bg-blue-600',
      }
    }

    if (currentUserRole === 'TEACHER') {
      const s = thread.student
      if (!s) return null
      const initials = `${(s.firstName?.[0] ?? '').toUpperCase()}${(s.lastName?.[0] ?? '').toUpperCase()}`
      return {
        avatar: s.avatar ?? null,
        initials: initials || s.email[0]?.toUpperCase() || 'S',
        color: 'bg-emerald-600',
      }
    }

    return null
  }

  return (
    <div className="flex-1 space-y-1 overflow-y-auto scroll-soft pr-1">
      {threads.length === 0 && (
        <div className="rounded-xl border border-dashed border-border/60 bg-muted/40 p-4 text-center text-xs text-muted-foreground">
          {tl('emptyList')}
        </div>
      )}
      {threads.map(thread => {
        const active = thread.id === selectedId
        const unread = hasUnreadForMe(thread)
        const avatarData = getAvatarData(thread)

        return (
          <button
            key={thread.id}
            type="button"
            onClick={() => onSelect(thread)}
            className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs transition-colors ${
              active ? 'bg-primary/10 text-primary' : 'hover:bg-muted'
            }`}
          >
            <div className="flex flex-1 items-center gap-3">
              {avatarData && (
                <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-muted shadow-sm">
                  {avatarData.avatar ? (
                    <img
                      src={avatarData.avatar}
                      alt={avatarData.initials}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div
                      className={`flex h-full w-full items-center justify-center text-[11px] font-semibold text-white ${avatarData.color}`}
                    >
                      {avatarData.initials}
                    </div>
                  )}
                </div>
              )}
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="line-clamp-1 font-medium">{getTitle(thread)}</span>
                  {thread.type === 'SUPPORT' && (
                    <span className="rounded-full bg-blue-500/10 px-2 py-0.5 text-[10px] text-blue-600 dark:text-blue-400">
                      {tl('supportTag')}
                    </span>
                  )}
                </div>
                {thread.course && currentUserRole !== 'STUDENT' && (
                  <p className="mt-0.5 line-clamp-1 text-[11px] text-muted-foreground">
                    {thread.course.title}
                  </p>
                )}
              </div>
              {unread && (
                <span className="ml-2 h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_0_4px_rgba(16,185,129,0.25)]" />
              )}
            </div>
          </button>
        )
      })}
    </div>
  )
}

