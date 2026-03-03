import { z } from 'zod'
import { CourseLevel, CourseStatus } from '@prisma/client'

// Валидация для создания курса
export const createCourseSchema = z.object({
  title: z.string().min(3, 'Название должно быть не менее 3 символов').max(200, 'Название не должно превышать 200 символов'),
  description: z.string().min(10, 'Описание должно быть не менее 10 символов'),
  shortDescription: z.string().min(10, 'Краткое описание должно быть не менее 10 символов').max(500, 'Краткое описание не должно превышать 500 символов').optional(),
  level: z.nativeEnum(CourseLevel, { errorMap: () => ({ message: 'Некорректный уровень курса' }) }),
  language: z.string().default('Английский'),
  category: z.string().optional(),
  coverImage: z.string().url('Некорректный URL изображения').optional(),
  previewVideo: z.string().url('Некорректный URL видео').optional(),
  duration: z.number().int().positive('Продолжительность должна быть положительным числом').optional(),
  price: z.number().int().min(0, 'Цена не может быть отрицательной').default(0),
  currency: z.string().default('BYN'),
  tags: z.array(z.string()).default([]),
  prerequisites: z.array(z.string()).default([]),
  learningOutcomes: z.array(z.string()).default([]),
})

// Валидация для обновления курса
export const updateCourseSchema = createCourseSchema.partial()

// Валидация для изменения статуса курса
export const updateCourseStatusSchema = z.object({
  status: z.nativeEnum(CourseStatus, { errorMap: () => ({ message: 'Некорректный статус курса' }) }),
  comment: z.string().max(1000).optional(),
})

// Валидация для публикации курса
export const publishCourseSchema = z.object({
  isPublished: z.boolean(),
})

// Валидация для фильтрации курсов
export const getCoursesQuerySchema = z.object({
  level: z.nativeEnum(CourseLevel).optional(),
  category: z.string().optional(),
  status: z.nativeEnum(CourseStatus).optional(),
  teacherId: z.string().uuid().optional(),
  search: z.string().optional(),
  minPrice: z.coerce.number().int().min(0).optional(),
  maxPrice: z.coerce.number().int().min(0).optional(),
  tags: z.string().optional(), // Comma-separated tags
  isPublished: z.coerce.boolean().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  sortBy: z.enum(['createdAt', 'updatedAt', 'title', 'price', 'enrolledCount', 'averageRating']).default('createdAt'),
  order: z.enum(['asc', 'desc']).default('desc'),
})

// Валидация для зачисления на курс
export const enrollCourseSchema = z.object({
  courseId: z.string().uuid('Некорректный ID курса'),
})

// Валидация для отзыва
export const createReviewSchema = z.object({
  courseId: z.string().uuid('Некорректный ID курса'),
  rating: z.number().int().min(1, 'Минимальная оценка - 1 звезда').max(5, 'Максимальная оценка - 5 звезд'),
  comment: z.string().max(1000, 'Комментарий не должен превышать 1000 символов').optional(),
})

export const updateReviewSchema = z.object({
  rating: z.number().int().min(1).max(5).optional(),
  comment: z.string().max(1000).optional(),
})

// Типы
export type CreateCourseDto = z.infer<typeof createCourseSchema>
export type UpdateCourseDto = z.infer<typeof updateCourseSchema>
export type UpdateCourseStatusDto = z.infer<typeof updateCourseStatusSchema>
export type PublishCourseDto = z.infer<typeof publishCourseSchema>
export type GetCoursesQuery = z.infer<typeof getCoursesQuerySchema>
export type EnrollCourseDto = z.infer<typeof enrollCourseSchema>
export type CreateReviewDto = z.infer<typeof createReviewSchema>
export type UpdateReviewDto = z.infer<typeof updateReviewSchema>
