import { z } from 'zod'

export const createSubscriptionCheckoutSchema = z.object({
  plan: z.enum(['MONTHLY', 'ANNUAL']),
})

export type CreateSubscriptionCheckoutDto = z.infer<typeof createSubscriptionCheckoutSchema>
