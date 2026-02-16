export interface FAQItem {
  id: string
  question: string
  answer: string
  category: string
  order: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateFAQDto {
  question: string
  answer: string
  category: string
  order?: number
  isActive?: boolean
}

export interface UpdateFAQDto {
  question?: string
  answer?: string
  category?: string
  order?: number
  isActive?: boolean
}
