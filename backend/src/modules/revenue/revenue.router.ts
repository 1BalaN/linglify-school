import { Router } from 'express'
import { revenueController } from './revenue.controller'
import { requireAuth, requireRole } from '../../shared/middleware/auth'

const router = Router()

router.use(requireAuth)

// Teacher
router.get('/teacher/earnings', requireRole('TEACHER'), revenueController.getTeacherEarnings)
router.post('/teacher/payouts', requireRole('TEACHER'), revenueController.createPayoutRequest)

// Admin
router.get('/admin', requireRole('ADMIN'), revenueController.getAdminRevenue)
router.patch('/admin/payouts/:id', requireRole('ADMIN'), revenueController.updatePayoutStatus)

export default router
