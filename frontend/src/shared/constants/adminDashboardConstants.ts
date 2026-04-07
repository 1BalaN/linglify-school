import {
  BarChart3,
  BookOpen,
  DollarSign,
  HelpCircle,
  MessageSquare,
  Settings,
  Shield,
  Target,
  Users,
} from 'lucide-react'

export type AdminDashboardQuickLinkId =
  | 'messages'
  | 'faq'
  | 'users'
  | 'courses'
  | 'placement'
  | 'moderation'
  | 'analytics'
  | 'settings'
  | 'revenue'

export const adminDashboardQuickLinks: {
  id: AdminDashboardQuickLinkId
  icon: typeof MessageSquare
  link: string
  color: string
}[] = [
  {
    id: 'messages',
    icon: MessageSquare,
    link: '/admin/messages',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    id: 'faq',
    icon: HelpCircle,
    link: '/admin/faq',
    color: 'from-emerald-500 to-teal-500',
  },
  {
    id: 'users',
    icon: Users,
    link: '/admin/users',
    color: 'from-rose-500 to-pink-500',
  },
  {
    id: 'courses',
    icon: BookOpen,
    link: '/admin/courses',
    color: 'from-orange-500 to-amber-500',
  },
  {
    id: 'placement',
    icon: Target,
    link: '/admin/placement',
    color: 'from-cyan-500 to-blue-500',
  },
  {
    id: 'moderation',
    icon: Shield,
    link: '/admin/moderation',
    color: 'from-purple-500 to-pink-500',
  },
  {
    id: 'analytics',
    icon: BarChart3,
    link: '/admin/analytics',
    color: 'from-indigo-500 to-blue-500',
  },
  {
    id: 'settings',
    icon: Settings,
    link: '/admin/settings',
    color: 'from-gray-500 to-slate-500',
  },
  {
    id: 'revenue',
    icon: DollarSign,
    link: '/admin/revenue',
    color: 'from-emerald-500 to-green-600',
  },
]
