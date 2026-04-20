import { SubscriptionStatus } from '@prisma/client'
import { prisma } from '../../shared/lib/prisma'
import { stripe } from '../../shared/lib/stripe'
import { AppError } from '../../shared/middleware/errorHandler'
import { config } from '../../config/env'
import type { CreateSubscriptionCheckoutDto } from './subscription.schema'

// Prices in kopecks (1 BYN = 100 kopecks)
const PLAN_PRICES = {
  MONTHLY: { amount: 3000, interval: 'month' as const, label: 'Месяц' },
  ANNUAL:  { amount: 24000, interval: 'year'  as const, label: 'Год'  },
}

class SubscriptionService {
  /** Check if a teacher has an active (TRIAL or ACTIVE) subscription */
  async isSubscriptionActive(userId: string): Promise<boolean> {
    const sub = await prisma.teacherSubscription.findUnique({
      where: { userId },
      select: { status: true, trialEndsAt: true, currentPeriodEnd: true },
    })
    if (!sub) return false
    if (sub.status === SubscriptionStatus.ACTIVE) return true
    if (sub.status === SubscriptionStatus.TRIAL && sub.trialEndsAt && sub.trialEndsAt > new Date()) return true
    return false
  }

  async getMySubscription(userId: string) {
    const sub = await prisma.teacherSubscription.findUnique({
      where: { userId },
    })
    if (!sub) return null

    // Expire a stale TRIAL
    if (sub.status === SubscriptionStatus.TRIAL && sub.trialEndsAt && sub.trialEndsAt <= new Date()) {
      return prisma.teacherSubscription.update({
        where: { userId },
        data: { status: SubscriptionStatus.EXPIRED },
      })
    }

    return sub
  }

