import { z } from 'zod'
import { UserRole } from '@prisma/client'

export const getUsersQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  role: z.nativeEnum(UserRole).optional(),
  isActive: z
    .union([z.literal('true'), z.literal('false')])
    .transform(v => v === 'true')
    .optional(),
  search: z.string().trim().optional(),
  createdFrom: z
    .string()
    .transform(val => new Date(val))
    .optional(),
  createdTo: z
    .string()
    .transform(val => new Date(val))
    .optional(),
  segment: z
    .enum(['NEW', 'ACTIVE', 'RISK', 'GRAD'], {
      errorMap: () => ({ message: 'Некорректный сегмент' }),
    })
    .optional(),
})

export const updateUserRoleSchema = z.object({
  role: z.nativeEnum(UserRole),
})

export const updateUserStatusSchema = z.object({
  isActive: z.boolean(),
  reason: z
    .string()
    .trim()
    .max(1000, 'Причина заморозки не должна превышать 1000 символов')
    .nullable()
    .optional(),
})

export const userIdParamsSchema = z.object({
  id: z.string().uuid('Некорректный ID пользователя'),
})

export type GetUsersQuery = z.infer<typeof getUsersQuerySchema>

