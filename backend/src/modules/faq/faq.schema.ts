import { z } from 'zod'

export const createFAQSchema = z.object({
  question: z.string().min(5, 'Вопрос должен содержать минимум 5 символов'),
  answer: z.string().min(10, 'Ответ должен содержать минимум 10 символов'),
  category: z.string().min(2, 'Категория должна содержать минимум 2 символа'),
  order: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
})

export const updateFAQSchema = z.object({
  question: z.string().min(5).optional(),
  answer: z.string().min(10).optional(),
  category: z.string().min(2).optional(),
  order: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
})

export type CreateFAQDto = z.infer<typeof createFAQSchema>
export type UpdateFAQDto = z.infer<typeof updateFAQSchema>
