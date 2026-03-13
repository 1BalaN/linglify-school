import type { Response } from 'express'
import type { AuthRequest } from '../../shared/middleware/auth'
import { chatService } from './chat.service'
import { createMessageSchema, getThreadMessagesQuerySchema } from './chat.schema'

export class ChatController {
  async getUnreadCount(req: AuthRequest, res: Response) {
    const userId = req.user!.userId
    const role = req.user!.role
    const result = await chatService.getUnreadCount(userId, role)
    res.json(result)
  }

  async getMyThreads(req: AuthRequest, res: Response) {
    const userId = req.user!.userId
    const role = req.user!.role

    const result = await chatService.getMyThreads(userId, role)
    res.json(result)
  }

  async getThreadMessages(req: AuthRequest, res: Response) {
    const { id } = req.params
    const query = getThreadMessagesQuerySchema.parse(req.query)

    const result = await chatService.getThreadMessages(id, query.limit, query.cursor)
    res.json(result)
  }

  async sendMessage(req: AuthRequest, res: Response) {
    const { id } = req.params
    const dto = createMessageSchema.parse(req.body)

    const result = await chatService.sendMessage(id, req.user!.userId, dto)
    res.status(201).json(result)
  }

  async markAsRead(req: AuthRequest, res: Response) {
    const { id } = req.params
    const userId = req.user!.userId

    const result = await chatService.markThreadAsRead(id, userId)
    res.json(result)
  }

  async ensureSupportThread(req: AuthRequest, res: Response) {
    const userId = req.user!.userId
    const thread = await chatService.ensureSupportThread(userId)
    res.status(201).json({ data: thread })
  }

  async ensureCourseThread(req: AuthRequest, res: Response) {
    const userId = req.user!.userId
    const { courseId } = req.body as { courseId?: string }

    if (!courseId) {
      throw new Error('courseId is required')
    }

    const thread = await chatService.ensureCourseDmThread(userId, courseId)
    res.status(201).json({ data: thread })
  }
}

export const chatController = new ChatController()

