import { useGetAllContactMessagesQuery } from '@/entities/contact'
import { useGetAllFAQsQuery } from '@/entities/faq'
import { useGetAdminAnalyticsOverviewQuery } from '@/entities/analytics'
import {
  HelpCircle,
  Clock,
  Mail,
  MessageSquare,
  Users,
  GraduationCap,
  BookOpen,
  LineChart,
} from 'lucide-react'
import { useMemo } from 'react'
import type { AdminStatItemProps } from '../ui/AdminStatItem'
import type { AdminAnalyticsOverview } from '@/shared/types/analytics'

export const useAdminDashboardData = () => {
  const { data: contactData } = useGetAllContactMessagesQuery({
    includeRead: true,
  })

  const { data: faqData } = useGetAllFAQsQuery({
    includeInactive: true,
  })

  const { data: analyticsData } = useGetAdminAnalyticsOverviewQuery()

  const messages = useMemo(() => contactData?.data?.messages ?? [], [contactData?.data?.messages])
  const faqItems = useMemo(() => faqData?.data?.items ?? [], [faqData?.data?.items])

  const analytics: AdminAnalyticsOverview | null = analyticsData?.data ?? null

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

    const baseStats = [
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
    ] as AdminStatItemProps[]

    if (!analytics) {
      return baseStats
    }

    baseStats.unshift(
      {
        id: 'users',
        title: 'Пользователи',
        value: analytics.users.total,
        total: null,
        icon: Users,
        color: 'from-emerald-500 to-teal-500',
        link: '/admin/users',
      },
      {
        id: 'courses',
        title: 'Курсы (всего/опублик.)',
        value: analytics.courses.total,
        total: analytics.courses.byStatus.PUBLISHED ?? null,
        icon: BookOpen,
        color: 'from-indigo-500 to-blue-500',
        link: '/admin/courses',
      },
      {
        id: 'enrollments',
        title: 'Завершённых курсов',
        value: analytics.enrollments.completed,
        total: analytics.enrollments.total,
        icon: GraduationCap,
        color: 'from-purple-500 to-pink-500',
        link: '/admin/courses',
      },
      {
        id: 'placement',
        title: 'Placement-сессий (30 дней)',
        value: analytics.placement.completedSessions,
        total: null,
        icon: LineChart,
        color: 'from-cyan-500 to-sky-500',
        link: '/admin/placement',
      }
    )

    return baseStats
  }, [messages, faqItems, analytics])

  return { messages, faqItems, stats, analytics }
}