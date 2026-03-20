import { z } from 'zod'

const MIN_PAYOUT_CENTS = 1000 // 10 BYN minimum

export const createPayoutRequestSchema = z.object({
  amount: z
    .number()
    .int()
    .min(MIN_PAYOUT_CENTS, `Минимальная сумма выплаты — 10 BYN`),
  payoutDetails: z
    .string()
    .min(5, 'Укажите реквизиты (номер карты, телефон или IBAN)')
    .max(500),
})

export const updatePayoutStatusSchema = z.object({
  status: z.enum(['PROCESSING', 'COMPLETED', 'REJECTED']),
  adminNote: z.string().max(500).optional(),
})

export type CreatePayoutRequestDto = z.infer<typeof createPayoutRequestSchema>
export type UpdatePayoutStatusDto  = z.infer<typeof updatePayoutStatusSchema>
