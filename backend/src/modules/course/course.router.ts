import { Router } from 'express'
import { courseController } from './course.controller'
import { requireAuth, requireRole } from '../../shared/middleware/auth'
import { optionalAuth } from '../../shared/middleware/auth'

const router = Router()

// Публичные маршруты (с опциональной аутентификацией)
router.get('/', optionalAuth, courseController.getCourses)
router.get('/:id', optionalAuth, courseController.getCourseById)

// Уроки курса (импортируем из lesson controller)
import { lessonController } from '../lesson/lesson.controller'
router.get('/:courseId/lessons', optionalAuth, lessonController.getCourseLessons)
router.get('/:courseId/progress', requireAuth, courseController.getCourseProgress)

// Защищенные маршруты (требуется авторизация)
router.post(
  '/',
  requireAuth,
  requireRole('TEACHER', 'ADMIN'),
  courseController.createCourse
)

router.patch(
  '/:id',
  requireAuth,
  requireRole('TEACHER', 'ADMIN'),
  courseController.updateCourse
)

router.patch(
  '/:id/status',
  requireAuth,
  requireRole('TEACHER', 'ADMIN'),
  courseController.updateCourseStatus
)

router.patch(
  '/:id/publish',
  requireAuth,
  requireRole('TEACHER', 'ADMIN'),
  courseController.publishCourse
)

router.delete(
  '/:id',
  requireAuth,
  requireRole('TEACHER', 'ADMIN'),
  courseController.deleteCourse
)

router.post('/:id/enroll', requireAuth, courseController.enrollCourse)

router.get('/my/enrolled', requireAuth, courseController.getUserCourses)

router.get(
  '/:id/students',
  requireAuth,
  requireRole('TEACHER', 'ADMIN'),
  courseController.getCourseStudents
)

// Отзывы
router.post('/:id/reviews', requireAuth, courseController.createReview)

router.patch('/reviews/:id', requireAuth, courseController.updateReview)

router.delete('/reviews/:id', requireAuth, courseController.deleteReview)

export default router
