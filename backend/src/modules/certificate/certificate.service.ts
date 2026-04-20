import { prisma } from '../../shared/lib/prisma'
import { AppError } from '../../shared/middleware/errorHandler'
import { tokenService } from '../../shared/lib/token'
import { emailService } from '../../shared/lib/email'
import { config } from '../../config/env'
import { chatService } from '../chat/chat.service'

class CertificateService {
  /**
   * Check whether the student is eligible for a certificate.
   *
   * Certificate policy is now per-course:
   *   - course.requireFinalTestForCertificate  — must pass the final-test lesson
   *   - course.minProgressForCertificate       — overall progress threshold (0-100)
   *
   * Since the certificate PDF always prints the final-test score, we try to
   * look up the score even when the test is not *required* — so the PDF value
   * is never unexpectedly empty when the student did take the test.
   */
  private async ensureEligibility(userId: string, courseId: string) {
    const enrollment = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId } },
      include: {
        course: {
          select: {
            requireFinalTestForCertificate: true,
            minProgressForCertificate: true,
          },
        },
      },
    })

    if (!enrollment) {
      throw new AppError(403, 'NOT_ENROLLED', 'Необходимо быть записанным на курс')
    }

    const { requireFinalTestForCertificate, minProgressForCertificate } = enrollment.course

    if (enrollment.progress < minProgressForCertificate) {
      throw new AppError(400, 'COURSE_NOT_COMPLETED', 'Курс ещё не завершён')
    }

    // Look for the final-test lesson regardless of policy (we want the score for the PDF)
    const finalTestLesson = await prisma.lesson.findFirst({
      where: { courseId, isFinalTest: true },
      select: { id: true, title: true },
    })

    // Policy: final test is required but not configured → block
    if (requireFinalTestForCertificate && !finalTestLesson) {
      throw new AppError(
        400,
        'FINAL_TEST_NOT_CONFIGURED',
        'Для этого курса не настроен финальный тест',
      )
    }

    let finalTestProgress: { score: number | null; isCompleted: boolean } | null = null

    if (finalTestLesson) {
      finalTestProgress = await prisma.progress.findUnique({
        where: { userId_lessonId: { userId, lessonId: finalTestLesson.id } },
      })

      // Policy: final test is required but not passed → block
      if (requireFinalTestForCertificate && (!finalTestProgress || !finalTestProgress.isCompleted)) {
        throw new AppError(400, 'FINAL_TEST_NOT_PASSED', 'Финальный тест курса ещё не пройден')
      }
    }

    return { enrollment, finalTestLesson, finalTestProgress }
  }

  private calculateCompletionTimeInDays(
    startedAt: Date | null,
    completedAt: Date | null
  ): number | null {
    if (!startedAt || !completedAt) {
      return null
    }

    const msPerDay = 1000 * 60 * 60 * 24
    const diff = completedAt.getTime() - startedAt.getTime()

    if (diff <= 0) {
      return 1
    }

    return Math.max(1, Math.round(diff / msPerDay))
  }

  async issueCertificate(userId: string, courseId: string) {
    const existing = await prisma.certificate.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
      include: {
        course: true,
        user: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    })

    if (existing) {
      return existing
    }

    const { enrollment, finalTestProgress } = await this.ensureEligibility(userId, courseId)

    const completionTime = this.calculateCompletionTimeInDays(
      enrollment.startedAt,
      enrollment.completedAt
    )

    const certificateCode = tokenService.generateToken(8)

    const certificate = await prisma.certificate.create({
      data: {
        userId,
        courseId,
        certificateCode,
        finalScore: finalTestProgress?.score ?? null,
        completionTime,
      },
      include: {
        course: true,
        user: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    })

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        email: true,
        firstName: true,
      },
    })

    if (user?.email) {
      const certificateUrl = `${config.frontendUrl}/certificates/${certificate.certificateCode}`
      await emailService.sendCertificateEmail(user.email, {
        courseTitle: certificate.course.title,
        certificateUrl,
        verificationCode: certificate.certificateCode,
        firstName: user.firstName ?? '',
      })
    }

    // Системное сообщение в чат курса о выдаче сертификата
    await chatService.createSystemMessageForCertificateIssued(userId, courseId, certificate.certificateCode)

    return certificate
  }

  async maybeIssueCertificate(userId: string, courseId: string) {
    try {
      await this.issueCertificate(userId, courseId)
    } catch (error) {
      if (error instanceof AppError) {
        const nonBlockingCodes = new Set([
          'NOT_ENROLLED',
          'COURSE_NOT_COMPLETED',
          'FINAL_TEST_NOT_CONFIGURED',
          'FINAL_TEST_NOT_PASSED',
        ])

        if (nonBlockingCodes.has(error.code)) {
          return null
        }
      }

      throw error
    }

    return null
  }

  async getUserCertificates(userId: string) {
    const certificates = await prisma.certificate.findMany({
      where: { userId },
      include: {
        course: true,
        user: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: {
        issuedAt: 'desc',
      },
    })

    return certificates
  }

  async getUserCertificateForCourse(userId: string, courseId: string) {
    const certificate = await prisma.certificate.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
      include: {
        course: {
          include: {
            teacher: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        user: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    })

    if (!certificate) {
      throw new AppError(404, 'CERTIFICATE_NOT_FOUND', 'Сертификат для этого курса не найден')
    }

    return certificate
  }

  async verifyCertificate(certificateCode: string) {
    const certificate = await prisma.certificate.findUnique({
      where: { certificateCode },
      include: {
        course: {
          include: {
            teacher: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        user: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    })

    if (!certificate) {
      throw new AppError(404, 'CERTIFICATE_NOT_FOUND', 'Сертификат не найден')
    }

    return certificate
  }

  async getCertificateForUserById(userId: string, certificateId: string) {
    const certificate = await prisma.certificate.findUnique({
      where: { id: certificateId },
      include: {
        course: {
          include: {
            teacher: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        user: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    })

    if (!certificate) {
      throw new AppError(404, 'CERTIFICATE_NOT_FOUND', 'Сертификат не найден')
    }

    if (certificate.userId !== userId) {
      throw new AppError(403, 'FORBIDDEN', 'Нет доступа к этому сертификату')
    }

    return certificate
  }
}

export const certificateService = new CertificateService()

