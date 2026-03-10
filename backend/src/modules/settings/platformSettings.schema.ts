import { z } from 'zod'
import { CourseLevel } from '@prisma/client'

export const platformSettingsUpdateSchema = z.object({
  requireFinalTestForCertificate: z.boolean().optional(),
  minProgressForCertificate: z.number().int().min(0).max(100).optional(),
  lowRatingThreshold: z.number().min(0).max(5).optional(),
  minEnrollmentsForRating: z.number().int().min(0).optional(),
  placementDefaultQuestions: z.number().int().min(1).max(100).optional(),
  placementAllowedLanguages: z.array(z.string().min(1)).optional(),
  // Маппинг уровня placement -> уровни курсов, можно задать вручную в JSON
  placementRecommendationMap: z
    .record(
      z.nativeEnum(CourseLevel),
      z.array(z.nativeEnum(CourseLevel)).nonempty()
    )
    .optional(),
})

export type PlatformSettingsUpdateDto = z.infer<typeof platformSettingsUpdateSchema>

