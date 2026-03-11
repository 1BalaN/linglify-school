import { Router } from 'express'
import { requireAuth, requireRole } from '../../shared/middleware/auth'
import { userController } from './user.controller'

const router = Router()

router.get(
  '/',
  requireAuth,
  requireRole('ADMIN'),
  userController.list.bind(userController)
)

router.get(
  '/:id/overview',
  requireAuth,
  requireRole('ADMIN'),
  userController.overview.bind(userController)
)

router.patch(
  '/:id/role',
  requireAuth,
  requireRole('ADMIN'),
  userController.updateRole.bind(userController)
)

router.patch(
  '/:id/status',
  requireAuth,
  requireRole('ADMIN'),
  userController.updateStatus.bind(userController)
)

router.delete(
  '/:id',
  requireAuth,
  requireRole('ADMIN'),
  userController.delete.bind(userController)
)

export default router

