import cron from 'node-cron'
import { prisma } from '../shared/lib/prisma'
import { emailService } from '../shared/lib/email'
import { config } from '../config/env'

/**
 * Send inactivity reminder emails to students who:
 * - have at least one enrollment that is not 100 % complete (progress < 100)
 * - haven't updated any progress record in the last 7 days
 *
 * Runs every day at 09:00.
 */
async function sendInactivityReminders(): Promise<void> {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

  try {
    // Find user IDs who had progress updated within last 7 days (they are "active")
    const activeUserRecords = await prisma.progress.findMany({
      where: { updatedAt: { gte: sevenDaysAgo } },
      select: { userId: true },
      distinct: ['userId'],
    })
    const activeUserIds = activeUserRecords.map(r => r.userId)

    // Find students with incomplete enrollments who are NOT in the active set
    const staleEnrollments = await prisma.enrollment.findMany({
      where: {
        progress: { lt: 100 },
        userId: { notIn: activeUserIds.length > 0 ? activeUserIds : ['__none__'] },
        user: {
          isActive: true,
          role: 'STUDENT',
        },
      },
      select: {
        userId: true,
        course: { select: { title: true } },
        user: { select: { email: true, firstName: true } },
      },
      take: 300,
    })

    if (staleEnrollments.length === 0) return

    // Group by userId — one email per student listing all their stale courses
    const byUser = new Map<
      string,
      { email: string; firstName: string; courses: string[] }
    >()

    for (const enrollment of staleEnrollments) {
      const { userId, user, course } = enrollment
      if (!byUser.has(userId)) {
        byUser.set(userId, {
          email: user.email,
          firstName: user.firstName ?? 'Студент',
          courses: [],
        })
      }
      byUser.get(userId)!.courses.push(course.title)
    }

    for (const [, { email, firstName, courses }] of byUser) {
      const courseList = courses.map(t => `<li>${t}</li>`).join('')

      await emailService.sendEmail({
        to: email,
        subject: 'Вернитесь к обучению — вас ждут курсы на Linglify',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #4F46E5;">Привет, ${firstName}! 👋</h2>
            <p>Вы давно не заходили на платформу. Напоминаем, что у вас есть незавершённые курсы:</p>
            <ul style="padding-left: 20px; line-height: 1.8;">
              ${courseList}
            </ul>
            <p>Продолжите обучение — вы уже вложили время и силы, до цели осталось совсем немного!</p>
            <a href="${config.frontendUrl}/my-courses"
               style="display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white;
                      text-decoration: none; border-radius: 6px; margin: 16px 0;">
              Продолжить обучение
            </a>
            <p style="color: #999; font-size: 12px;">
              Вы получили это письмо, потому что зарегистрированы на Linglify.
            </p>
          </div>
        `,
      })
    }

    console.log(`[cron] Inactivity reminders sent to ${byUser.size} student(s)`)
  } catch (err) {
    console.error('[cron] sendInactivityReminders error:', err instanceof Error ? err.message : err)
  }
}

/**
 * Find enrollments that reached 100 % progress but have no Certificate record
 * and attempt to issue the missing certificates.
 *
 * Handles rare edge cases: Stripe webhook failures, manual DB updates, etc.
 * Runs every day at 02:00.
 */
async function checkMissingCertificates(): Promise<void> {
  try {
    // Enrollments with full progress (100 %) but no matching certificate
    const completedWithoutCert = await prisma.enrollment.findMany({
      where: {
        progress: 100,
        completedAt: { not: null },
        user: {
          certificates: {
            none: { courseId: undefined },
          },
        },
      },
      select: {
        userId: true,
        courseId: true,
      },
      take: 50,
    })

    if (completedWithoutCert.length === 0) return

    // Filter those that truly have no certificate for this specific course
    const withoutCert: Array<{ userId: string; courseId: string }> = []
    for (const e of completedWithoutCert) {
      const cert = await prisma.certificate.findUnique({
        where: { userId_courseId: { userId: e.userId, courseId: e.courseId } },
        select: { id: true },
      })
      if (!cert) {
        withoutCert.push(e)
      }
    }

    if (withoutCert.length === 0) return

    const { certificateService } = await import('../modules/certificate/certificate.service')

    let issued = 0
    for (const enrollment of withoutCert) {
      try {
        await certificateService.maybeIssueCertificate(enrollment.userId, enrollment.courseId)
        issued++
      } catch {
        // Individual failures do not abort the loop
      }
    }

    console.log(`[cron] checkMissingCertificates: issued ${issued}/${withoutCert.length}`)
  } catch (err) {
    console.error('[cron] checkMissingCertificates error:', err instanceof Error ? err.message : err)
  }
}

export function startCronJobs(): void {
  // Daily at 09:00 — inactivity reminder emails
  cron.schedule('0 9 * * *', () => {
    void sendInactivityReminders()
  })

  // Daily at 02:00 — certificate reconciliation
  cron.schedule('0 2 * * *', () => {
    void checkMissingCertificates()
  })

  console.log('⏰ Cron jobs scheduled: inactivity reminders (09:00), certificate reconciliation (02:00)')
}
