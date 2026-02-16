import { Router } from 'express'
import { contactController } from './contact.controller'
import { requireAuth, requireRole } from '../../shared/middleware/auth'
import { authLimiter } from '../../shared/middleware/rateLimit'

const router = Router()

// Public route (with rate limiting)
router.post('/', authLimiter, (req, res) =>
  contactController.sendMessage(req, res)
)

// Admin-only routes
router.get('/', requireAuth, requireRole('ADMIN'), (req, res) =>
  contactController.getAllMessages(req, res)
)

router.patch('/:id/read', requireAuth, requireRole('ADMIN'), (req, res) =>
  contactController.markAsRead(req, res)
)

router.patch('/:id/replied', requireAuth, requireRole('ADMIN'), (req, res) =>
  contactController.markAsReplied(req, res)
)

router.patch('/:id/note', requireAuth, requireRole('ADMIN'), (req, res) =>
  contactController.updateAdminNote(req, res)
)

router.delete('/:id', requireAuth, requireRole('ADMIN'), (req, res) =>
  contactController.deleteMessage(req, res)
)

export default router
