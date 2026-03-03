import { z } from 'zod'

export const createCheckoutSessionSchema = z.object({
  courseId: z.string().uuid('Некорректный ID курса'),
})

export const confirmPaymentSchema = z.object({
  sessionId: z.string().min(1, 'sessionId обязателен'),
})

export type CreateCheckoutSessionDto = z.infer<typeof createCheckoutSessionSchema>
export type ConfirmPaymentDto = z.infer<typeof confirmPaymentSchema>

