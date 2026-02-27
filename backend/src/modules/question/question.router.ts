import { Router } from 'express'
import { lessonController } from '../lesson/lesson.controller'
import { requireAuth, requireRole } from '../../shared/middleware/auth'

const router = Router()

// Создание вопроса
router.post(
  '/',
  requireAuth,
  requireRole('TEACHER', 'ADMIN'),
  lessonController.createQuestion
)

// Обновление вопроса
router.patch(
  '/:id',
  requireAuth,
  requireRole('TEACHER', 'ADMIN'),
  lessonController.updateQuestion
)

// Удаление вопроса
router.delete(
  '/:id',
  requireAuth,
  requireRole('TEACHER', 'ADMIN'),
  lessonController.deleteQuestion
)

// Отправка ответа (для студентов)
router.post('/answer', requireAuth, lessonController.submitAnswer)

export default router
