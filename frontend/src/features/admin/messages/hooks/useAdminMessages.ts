import { useMemo, useState } from 'react'
import {
  useGetAllContactMessagesQuery,
  useMarkMessageAsReadMutation,
  useMarkMessageAsRepliedMutation,
  useUpdateAdminNoteMutation,
  useDeleteContactMessageMutation,
} from '@/entities/contact'
import type { ContactMessage } from '@/shared/types/contact'

export const useAdminMessages = () => {
  const { data, isLoading } = useGetAllContactMessagesQuery({ includeRead: true })

  const [markAsRead] = useMarkMessageAsReadMutation()
  const [markAsReplied] = useMarkMessageAsRepliedMutation()
  const [updateNote] = useUpdateAdminNoteMutation()
  const [deleteMessage] = useDeleteContactMessageMutation()

  const [selectedMessage, setSelectedMessage] =
    useState<ContactMessage | null>(null)
  const [filter, setFilter] =
    useState<'all' | 'unread' | 'unreplied'>('all')
  const [noteText, setNoteText] = useState('')

  const messages = useMemo(() => data?.data?.messages ?? [], [data?.data?.messages])

  const stats = useMemo(() => ({
    total: messages.length,
    unread: messages.filter(m => !m.isRead).length,
    unreplied: messages.filter(m => !m.isReplied).length,
  }), [messages])

  const filteredMessages = useMemo(() => {
    if (filter === 'unread') return messages.filter(m => !m.isRead)
    if (filter === 'unreplied') return messages.filter(m => !m.isReplied)
    return messages
  }, [messages, filter])

  return {
    isLoading,
    messages,
    filteredMessages,
    stats,

    filter,
    setFilter,

    selectedMessage,
    setSelectedMessage,

    noteText,
    setNoteText,

    markAsRead,
    markAsReplied,
    updateNote,
    deleteMessage,
  }
}