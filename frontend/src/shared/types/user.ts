export type UserRole = 'GUEST' | 'STUDENT' | 'TEACHER' | 'ADMIN'
export type OAuthProvider = 'GOOGLE' | 'GITHUB' | null

export interface User {
  id: string
  email: string
  firstName: string | null
  lastName: string | null
  avatar: string | null
  bio: string | null
  dateOfBirth: string | null
  preferredLanguage: string | null
  targetLanguages: string[]
  timezone: string | null
  role: UserRole
  isEmailVerified: boolean
  isPhoneVerified: boolean
  phone: string | null
  oauthProvider?: OAuthProvider
  hasPassword?: boolean // Есть ли пароль у пользователя
  isActive?: boolean
  createdAt: string
  updatedAt: string
}

export interface AuthResponse {
  user: User
  accessToken: string
}

export interface LoginDto {
  email: string
  password: string
}

export interface RegisterDto {
  email: string
  password: string
  firstName?: string
  lastName?: string
  role?: 'STUDENT' | 'TEACHER'
}

export type SubscriptionStatus = 'TRIAL' | 'ACTIVE' | 'EXPIRED' | 'CANCELLED'
export type SubscriptionPlan   = 'MONTHLY' | 'ANNUAL'
export type PayoutStatus       = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'REJECTED'

export interface TeacherSubscription {
  id: string
  userId: string
  status: SubscriptionStatus
  plan: SubscriptionPlan | null
  trialEndsAt: string | null
  currentPeriodEnd: string | null
  stripeCustomerId: string | null
  createdAt: string
  updatedAt: string
}

export interface CourseRevenue {
  id: string
  courseId: string
  course: { id: string; title: string; coverImage: string | null }
  teacherId: string
  teacher: { id: string; firstName: string | null; lastName: string | null; email: string; avatar: string | null }
  studentId: string
  student: { id: string; firstName: string | null; lastName: string | null; email: string }
  amount: number
  platformFee: number
  teacherEarning: number
  currency: string
  stripeSessionId: string | null
  createdAt: string
}

export interface PayoutRequest {
  id: string
  teacherId: string
  teacher: { id: string; firstName: string | null; lastName: string | null; email: string }
  amount: number
  currency: string
  payoutDetails: string | null
  status: PayoutStatus
  adminNote: string | null
  processedAt: string | null
  createdAt: string
}
