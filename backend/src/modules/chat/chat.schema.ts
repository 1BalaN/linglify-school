import { z } from 'zod'

export const createMessageSchema = z.object({
  text: z
    .string()
    .max(2000, 'Сообщение не должно превышать 2000 символов'),
  attachments: z
    .array(
      z.object({
        url: z.string().url(),
        name: z.string(),
        size: z.number().int().nonnegative().optional(),
        mimeType: z.string().optional(),
      })
    )
    .optional(),
})

export const getThreadMessagesQuerySchema = z.object({
  cursor: z.string().uuid().optional(),
  limit: z.coerce.number().int().positive().max(100).default(50),
})

export type CreateMessageDto = z.infer<typeof createMessageSchema>