  async createCheckoutSession(userId: string, dto: CreateSubscriptionCheckoutDto) {
    if (!stripe) throw new AppError(500, 'STRIPE_NOT_CONFIGURED', 'Stripe не настроен')

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, firstName: true, lastName: true },
    })
    if (!user) throw new AppError(404, 'USER_NOT_FOUND', 'Пользователь не найден')

    // Ensure or create Stripe customer
    let sub = await prisma.teacherSubscription.findUnique({ where: { userId } })
    if (!sub) {
      sub = await prisma.teacherSubscription.create({
        data: { userId, status: SubscriptionStatus.TRIAL, trialEndsAt: new Date() },
      })
    }

    let customerId = sub.stripeCustomerId
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: [user.firstName, user.lastName].filter(Boolean).join(' ') || undefined,
        metadata: { userId },
      })
      customerId = customer.id
      await prisma.teacherSubscription.update({ where: { userId }, data: { stripeCustomerId: customerId } })
    }

    const price = PLAN_PRICES[dto.plan]

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'byn',
            product_data: {
              name: `Подписка Linglify — ${price.label}`,
              description: 'Публикация курсов, аналитика, поддержка студентов',
            },
            unit_amount: price.amount,
            recurring: { interval: price.interval },
          },
          quantity: 1,
        },
      ],
      success_url: `${config.frontendUrl}/profile?tab=subscription&success=true`,
      cancel_url:  `${config.frontendUrl}/profile?tab=subscription&cancelled=true`,
      metadata: { userId, plan: dto.plan },
    })

    return { sessionId: session.id, url: session.url }
  }

  async cancelSubscription(userId: string) {
    if (!stripe) throw new AppError(500, 'STRIPE_NOT_CONFIGURED', 'Stripe не настроен')

    const sub = await prisma.teacherSubscription.findUnique({ where: { userId } })
    if (!sub?.stripeSubscriptionId) throw new AppError(400, 'NO_ACTIVE_SUBSCRIPTION', 'Нет активной подписки')

    await stripe.subscriptions.update(sub.stripeSubscriptionId, { cancel_at_period_end: true })

    return { message: 'Подписка будет отменена в конце текущего периода' }
  }

  /** Called from Stripe webhook when checkout.session.completed (subscription mode) */
  async handleSubscriptionCreated(sessionId: string) {
    if (!stripe) return

    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['subscription'],
    })

    const userId = session.metadata?.userId
    const plan = session.metadata?.plan as 'MONTHLY' | 'ANNUAL' | undefined
    if (!userId || !plan || !session.subscription) return

    const stripeSub = typeof session.subscription === 'string'
      ? await stripe.subscriptions.retrieve(session.subscription)
      : session.subscription

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const subAny = stripeSub as any
    const toDate = (ts: unknown): Date | undefined => {
      const n = typeof ts === 'number' ? ts : Number(ts)
      return !isNaN(n) && n > 0 ? new Date(n * 1000) : undefined
    }
    const periodStart = toDate(subAny.current_period_start)
    const periodEnd   = toDate(subAny.current_period_end)

    await prisma.teacherSubscription.update({
      where: { userId },
      data: {
        status: SubscriptionStatus.ACTIVE,
        plan,
        stripeSubscriptionId: stripeSub.id,
        ...(periodStart !== undefined ? { currentPeriodStart: periodStart } : {}),
        ...(periodEnd   !== undefined ? { currentPeriodEnd:   periodEnd   } : {}),
      },
    })
  }

  /** Called from Stripe webhook for customer.subscription.updated */
  async handleSubscriptionUpdated(stripeSubId: string, status: string, periodEnd: number) {
    const sub = await prisma.teacherSubscription.findFirst({
      where: { stripeSubscriptionId: stripeSubId },
    })
    if (!sub) return

    const newStatus =
      status === 'active' ? SubscriptionStatus.ACTIVE
      : status === 'canceled' ? SubscriptionStatus.CANCELLED
      : status === 'past_due' || status === 'unpaid' ? SubscriptionStatus.EXPIRED
      : undefined

    if (!newStatus) return

    const toDate = (ts: unknown): Date | undefined => {
      const n = typeof ts === 'number' ? ts : Number(ts)
      return !isNaN(n) && n > 0 ? new Date(n * 1000) : undefined
    }
    const periodEndDate = toDate(periodEnd)

    await prisma.teacherSubscription.update({
      where: { id: sub.id },
      data: {
        status: newStatus,
        ...(periodEndDate !== undefined ? { currentPeriodEnd: periodEndDate } : {}),
      },
    })
  }

  /** Called from Stripe webhook for customer.subscription.deleted */
  async handleSubscriptionDeleted(stripeSubId: string) {
    const sub = await prisma.teacherSubscription.findFirst({
      where: { stripeSubscriptionId: stripeSubId },
    })
    if (!sub) return
    await prisma.teacherSubscription.update({
      where: { id: sub.id },
      data: { status: SubscriptionStatus.CANCELLED },
    })
  }

  /**
   * Pull the latest subscription state directly from Stripe and persist it.
   * Called after a successful Stripe Checkout redirect to handle the case
   * where the webhook hasn't arrived yet.
   */
  async syncFromStripe(userId: string): Promise<void> {
    if (!stripe) return

    const sub = await prisma.teacherSubscription.findUnique({ where: { userId } })
    if (!sub?.stripeCustomerId) return

    // Retrieve the most recent Stripe subscription for this customer
    const stripeSubs = await stripe.subscriptions.list({
      customer: sub.stripeCustomerId,
      limit: 1,
      status: 'all',
      expand: ['data.items'],
    })

    const latest = stripeSubs.data[0]
    if (!latest) return

    const newStatus =
      latest.status === 'active'    ? SubscriptionStatus.ACTIVE
      : latest.status === 'trialing' ? SubscriptionStatus.TRIAL
      : latest.status === 'canceled' ? SubscriptionStatus.CANCELLED
      : latest.status === 'past_due' || latest.status === 'unpaid' ? SubscriptionStatus.EXPIRED
      : undefined

    if (!newStatus) return

    // Detect plan from interval
    const interval = latest.items?.data?.[0]?.price?.recurring?.interval
    const plan = interval === 'year' ? 'ANNUAL' : 'MONTHLY'

    // Safely parse Unix timestamps — they may be null/undefined in test mode
    const toDate = (ts: unknown): Date | undefined => {
      const n = typeof ts === 'number' ? ts : Number(ts)
      return !isNaN(n) && n > 0 ? new Date(n * 1000) : undefined
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const latestAny = latest as any
    const periodStart = toDate(latestAny.current_period_start)
    const periodEnd   = toDate(latestAny.current_period_end)

    await prisma.teacherSubscription.update({
      where: { userId },
      data: {
        status: newStatus,
        plan,
        stripeSubscriptionId: latest.id,
        ...(periodStart !== undefined ? { currentPeriodStart: periodStart } : {}),
        ...(periodEnd   !== undefined ? { currentPeriodEnd:   periodEnd   } : {}),
      },
    })
  }

  static getPlanPrices() {
    return {
      MONTHLY: { amount: PLAN_PRICES.MONTHLY.amount, currency: 'rub', label: 'Месяц', description: '990 ₽ / месяц' },
      ANNUAL:  { amount: PLAN_PRICES.ANNUAL.amount,  currency: 'rub', label: 'Год',   description: '7 900 ₽ / год' },
    }
  }
}

export const subscriptionService = new SubscriptionService()
