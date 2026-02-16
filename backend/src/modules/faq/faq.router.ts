import { Router } from 'express'
import { faqController } from './faq.controller'
import { requireAuth, requireRole } from '../../shared/middleware/auth'

const router = Router()

// Public routes
router.get('/', (req, res) => faqController.getAllFAQs(req, res))
router.get('/:id', (req, res) => faqController.getFAQById(req, res))

// Admin-only routes
router.post('/', requireAuth, requireRole('ADMIN'), (req, res) =>
  faqController.createFAQ(req, res)
)

router.patch('/:id', requireAuth, requireRole('ADMIN'), (req, res) =>
  faqController.updateFAQ(req, res)
)

router.delete('/:id', requireAuth, requireRole('ADMIN'), (req, res) =>
  faqController.deleteFAQ(req, res)
)

router.post('/reorder', requireAuth, requireRole('ADMIN'), (req, res) =>
  faqController.reorderFAQs(req, res)
)

export default router
