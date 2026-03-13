import { Router } from 'express'
import { requireAuth } from '../../shared/middleware/auth'
import { chatController } from './chat.controller'

const router = Router()

router.use(requireAuth)

router.get('/unread-count', (req, res) => chatController.getUnreadCount(req, res))
router.get('/my', (req, res) => chatController.getMyThreads(req, res))
router.get('/:id/messages', (req, res) => chatController.getThreadMessages(req, res))
router.post('/:id/messages', (req, res) => chatController.sendMessage(req, res))
router.post('/:id/read', (req, res) => chatController.markAsRead(req, res))
router.post('/support/ensure', (req, res) => chatController.ensureSupportThread(req, res))
router.post('/course/ensure', (req, res) => chatController.ensureCourseThread(req, res))

export default router

