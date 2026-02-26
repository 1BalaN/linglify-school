import { z } from 'zod'

export const issueCertificateSchema = z.object({
  courseId: z.string().uuid('Некорректный ID курса'),
})

export type IssueCertificateDto = z.infer<typeof issueCertificateSchema>

