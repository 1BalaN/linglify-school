import { Router } from 'express'
import { subscriptionController } from './subscription.controller'
import { requireAuth, requireRole } from '../../shared/middleware/auth'

const router = Router()

router.get('/plans', (_req, res) => {
  res.json({
    data: {
      MONTHLY: { amount: 3000, currency: 'byn', label: 'Месяц', description: '30 р. / месяц' },
      ANNUAL:  { amount: 24000, currency: 'byn', label: 'Год',   description: '240 р. / год', savings: '33%' },
    },
  })
})

router.use(requireAuth)
router.get('/me',       requireRole('TEACHER'), subscriptionController.getMySubscription)
router.post('/checkout', requireRole('TEACHER'), subscriptionController.createCheckoutSession)
router.post('/cancel',   requireRole('TEACHER'), subscriptionController.cancelSubscription)
router.post('/sync',     requireRole('TEACHER'), subscriptionController.syncSubscription)

export default router
