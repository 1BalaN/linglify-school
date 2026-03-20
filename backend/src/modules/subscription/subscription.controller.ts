import type { Request, Response } from 'express'
import { subscriptionService } from './subscription.service'
import { createSubscriptionCheckoutSchema } from './subscription.schema'

export const subscriptionController = {
  async getMySubscription(req: Request, res: Response) {
    const sub = await subscriptionService.getMySubscription(req.user!.userId)
    res.json({ data: sub })
  },

  async getPlans(_req: Request, res: Response) {
    res.json({
      data: {
        MONTHLY: { amount: 3000, currency: 'byn', label: 'Месяц', description: '30 р. / месяц' },
        ANNUAL:  { amount: 24000, currency: 'byn', label: 'Год',   description: '240 р. / год', savings: '33%' },
      },
    })
  },

  async createCheckoutSession(req: Request, res: Response) {
    const dto = createSubscriptionCheckoutSchema.parse(req.body)
    const result = await subscriptionService.createCheckoutSession(req.user!.userId, dto)
    res.json({ data: result })
  },

  async cancelSubscription(req: Request, res: Response) {
    const result = await subscriptionService.cancelSubscription(req.user!.userId)
    res.json({ data: result })
  },

  async syncSubscription(req: Request, res: Response) {
    await subscriptionService.syncFromStripe(req.user!.userId)
    const sub = await subscriptionService.getMySubscription(req.user!.userId)
    res.json({ data: sub })
  },
}
