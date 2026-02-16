import { useSelector } from 'react-redux'
import { useNavigate, Link } from 'react-router-dom'
import type { RootState } from '@/app/store'
import {
  LayoutDashboard,
  MessageSquare,
  HelpCircle,
  Users,
  BookOpen,
  BarChart3,
  Settings,
  Mail,
  CheckCircle,
  Clock,
} from 'lucide-react'
import { useGetAllContactMessagesQuery } from '@/entities/contact'
import { useGetAllFAQsQuery } from '@/entities/faq'

export const AdminDashboardPage = () => {
  const navigate = useNavigate()
  const user = useSelector((state: RootState) => state.auth.user)
  const { data: contactData } = useGetAllContactMessagesQuery({ includeRead: true })
  const { data: faqData } = useGetAllFAQsQuery({ includeInactive: true })

  if (user?.role !== 'ADMIN') {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <div className="text-center rounded-2xl glass-card p-8 backdrop-blur-xl">
          <h1 className="text-2xl font-bold text-foreground mb-4">
            Доступ запрещён
          </h1>
          <p className="text-muted-foreground mb-6">
            Только администраторы могут просматривать эту страницу
          </p>
          <button
            onClick={() => navigate('/')}
            className="rounded-lg bg-primary px-6 py-2 text-white hover:bg-primary/90"
          >
            На главную
          </button>
        </div>
      </div>
    )
  }

  const messages = contactData?.data?.messages || []
  const unreadCount = messages.filter(m => !m.isRead).length
  const unrepliedCount = messages.filter(m => !m.isReplied).length
  const faqItems = faqData?.data?.items || []
  const activeFaqCount = faqItems.filter(f => f.isActive).length

  const stats = [
    {
      title: 'Непрочитанные',
      value: unreadCount,
      total: messages.length,
      icon: Mail,
      color: 'from-blue-500 to-cyan-500',
      link: '/admin/messages',
    },
    {
      title: 'Без ответа',
      value: unrepliedCount,
      total: messages.length,
      icon: Clock,
      color: 'from-orange-500 to-amber-500',
      link: '/admin/messages',
    },
    {
      title: 'FAQ записей',
      value: activeFaqCount,
      total: faqItems.length,
      icon: HelpCircle,
      color: 'from-emerald-500 to-teal-500',
      link: '/admin/faq',
    },
    {
      title: 'Всего сообщений',
      value: messages.length,
      total: null,
      icon: MessageSquare,
      color: 'from-indigo-500 to-blue-500',
      link: '/admin/messages',
    },
  ]

  const quickLinks = [
    {
      title: 'Сообщения',
      description: 'Просмотр и ответы на сообщения пользователей',
      icon: MessageSquare,
      link: '/admin/messages',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      title: 'Управление FAQ',
      description: 'Редактирование вопросов и ответов',
      icon: HelpCircle,
      link: '/admin/faq',
      color: 'from-emerald-500 to-teal-500',
    },
    {
      title: 'Пользователи',
      description: 'Управление пользователями платформы',
      icon: Users,
      link: '/admin/users',
      color: 'from-rose-500 to-pink-500',
      badge: 'Скоро',
    },
    {
      title: 'Курсы',
      description: 'Управление курсами и контентом',
      icon: BookOpen,
      link: '/admin/courses',
      color: 'from-orange-500 to-amber-500',
      badge: 'Скоро',
    },
    {
      title: 'Аналитика',
      description: 'Статистика и отчёты',
      icon: BarChart3,
      link: '/admin/analytics',
      color: 'from-indigo-500 to-blue-500',
      badge: 'Скоро',
    },
    {
      title: 'Настройки',
      description: 'Конфигурация платформы',
      icon: Settings,
      link: '/admin/settings',
      color: 'from-gray-500 to-slate-500',
      badge: 'Скоро',
    },
  ]

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-primary/5 via-background to-secondary/5 py-8">
      <div className="container mx-auto max-w-7xl px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/30">
              <LayoutDashboard className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gradient">
                Панель администратора
              </h1>
              <p className="text-muted-foreground">
                Добро пожаловать, {user?.firstName || 'Администратор'}
              </p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          {stats.map((stat, index) => (
            <Link
              key={index}
              to={stat.link}
              className="group rounded-2xl glass-card p-6 backdrop-blur-xl transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 hover:scale-105"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${stat.color} shadow-lg`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
                {stat.value > 0 && (
                  <span className="rounded-full bg-red-500/10 px-2 py-1 text-xs font-semibold text-red-600 dark:text-red-400">
                    {stat.value}
                  </span>
                )}
              </div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">
                {stat.title}
              </h3>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-foreground">
                  {stat.value}
                </span>
                {stat.total !== null && (
                  <span className="text-sm text-muted-foreground">
                    / {stat.total}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>

        {/* Quick Links */}
        <div>
          <h2 className="text-xl font-bold text-foreground mb-4">
            Быстрый доступ
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {quickLinks.map((link, index) => (
              <Link
                key={index}
                to={link.link}
                className={`group rounded-2xl glass-card p-6 backdrop-blur-xl transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 ${
                  link.badge ? 'opacity-75 hover:opacity-100' : ''
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br ${link.color}`}>
                    <link.icon className="h-5 w-5 text-white" />
                  </div>
                  {link.badge && (
                    <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                      {link.badge}
                    </span>
                  )}
                </div>
                <h3 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                  {link.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {link.description}
                </p>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mt-8 rounded-2xl glass-card p-6 backdrop-blur-xl">
          <h2 className="text-xl font-bold text-foreground mb-4">
            Последние сообщения
          </h2>
          {messages.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Сообщений пока нет
            </p>
          ) : (
            <div className="space-y-3">
              {messages.slice(0, 5).map(message => (
                <Link
                  key={message.id}
                  to={`/admin/messages`}
                  className="flex items-center gap-4 rounded-xl border border-border bg-background/50 p-4 transition-all hover:bg-primary/5 hover:border-primary/50"
                >
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                    message.isReplied
                      ? 'bg-green-500/10 text-green-600 dark:text-green-400'
                      : message.isRead
                      ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                      : 'bg-orange-500/10 text-orange-600 dark:text-orange-400'
                  }`}>
                    {message.isReplied ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      <Mail className="h-5 w-5" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-foreground truncate">
                        {message.name}
                      </p>
                      {!message.isRead && (
                        <span className="rounded-full bg-red-500/10 px-2 py-0.5 text-xs font-semibold text-red-600 dark:text-red-400">
                          Новое
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {message.subject}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {new Date(message.createdAt).toLocaleDateString('ru-RU')}
                  </span>
                </Link>
              ))}
            </div>
          )}
          {messages.length > 5 && (
            <div className="mt-4 text-center">
              <Link
                to="/admin/messages"
                className="text-sm font-medium text-primary hover:underline"
              >
                Посмотреть все сообщения →
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
