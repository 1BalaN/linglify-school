export type UserRole = 'GUEST' | 'STUDENT' | 'TEACHER' | 'ADMIN'

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
}
