import { Router } from 'express'
import express from 'express'
import { paymentController } from './payment.controller'
import { requireAuth } from '../../shared/middleware/auth'

const router = Router()

// Создать Stripe Checkout Session для покупки курса
router.post('/checkout-session', requireAuth, paymentController.createCheckoutSession)

// Подтвердить оплату вручную с фронтенда (fallback, если webhook не сработал)
router.post('/confirm', requireAuth, paymentController.confirmPayment)

// Отдельный роутер для Stripe webhook с raw body
const webhookRouter = Router()

webhookRouter.post(
  '/stripe/webhook',
  express.raw({ type: 'application/json' }),
  paymentController.handleStripeWebhook
)

export default router
export { webhookRouter as paymentWebhookRouter }

