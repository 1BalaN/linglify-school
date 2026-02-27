import { z } from 'zod'
import { LessonType, QuestionType } from '@prisma/client'

// Lesson schemas
export const createLessonSchema = z.object({
  courseId: z.string().uuid(),
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  // Порядок теперь вычисляется на бэкенде, поле не обязательно в запросе
  order: z.number().int().positive().optional(),
  type: z.nativeEnum(LessonType),
  content: z.string().optional(),
  videoUrl: z.string().url().optional(),
  duration: z.number().int().positive().optional(),
  attachments: z.any().optional(),
  isPublished: z.boolean().optional(),
  isFinalTest: z.boolean().optional(),
})

export const updateLessonSchema = createLessonSchema.omit({ courseId: true }).partial()

// Question schemas
export const createQuestionSchema = z.object({
  lessonId: z.string().uuid(),
  type: z.nativeEnum(QuestionType),
  order: z.number().int().positive(),
  question: z.string().min(1),
  explanation: z.string().optional(),
  options: z.any(),
  points: z.number().int().positive().optional(),
  timeLimit: z.number().int().positive().optional(),
})

export const updateQuestionSchema = createQuestionSchema.omit({ lessonId: true }).partial()

// Answer schemas
export const submitAnswerSchema = z.object({
  questionId: z.string().uuid(),
  answer: z.any(),
})

// Progress schemas
export const updateProgressSchema = z.object({
  lessonId: z.string().uuid(),
  isCompleted: z.boolean().optional(),
  timeSpent: z.number().int().nonnegative().optional(),
  lastPosition: z.number().int().nonnegative().optional(),
  score: z.number().min(0).max(100).optional(),
})

// Types
export type CreateLessonDto = z.infer<typeof createLessonSchema>
export type UpdateLessonDto = z.infer<typeof updateLessonSchema>
export type CreateQuestionDto = z.infer<typeof createQuestionSchema>
export type UpdateQuestionDto = z.infer<typeof updateQuestionSchema>
export type SubmitAnswerDto = z.infer<typeof submitAnswerSchema>
export type UpdateProgressDto = z.infer<typeof updateProgressSchema>
