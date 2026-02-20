import { Router } from 'express'
import { lessonController } from './lesson.controller'
import { requireAuth, requireRole, optionalAuth } from '../../shared/middleware/auth'

const router = Router()

// Создание урока (для преподавателей и админов)
router.post(
  '/',
  requireAuth,
  requireRole('TEACHER', 'ADMIN'),
  lessonController.createLesson
)

// Получение урока (optionalAuth - передаём userId если авторизован, для проверки доступа)
router.get('/:id', optionalAuth, lessonController.getLessonById)

// Обновление урока
router.patch(
  '/:id',
  requireAuth,
  requireRole('TEACHER', 'ADMIN'),
  lessonController.updateLesson
)

// Удаление урока
router.delete(
  '/:id',
  requireAuth,
  requireRole('TEACHER', 'ADMIN'),
  lessonController.deleteLesson
)

// Прогресс
router.post('/progress', requireAuth, lessonController.updateProgress)

export default router
