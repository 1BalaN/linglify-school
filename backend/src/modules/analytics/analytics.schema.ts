import { z } from 'zod'

const periodDaysSchema = z
  .preprocess(value => {
    if (value === undefined || value === null || value === '') return undefined
    const num = typeof value === 'string' ? Number(value) : (value as number)
    return Number.isNaN(num) ? undefined : num
  }, z.number().int().min(1).max(365))
  .optional()

export const adminOverviewQuerySchema = z.object({
  /**
   * Период (в днях) для агрегированной статистики,
   * например для аналитики placement-тестов.
   * По умолчанию 30 дней.
   */
  periodDays: periodDaysSchema,
})

export type AdminOverviewQuery = z.infer<typeof adminOverviewQuerySchema>

export const adminTimeseriesQuerySchema = z.object({
  /**
   * Период (в днях) для построения временных рядов.
   * По умолчанию 30 дней.
   */
  periodDays: periodDaysSchema,
})

export type AdminTimeseriesQuery = z.infer<typeof adminTimeseriesQuerySchema>

export const teacherCourseParamsSchema = z.object({
  courseId: z.string().uuid(),
})

export type TeacherCourseParams = z.infer<typeof teacherCourseParamsSchema>

export const teacherCourseTimeseriesQuerySchema = z.object({
  periodDays: periodDaysSchema,
})

export type TeacherCourseTimeseriesQuery = z.infer<typeof teacherCourseTimeseriesQuerySchema>

