import { z } from 'zod'
import type { CourseLevel } from '@prisma/client'

export const placementLanguageSchema = z.string().min(2).max(50)

export const placementQuestionTypeSchema = z.enum([
  'GRAMMAR',
  'VOCAB',
  'READING',
  'LISTENING',
])

export const startPlacementSchema = z.object({
  language: placementLanguageSchema,
})

export const submitPlacementAnswerSchema = z.object({
  sessionId: z.string().uuid('Некорректный ID сессии'),
  questionId: z.string().uuid('Некорректный ID вопроса'),
  optionIndex: z.number().int().min(0, 'Индекс ответа не может быть отрицательным'),
  timeMs: z.number().int().min(0).max(10 * 60 * 1000).optional(),
})

export const getPlacementResultSchema = z.object({
  sessionId: z.string().uuid('Некорректный ID сессии'),
})

// Админские схемы для управления вопросами
const basePlacementQuestionSchema = z.object({
  language: placementLanguageSchema,
  type: placementQuestionTypeSchema,
  difficulty: z.number().int().min(1).max(6),
  prompt: z.string().min(10, 'Вопрос должен быть не короче 10 символов'),
  context: z.string().optional(),
  mediaUrl: z.string().url('Некорректный URL медиа').optional(),
  options: z
    .array(z.string().min(1))
    .min(2, 'Должно быть минимум 2 варианта ответа')
    .max(8, 'Максимум 8 вариантов ответа'),
  correctOptionIndex: z.number().int().min(0),
  explanation: z.string().optional(),
})

export const createPlacementQuestionSchema = basePlacementQuestionSchema.refine(
  data => data.correctOptionIndex >= 0 && data.correctOptionIndex < data.options.length,
  {
    message: 'Индекс правильного ответа выходит за пределы массива options',
    path: ['correctOptionIndex'],
  }
)

export const updatePlacementQuestionSchema = basePlacementQuestionSchema.partial()

export const getPlacementQuestionsQuerySchema = z.object({
  language: placementLanguageSchema.optional(),
  type: placementQuestionTypeSchema.optional(),
  difficulty: z.coerce.number().int().min(1).max(6).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
})

export type StartPlacementDto = z.infer<typeof startPlacementSchema>
export type SubmitPlacementAnswerDto = z.infer<typeof submitPlacementAnswerSchema>
export type GetPlacementResultDto = z.infer<typeof getPlacementResultSchema>

export type CreatePlacementQuestionDto = z.infer<typeof createPlacementQuestionSchema>
export type UpdatePlacementQuestionDto = z.infer<typeof updatePlacementQuestionSchema>
export type GetPlacementQuestionsQuery = z.infer<typeof getPlacementQuestionsQuerySchema>

export type PlacementEstimatedLevel = CourseLevel

