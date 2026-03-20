import { BarChart3, BookOpen, HelpCircle, MessageSquare, Settings, Shield, Users, Target, DollarSign } from "lucide-react";

export const adminDashboardQuickLinks = [
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
    },
    {
      title: 'Курсы',
      description: 'Управление курсами и контентом',
      icon: BookOpen,
      link: '/admin/courses',
      color: 'from-orange-500 to-amber-500',
    },
    {
      title: 'Placement-тест',
      description: 'Вопросы для определения уровня студентов',
      icon: Target,
      link: '/admin/placement',
      color: 'from-cyan-500 to-blue-500',
    },
    {
      title: 'Модерация',
      description: 'Проверка и одобрение курсов',
      icon: Shield,
      link: '/admin/moderation',
      color: 'from-purple-500 to-pink-500',
    },
    {
      title: 'Аналитика',
      description: 'Статистика и отчёты',
      icon: BarChart3,
      link: '/admin/analytics',
      color: 'from-indigo-500 to-blue-500',
    },
    {
      title: 'Настройки',
      description: 'Конфигурация платформы',
      icon: Settings,
      link: '/admin/settings',
      color: 'from-gray-500 to-slate-500',
    },
    {
      title: 'Выручка',
      description: 'Продажи курсов, комиссии и выплаты преподавателям',
      icon: DollarSign,
      link: '/admin/revenue',
      color: 'from-emerald-500 to-green-600',
    },
]