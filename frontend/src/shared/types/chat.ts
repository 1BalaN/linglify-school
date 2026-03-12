import type { UserRole } from './user'

export type ChatThreadType = 'COURSE_DM' | 'SUPPORT'
export type ChatMessageType = 'USER' | 'SYSTEM'

export interface ChatThread {
  id: string
  type: ChatThreadType
  courseId?: string | null
  course?: {
    id: string
    title: string
  } | null
  studentId?: string | null
  student?: {
    id: string
    firstName: string | null
    lastName: string | null
    email: string
    avatar?: string | null
  } | null
  teacherId?: string | null
  teacher?: {
    id: string
    firstName: string | null
    lastName: string | null
    email: string
    avatar?: string | null
  } | null
  userId?: string | null // для SUPPORT
  user?: {
    id: string
    firstName: string | null
    lastName: string | null
    email: string
    avatar?: string | null
  } | null
  hasUnreadForStudent: boolean
  hasUnreadForTeacher: boolean
  hasUnreadForAdmin: boolean
  lastMessageAt?: string | null
}

export interface ChatMessage {
  id: string
  threadId: string
  senderId: string | null
  type: ChatMessageType
  text: string
  isRead: boolean
  readAt: string | null
  createdAt: string
  attachments?: {
    url: string
    name: string
    size?: number
    mimeType?: string
  }[] | null
}

export interface ChatThreadListResponse {
  data: ChatThread[]
}

export interface ChatMessagesResponse {
  data: ChatMessage[]
}

export type ChatParticipantRole = UserRole

