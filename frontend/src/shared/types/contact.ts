export interface SendContactMessageDto {
  name: string
  email: string
  subject: string
  message: string
}

export interface ContactMessage extends SendContactMessageDto {
  id: string
  isRead: boolean
  isReplied: boolean
  adminNote: string | null
  createdAt: string
}
