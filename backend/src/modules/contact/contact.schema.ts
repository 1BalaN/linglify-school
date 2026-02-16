import { z } from 'zod'

export const sendContactMessageSchema = z.object({
  name: z.string().min(2, 'Имя должно содержать минимум 2 символа'),
  email: z.string().email('Введите корректный email'),
  subject: z.string().min(5, 'Тема должна содержать минимум 5 символов'),
  message: z.string().min(10, 'Сообщение должно содержать минимум 10 символов'),
})

export type SendContactMessageDto = z.infer<typeof sendContactMessageSchema>
