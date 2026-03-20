import type { Request, Response } from 'express'
import { revenueService } from './revenue.service'
import { createPayoutRequestSchema, updatePayoutStatusSchema } from './revenue.schema'

export const revenueController = {
  async getTeacherEarnings(req: Request, res: Response) {
    const data = await revenueService.getTeacherEarnings(req.user!.userId)
    res.json({ data })
  },

  async createPayoutRequest(req: Request, res: Response) {
    const dto = createPayoutRequestSchema.parse(req.body)
    const data = await revenueService.createPayoutRequest(req.user!.userId, dto)
    res.status(201).json({ data })
  },

  async getAdminRevenue(req: Request, res: Response) {
    const data = await revenueService.getAdminRevenue()
    res.json({ data })
  },

  async updatePayoutStatus(req: Request, res: Response) {
    const dto = updatePayoutStatusSchema.parse(req.body)
    const data = await revenueService.updatePayoutStatus(req.user!.userId, req.params.id, dto)
    res.json({ data })
  },
}
