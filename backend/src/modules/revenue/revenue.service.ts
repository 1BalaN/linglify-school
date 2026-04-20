import { prisma } from '../../shared/lib/prisma'
import { AppError } from '../../shared/middleware/errorHandler'
import type { CreatePayoutRequestDto, UpdatePayoutStatusDto } from './revenue.schema'

class RevenueService {
  /** Record a course sale and split revenue 80/20 */
  async recordCourseSale(opts: {
    courseId: string
    teacherId: string
    studentId: string
    amount: number
    currency: string
    stripeSessionId?: string
  }) {
    const platformFee    = Math.round(opts.amount * 0.25)
    const teacherEarning = opts.amount - platformFee

    await prisma.courseRevenue.create({
      data: {
        courseId:       opts.courseId,
        teacherId:      opts.teacherId,
        studentId:      opts.studentId,
        amount:         opts.amount,
        platformFee,
        teacherEarning,
        currency:       opts.currency,
        stripeSessionId: opts.stripeSessionId,
      },
    })
  }

  /** Teacher: get earnings summary + per-course breakdown */
  async getTeacherEarnings(teacherId: string) {
    const revenues = await prisma.courseRevenue.findMany({
      where: { teacherId },
      include: {
        course:  { select: { id: true, title: true, coverImage: true } },
        student: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    const totalEarned = revenues.reduce((s, r) => s + r.teacherEarning, 0)

    // Earnings per course
    const byCourse = new Map<string, { courseId: string; title: string; coverImage: string | null; sales: number; earned: number }>()
    for (const r of revenues) {
      const key = r.courseId
      if (!byCourse.has(key)) {
        byCourse.set(key, { courseId: r.course.id, title: r.course.title, coverImage: r.course.coverImage, sales: 0, earned: 0 })
      }
      const entry = byCourse.get(key)!
      entry.sales++
      entry.earned += r.teacherEarning
    }

    // Payouts
    const payouts = await prisma.payoutRequest.findMany({
      where: { teacherId },
      orderBy: { createdAt: 'desc' },
    })
    const totalPaidOut = payouts
      .filter(p => p.status === 'COMPLETED')
      .reduce((s, p) => s + p.amount, 0)

    const pendingPayout = payouts
      .filter(p => p.status === 'PENDING' || p.status === 'PROCESSING')
      .reduce((s, p) => s + p.amount, 0)

    const availableForPayout = Math.max(0, totalEarned - totalPaidOut - pendingPayout)

    return {
      totalEarned,
      totalPaidOut,
      pendingPayout,
      availableForPayout,
      salesHistory: revenues,
      byCourse: Array.from(byCourse.values()).sort((a, b) => b.earned - a.earned),
      payouts,
    }
  }

  /** Teacher: request a payout */
  async createPayoutRequest(teacherId: string, dto: CreatePayoutRequestDto) {
    const earnings = await this.getTeacherEarnings(teacherId)

    if (dto.amount > earnings.availableForPayout) {
      throw new AppError(
        400,
        'INSUFFICIENT_BALANCE',
        `Недостаточно средств. Доступно: ${earnings.availableForPayout} коп.`
      )
    }

    const payout = await prisma.payoutRequest.create({
      data: {
        teacherId,
        amount: dto.amount,
        currency: 'byn',
        payoutDetails: dto.payoutDetails,
      },
    })

    return payout
  }

  /** Admin: get platform revenue overview */
  async getAdminRevenue() {
    // Subscription plan prices in kopecks
    const PLAN_AMOUNT: Record<string, number> = { MONTHLY: 3000, ANNUAL: 24000 }

    const [revenues, payouts, teacherCount, subscriptions] = await Promise.all([
      prisma.courseRevenue.findMany({
        include: {
          course:  { select: { id: true, title: true } },
          teacher: { select: { id: true, firstName: true, lastName: true, email: true, avatar: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.payoutRequest.findMany({
        include: {
          teacher:     { select: { id: true, firstName: true, lastName: true, email: true } },
          processedBy: { select: { id: true, firstName: true, lastName: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where: { role: 'TEACHER' } }),
      // Count only paid subscriptions (those that went through Stripe checkout)
      prisma.teacherSubscription.findMany({
        where: { stripeSubscriptionId: { not: null } },
        select: { plan: true, status: true, createdAt: true },
      }),
    ])

    const totalRevenue       = revenues.reduce((s, r) => s + r.amount, 0)
    const totalPlatformFee   = revenues.reduce((s, r) => s + r.platformFee, 0)
    const totalTeacherPayout = revenues.reduce((s, r) => s + r.teacherEarning, 0)

    // Subscription revenue: each paid subscription contributes its plan price (minimum 1 payment)
    const subscriptionRevenue = subscriptions.reduce((s, sub) => {
      const amount = sub.plan ? (PLAN_AMOUNT[sub.plan] ?? 0) : 0
      return s + amount
    }, 0)

    const subscriptionByPlan = {
      MONTHLY: subscriptions.filter(s => s.plan === 'MONTHLY').length,
      ANNUAL:  subscriptions.filter(s => s.plan === 'ANNUAL').length,
      total:   subscriptions.length,
    }

    // Per-teacher breakdown
    const byTeacher = new Map<string, {
      teacherId: string; name: string; email: string; avatar: string | null;
      sales: number; totalAmount: number; platformFee: number; teacherEarning: number
    }>()
    for (const r of revenues) {
      const key = r.teacherId
      if (!byTeacher.has(key)) {
        const t = r.teacher
        byTeacher.set(key, {
          teacherId: t.id,
          name: [t.firstName, t.lastName].filter(Boolean).join(' ') || t.email,
          email: t.email,
          avatar: null,
          sales: 0,
          totalAmount: 0,
          platformFee: 0,
          teacherEarning: 0,
        })
      }
      const e = byTeacher.get(key)!
      e.sales++
      e.totalAmount    += r.amount
      e.platformFee    += r.platformFee
      e.teacherEarning += r.teacherEarning
    }

    return {
      summary: {
        totalRevenue,
        totalPlatformFee,
        totalTeacherPayout,
        totalSales: revenues.length,
        teacherCount,
        subscriptionRevenue,
        subscriptionByPlan,
        // True platform income = course commissions + all subscription payments
        totalPlatformIncome: totalPlatformFee + subscriptionRevenue,
      },
      revenueHistory: revenues,
      byTeacher: Array.from(byTeacher.values()).sort((a, b) => b.totalAmount - a.totalAmount),
      payouts,
    }
  }

  /** Admin: update a payout request status */
  async updatePayoutStatus(adminId: string, payoutId: string, dto: UpdatePayoutStatusDto) {
    const payout = await prisma.payoutRequest.findUnique({ where: { id: payoutId } })
    if (!payout) throw new AppError(404, 'PAYOUT_NOT_FOUND', 'Заявка на выплату не найдена')

    return prisma.payoutRequest.update({
      where: { id: payoutId },
      data: {
        status:        dto.status,
        adminNote:     dto.adminNote,
        processedAt:   new Date(),
        processedById: adminId,
      },
    })
  }
}

export const revenueService = new RevenueService()
