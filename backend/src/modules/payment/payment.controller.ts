import type { Request, Response } from 'express'
import type { AuthRequest } from '../../shared/middleware/auth'
import { paymentService } from './payment.service'
import { createCheckoutSessionSchema, confirmPaymentSchema } from './payment.schema'

class PaymentController {
  async createCheckoutSession(req: AuthRequest, res: Response) {
    const dto = createCheckoutSessionSchema.parse(req.body)

    const session = await paymentService.createCheckoutSession(req.user!.userId, dto)

    res.status(201).json({ data: session })
  }

  async confirmPayment(req: AuthRequest, res: Response) {
    const dto = confirmPaymentSchema.parse(req.body)

    const result = await paymentService.confirmPayment(req.user!.userId, dto)

    res.status(200).json({ data: result })
  }

  async handleStripeWebhook(req: Request, res: Response) {
    const signature = req.headers['stripe-signature']
    const rawBody = req.body as Buffer

    await paymentService.handleStripeWebhook(rawBody, signature)

    // Stripe ожидает 2xx, без тела
    res.status(200).end()
  }
}

export const paymentController = new PaymentController()

