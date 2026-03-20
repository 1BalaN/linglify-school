import { Router } from 'express'
import { analyticsController } from './analytics.controller'
import { requireAuth, requireRole } from '../../shared/middleware/auth'

const router = Router()

router.get(
  '/admin/overview',
  requireAuth,
  requireRole('ADMIN'),
  analyticsController.getAdminOverview.bind(analyticsController)
)

router.get(
  '/admin/timeseries',
  requireAuth,
  requireRole('ADMIN'),
  analyticsController.getAdminTimeseries.bind(analyticsController)
)

router.get(
  '/teacher/course/:courseId',
  requireAuth,
  requireRole('TEACHER', 'ADMIN'),
  analyticsController.getTeacherCourseAnalytics.bind(analyticsController)
)

router.get(
  '/teacher/course/:courseId/timeseries',
  requireAuth,
  requireRole('TEACHER', 'ADMIN'),
  analyticsController.getTeacherCourseTimeseries.bind(analyticsController)
)

// Student efficiency scores
router.get(
  '/teacher/course/:courseId/student-scores',
  requireAuth,
  requireRole('TEACHER', 'ADMIN'),
  analyticsController.getCourseStudentScores.bind(analyticsController)
)

router.get(
  '/course/:courseId/my-score',
  requireAuth,
  analyticsController.getMyEfficiencyScore.bind(analyticsController)
)

export default router

