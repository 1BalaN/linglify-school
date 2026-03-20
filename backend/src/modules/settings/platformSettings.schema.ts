import { z } from 'zod'
import { CourseLevel } from '@prisma/client'

export const platformSettingsUpdateSchema = z.object({
  // Аналитика
  lowRatingThreshold:              z.number().min(0).max(5).optional(),
  minEnrollmentsForRating:         z.number().int().min(0).optional(),

  // Placement-тест
  placementDefaultQuestions:       z.number().int().min(1).max(100).optional(),
  placementAllowedLanguages:       z.array(z.string().min(1)).optional(),
  placementRecommendationMap:      z
    .record(
      z.nativeEnum(CourseLevel),
      z.array(z.nativeEnum(CourseLevel)).nonempty(),
    )
    .optional(),

  // Подписки
  trialSubscriptionDays:           z.number().int().min(1).max(365).optional(),

  // Студенты
  maxCoursesPerStudent:            z.number().int().min(0).optional(),

  // Автоматизация
  autoArchiveDaysAfterInactivity:  z.number().int().min(0).optional(),
  reviewModerationEnabled:         z.boolean().optional(),

  // Сертификаты (глобально)
  certificateValidityMonths:       z.number().int().min(0).optional(),
})

export type PlatformSettingsUpdateDto = z.infer<typeof platformSettingsUpdateSchema>

