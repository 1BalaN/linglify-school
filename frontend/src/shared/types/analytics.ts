import type { CourseLevel, CourseStatus, LessonType } from './course'

export interface AdminAnalyticsUsers {
  total: number
  students: number
  teachers: number
  admins: number
  newLast30Days: number
}

export type AdminAnalyticsCourseStatusMap = Record<CourseStatus, number>

export interface AdminAnalyticsCourses {
  total: number
  newLast30Days: number
  byStatus: AdminAnalyticsCourseStatusMap
}

export interface AdminAnalyticsEnrollments {
  total: number
  completed: number
  completionRate: number
  newLast30Days: number
}

export interface AdminAnalyticsPlacement {
  periodDays: number
  completedSessions: number
  byLanguageAndLevel: Record<string, Partial<Record<CourseLevel, number>>>
}

export interface AdminAnalyticsCourseSummary {
  id: string
  title: string
  level: CourseLevel
  language: string
  enrolledCount: number
  averageRating: number | null
  reviewsCount: number
  status: CourseStatus
}

export interface AdminAnalyticsLanguageStats {
  language: string
  coursesCount: number
  totalEnrollments: number
}

export interface AdminAnalyticsFunnel {
  totalUsers: number
  placementCompleted: number
  enrolled: number
  certificatesIssued: number
}

export interface AdminAnalyticsOverview {
  users: AdminAnalyticsUsers
  courses: AdminAnalyticsCourses
  enrollments: AdminAnalyticsEnrollments
  placement: AdminAnalyticsPlacement
  topCourses: AdminAnalyticsCourseSummary[]
  lowRatedCourses: AdminAnalyticsCourseSummary[]
  languageCourses: AdminAnalyticsLanguageStats[]
  funnel: AdminAnalyticsFunnel
}

export interface AdminAnalyticsTimeseries {
  periodDays: number
  labels: string[]
  users: {
    registrations: number[]
  }
  enrollments: {
    new: number[]
    completed: number[]
  }
  placement: {
    completedSessions: number[]
  }
}

export interface TeacherCourseLessonAnalytics {
  id: string
  title: string
  type: LessonType | string
  studentsReached: number
  studentsCompleted: number
  avgScore: number | null
  avgTimeSpentSec: number | null
}

export interface TeacherCourseAnalytics {
  course: {
    id: string
    title: string
    level: CourseLevel
    language: string
  }
  enrollments: {
    total: number
    completed: number
    completionRate: number
    activeStudents7Days: number
    newLast30Days: number
  }
  lessons: TeacherCourseLessonAnalytics[]
}

export interface TeacherCourseAnalyticsTimeseries {
  periodDays: number
  labels: string[]
  enrollments: {
    new: number[]
  }
  activeStudents: number[]
}

// ── Student efficiency scoring ──────────────────────────────────────

export type EfficiencyLevel = 'excellent' | 'good' | 'average' | 'poor' | 'critical'

export interface StudentEfficiencyScore {
  userId: string
  user: {
    id: string
    firstName: string | null
    lastName: string | null
    email: string
    avatar: string | null
  }
  /** Integral score E_j in [0, 1] */
  score: number
  /** Harrington-scale tier */
  level: EfficiencyLevel
  /** Normalised criteria values (0-100 for display) */
  breakdown: {
    accuracy:   number
    regularity: number
    practice:   number
    engagement: number
  }
  /** Variance-based weights (0-100, sum ≈ 100) */
  weights: {
    accuracy:   number
    regularity: number
    practice:   number
    engagement: number
  }
}

