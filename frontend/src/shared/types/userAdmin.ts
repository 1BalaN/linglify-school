import type { UserRole } from './user'

export interface AdminUserListItem {
  id: string
  email: string
  firstName: string | null
  lastName: string | null
  role: UserRole
  isActive: boolean
  createdAt: string
  _count: {
    enrollments: number
    certificates: number
  }
  lastActivity: string | null
  segment: 'NEW' | 'ACTIVE' | 'RISK' | 'GRAD' | null
}

export interface AdminUserListResponse {
  data: {
    data: AdminUserListItem[]
    pagination: {
      page: number
      limit: number
      total: number
      totalPages: number
    }
  }
}

export interface AdminUserOverview {
  user: {
    id: string
    email: string
    firstName: string | null
    lastName: string | null
    role: UserRole
    isActive: boolean
    deactivationReason: string | null
    createdAt: string
  }
  courses: Array<{
    id: string
    title: string
    level: string
    status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED'
  }>
  stats: {
    totalCourses: number
    completedCourses: number
    totalLessons: number
    completedLessons: number
    totalTimeSpent: number
    certificatesCount: number
  }
  placement: {
    id: string
    language: string
    estimatedLevel: string | null
    finishedAt: string | null
  } | null
}

