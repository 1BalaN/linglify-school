import { Router } from 'express'
import { requireAuth, requireRole } from '../../shared/middleware/auth'
import { platformSettingsController } from './platformSettings.controller'

const router = Router()

router.get(
  '/platform',
  requireAuth,
  requireRole('ADMIN'),
  platformSettingsController.get.bind(platformSettingsController)
)

router.patch(
  '/platform',
  requireAuth,
  requireRole('ADMIN'),
  platformSettingsController.update.bind(platformSettingsController)
)

export default router

