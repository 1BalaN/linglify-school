export interface PlatformSettings {
  id: number
  requireFinalTestForCertificate: boolean
  minProgressForCertificate: number
  lowRatingThreshold: number
  minEnrollmentsForRating: number
  placementDefaultQuestions: number
  placementAllowedLanguages: string[]
  // Храним маппинг как произвольный JSON, фронт может отображать его как raw
  placementRecommendationMap: unknown | null
  updatedAt: string
}

