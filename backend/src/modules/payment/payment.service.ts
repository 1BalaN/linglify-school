import type Stripe from 'stripe'
import { stripe } from '../../shared/lib/stripe'
import { AppError } from '../../shared/middleware/errorHandler'
import { prisma } from '../../shared/lib/prisma'
import { config } from '../../config/env'
import type { CreateCheckoutSessionDto, ConfirmPaymentDto } from './payment.schema'
import { courseService } from '../course/course.service'

class PaymentService {
  private getStripeClient(): Stripe {
    if (!stripe) {
      throw new AppError(
        500,
        'STRIPE_NOT_CONFIGURED',
        'Платёжный провайдер Stripe не настроен'
      )
    }
    return stripe
  }

  async createCheckoutSession(userId: string, dto: CreateCheckoutSessionDto) {
    const course = await prisma.course.findUnique({
      where: { id: dto.courseId },
      select: {
        id: true,
        title: true,
        price: true,
        currency: true,
        isPublished: true,
      },
    })

    if (!course) {
      throw new AppError(404, 'COURSE_NOT_FOUND', 'Курс не найден')
    }

    if (!course.isPublished) {
      throw new AppError(403, 'COURSE_NOT_PUBLISHED', 'Курс не опубликован')
    }

    if (course.price <= 0) {
      throw new AppError(
        400,
        'COURSE_IS_FREE',
        'Этот курс бесплатный. Запишитесь на курс без оплаты.'
      )
    }

    const existingEnrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId: dto.courseId,
        },
      },
    })

    if (existingEnrollment) {
      throw new AppError(400, 'ALREADY_ENROLLED', 'Вы уже зачислены на этот курс')
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        email: true,
        firstName: true,
        lastName: true,
      },
    })

    const stripeClient = this.getStripeClient()

    const session = await stripeClient.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: course.currency.toLowerCase(),
            product_data: {
              name: course.title,
            },
            unit_amount: course.price,
          },
          quantity: 1,
        },
      ],
      customer_email: user?.email || undefined,
      success_url: `${config.frontendUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}&courseId=${course.id}`,
      cancel_url: `${config.frontendUrl}/payment/cancel?courseId=${course.id}`,
      metadata: {
        userId,
        courseId: course.id,
      },
    })

    return {
      sessionId: session.id,
      url: session.url,
    }
  }

  async confirmPayment(userId: string, dto: ConfirmPaymentDto) {
    const stripeClient = this.getStripeClient()

    const session = await stripeClient.checkout.sessions.retrieve(dto.sessionId, {
      expand: ['payment_intent'],
    })

    if (!session.metadata?.courseId || !session.metadata.userId) {
      throw new AppError(
        400,
        'INVALID_SESSION_METADATA',
        'Некорректные данные платежной сессии'
      )
    }

    const courseId = session.metadata.courseId
    const sessionUserId = session.metadata.userId

    if (sessionUserId !== userId) {
      throw new AppError(403, 'FORBIDDEN', 'Эта сессия оплаты принадлежит другому пользователю')
    }

    // Проверяем статус оплаты
    if (session.payment_status !== 'paid' && session.status !== 'complete') {
      throw new AppError(
        400,
        'PAYMENT_NOT_COMPLETED',
        'Платёж по этой сессии ещё не завершён'
      )
    }

    // Пытаемся зачислить (идемпотентно)
    try {
      await courseService.enrollCourse(userId, { courseId }, { allowPaid: true })
    } catch (error) {
      if (error instanceof AppError && error.code === 'ALREADY_ENROLLED') {
        // уже зачислен — это нормально
      } else {
        throw error
      }
    }

    return { courseId }
  }

  async handleStripeWebhook(rawBody: Buffer, signature: string | string[] | undefined) {
    const stripeClient = this.getStripeClient()
    const webhookSecret = config.stripe.webhookSecret

    if (!webhookSecret) {
      throw new AppError(
        500,
        'STRIPE_WEBHOOK_NOT_CONFIGURED',
        'Webhook Stripe не настроен на сервере'
      )
    }

    let event: Stripe.Event

    try {
      event = stripeClient.webhooks.constructEvent(
        rawBody,
        Array.isArray(signature) ? signature[0] : signature || '',
        webhookSecret
      )
    } catch (err) {
      throw new AppError(400, 'STRIPE_SIGNATURE_VERIFICATION_FAILED', 'Некорректная подпись Stripe')
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session
      const userId = session.metadata?.userId
      const courseId = session.metadata?.courseId

      if (!userId || !courseId) {
        return { handled: false }
      }

      // Зачисляем пользователя на курс, если он ещё не зачислен
      try {
        await courseService.enrollCourse(userId, { courseId }, { allowPaid: true })
      } catch (error) {
        // Игнорируем ошибку ALREADY_ENROLLED, остальные логируем
        if (
          error instanceof AppError &&
          (error.code === 'ALREADY_ENROLLED' || error.code === 'COURSE_NOT_PUBLISHED')
        ) {
          return { handled: true }
        }
        // eslint-disable-next-line no-console
        console.error('Stripe webhook enroll error:', error)
      }

      return { handled: true }
    }

    return { handled: false }
  }
}

export const paymentService = new PaymentService()

