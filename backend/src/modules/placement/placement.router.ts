import { Router } from 'express'
import { placementController } from './placement.controller'
import { optionalAuth, requireAuth, requireRole } from '../../shared/middleware/auth'

const router = Router()

// Старт placement-теста (гость или авторизованный пользователь)
router.post('/start', optionalAuth, placementController.start.bind(placementController))

// Отправка ответа и получение следующего вопроса / результата
router.post('/answer', optionalAuth, placementController.answer.bind(placementController))

// Получить результат по sessionId
router.get('/result', optionalAuth, placementController.getResult.bind(placementController))

// Получить рекомендованные курсы по результату теста
router.get(
  '/recommended-courses',
  optionalAuth,
  placementController.getRecommendedCourses.bind(placementController)
)

// Админские маршруты для управления вопросами placement-теста
router.get(
  '/questions',
  requireAuth,
  requireRole('ADMIN'),
  placementController.listQuestions.bind(placementController)
)

router.post(
  '/questions',
  requireAuth,
  requireRole('ADMIN'),
  placementController.createQuestion.bind(placementController)
)

router.patch(
  '/questions/:id',
  requireAuth,
  requireRole('ADMIN'),
  placementController.updateQuestion.bind(placementController)
)

router.delete(
  '/questions/:id',
  requireAuth,
  requireRole('ADMIN'),
  placementController.deleteQuestion.bind(placementController)
)

export default router

