export interface PlatformSettings {
  id: number

  // Аналитика
  lowRatingThreshold: number
  minEnrollmentsForRating: number

  // Placement-тест
  placementDefaultQuestions: number
  placementAllowedLanguages: string[]
  placementRecommendationMap: unknown | null

  // Подписки
  trialSubscriptionDays: number

  // Студенты
  maxCoursesPerStudent: number

  // Автоматизация
  autoArchiveDaysAfterInactivity: number
  reviewModerationEnabled: boolean

  // Сертификаты (глобально)
  certificateValidityMonths: number

  updatedAt: string
}
