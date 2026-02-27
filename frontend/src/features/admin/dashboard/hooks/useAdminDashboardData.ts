import { useGetAllContactMessagesQuery } from '@/entities/contact'
import { useGetAllFAQsQuery } from '@/entities/faq'
import { HelpCircle, Clock, Mail, MessageSquare } from 'lucide-react'
import { useMemo } from 'react'

export const useAdminDashboardData = () => {
  const { data: contactData } = useGetAllContactMessagesQuery({
    includeRead: true,
  })

  const { data: faqData } = useGetAllFAQsQuery({
    includeInactive: true,
  })

  const messages = useMemo(() => contactData?.data?.messages ?? [], [contactData?.data?.messages])
  const faqItems = useMemo(() => faqData?.data?.items ?? [], [faqData?.data?.items])

  const stats = useMemo(() => {
    let unread = 0
    let unreplied = 0
    let activeFaq = 0

    for (const m of messages) {
      if (!m.isRead) unread++
      if (!m.isReplied) unreplied++
    }

    for (const f of faqItems) {
      if (f.isActive) activeFaq++
    }

    return [
      {
        id: 'unread',
        title: 'Непрочитанные',
        value: unread,
        total: messages.length,
        icon: Mail,
        color: 'from-blue-500 to-cyan-500',
        link: '/admin/messages',
      },
      {
        id: 'unreplied',
        title: 'Без ответа',
        value: unreplied,
        total: messages.length,
        icon: Clock,
        color: 'from-orange-500 to-amber-500',
        link: '/admin/messages',
      },
      {
        id: 'faq',
        title: 'FAQ записей',
        value: activeFaq,
        total: null,
        icon: HelpCircle,
        color: 'from-emerald-500 to-teal-500',
        link: '/admin/faq',
      },
      {
        id: 'total',
        title: 'Всего сообщений',
        value: messages.length,
        total: null,
        icon: MessageSquare,
        color: 'from-indigo-500 to-blue-500',
        link: '/admin/messages',
      },
    ]
  }, [messages, faqItems])

  return { messages, faqItems, stats }
}