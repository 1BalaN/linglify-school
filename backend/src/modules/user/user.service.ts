import { UserRole } from '@prisma/client'
import { prisma } from '../../shared/lib/prisma'
import type { GetUsersQuery } from './user.schema'
import { AppError } from '../../shared/middleware/errorHandler'

const NEW_DAYS = 7
const ACTIVE_DAYS = 14
const RISK_DAYS = 14

export class UserService {
  async getUsers(query: GetUsersQuery) {
    const { page, limit, role, isActive, search, createdFrom, createdTo, segment } = query
    const skip = (page - 1) * limit

    const where: Record<string, unknown> = {}

    if (role) {
      where.role = role
    }

    if (typeof isActive === 'boolean') {
      where.isActive = isActive
    }

    if (createdFrom || createdTo) {
      where.createdAt = {
        ...(createdFrom && { gte: createdFrom }),
        ...(createdTo && { lte: createdTo }),
      }
    }

    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
      ]
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: {
              enrollments: true,
              certificates: true,
              placementSessions: {
                where: { status: 'COMPLETED' },
              },
            },
          },
        },
      }),
      prisma.user.count({ where }),
    ])

    const now = new Date()
    const msPerDay = 24 * 60 * 60 * 1000

    const segmented = users.map(user => {
      const daysSinceRegistration = Math.floor(
        (now.getTime() - user.createdAt.getTime()) / msPerDay
      )

      return {
        ...user,
        meta: {
          daysSinceRegistration,
        },
      }
    })

    const userIds = users.map(u => u.id)

    const [lastProgressByUser, lastEnrollmentByUser] = await Promise.all([
      prisma.progress.groupBy({
        by: ['userId'],
        where: {
          userId: { in: userIds },
        },
        _max: {
          updatedAt: true,
        },
      }),
      prisma.enrollment.groupBy({
        by: ['userId'],
        where: {
          userId: { in: userIds },
        },
        _max: {
          updatedAt: true,
        },
      }),
    ])

    const lastActivityMap = new Map<string, Date>()

    for (const row of lastProgressByUser) {
      if (row._max.updatedAt) {
        lastActivityMap.set(row.userId, row._max.updatedAt)
      }
    }

    for (const row of lastEnrollmentByUser) {
      if (row._max.updatedAt) {
        const existing = lastActivityMap.get(row.userId)
        if (!existing || row._max.updatedAt > existing) {
          lastActivityMap.set(row.userId, row._max.updatedAt)
        }
      }
    }

    const usersWithSegments = segmented.map(user => {
      const lastActivity = lastActivityMap.get(user.id) ?? null
      const daysSinceActivity = lastActivity
        ? Math.floor((now.getTime() - lastActivity.getTime()) / msPerDay)
        : null

      const enrollmentsCount = user._count.enrollments
      const certificatesCount = user._count.certificates

      let inferredSegment: 'NEW' | 'ACTIVE' | 'RISK' | 'GRAD' | null = null

      if (user.role === UserRole.STUDENT) {
        if (user.meta.daysSinceRegistration < NEW_DAYS && enrollmentsCount === 0) {
          inferredSegment = 'NEW'
        } else if (
          daysSinceActivity !== null &&
          daysSinceActivity <= ACTIVE_DAYS &&
          enrollmentsCount > 0
        ) {
          inferredSegment = 'ACTIVE'
        } else if (
          daysSinceActivity !== null &&
          daysSinceActivity > RISK_DAYS &&
          enrollmentsCount > 0 &&
          certificatesCount === 0
        ) {
          inferredSegment = 'RISK'
        } else if (certificatesCount > 0) {
          inferredSegment = 'GRAD'
        }
      }

      return {
        ...user,
        lastActivity,
        segment: inferredSegment,
      }
    })

    const filteredBySegment = segment
      ? usersWithSegments.filter(u => u.segment === segment)
      : usersWithSegments

    return {
      data: filteredBySegment,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }
  }

  async updateUserRole(id: string, role: UserRole) {
    const user = await prisma.user.findUnique({ where: { id } })
    if (!user) {
      throw new AppError(404, 'USER_NOT_FOUND', 'Пользователь не найден')
    }

    const updated = await prisma.user.update({
      where: { id },
      data: {
        role,
      },
    })

    return updated
  }

  async updateUserStatus(id: string, isActive: boolean, reason?: string | null) {
    const user = await prisma.user.findUnique({ where: { id } })
    if (!user) {
      throw new AppError(404, 'USER_NOT_FOUND', 'Пользователь не найден')
    }

    // prisma types могут отставать от актуальной схемы до генерации клиента,
    // поэтому используем промежуточный объект с приведением типа
    const data: Record<string, unknown> = {
      isActive,
      deactivationReason: isActive ? null : (reason && reason.trim().length > 0 ? reason.trim() : null),
    }

    const updated = await prisma.user.update({
      where: { id },
      data,
    })

    return updated
  }

  async deleteUser(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, role: true },
    })
    if (!user) {
      throw new AppError(404, 'USER_NOT_FOUND', 'Пользователь не найден')
    }

    // Если удаляем преподавателя, заранее переназначаем его курсы на первого администратора
    if (user.role === UserRole.TEACHER) {
      const admin = await prisma.user.findFirst({
        where: { role: UserRole.ADMIN },
        select: { id: true },
      })

      if (admin) {
        await prisma.course.updateMany({
          where: { teacherId: user.id },
          data: {
            teacherId: admin.id,
          },
        })
      }
    }

    await prisma.user.delete({ where: { id } })
    return { message: 'Пользователь удалён' }
  }

  async getUserOverview(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      // prisma types могут отставать от актуальной схемы до генерации клиента
      // поэтому используем приведённый к any объект select
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        // поле есть в Prisma-схеме, но может отсутствовать в типах до регенерации клиента
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        deactivationReason: true as any,
        createdAt: true,
      } as Record<string, unknown>,
    })

    if (!user) {
      throw new AppError(404, 'USER_NOT_FOUND', 'Пользователь не найден')
    }

    const [enrollments, progresses, certificates, placement] = await Promise.all([
      prisma.enrollment.findMany({
        where: { userId: id },
        include: {
          course: {
            select: {
              id: true,
              title: true,
              level: true,
            },
          },
        },
      }),
      prisma.progress.findMany({
        where: { userId: id },
        select: {
          courseId: true,
          timeSpent: true,
          isCompleted: true,
        },
      }),
      prisma.certificate.findMany({
        where: { userId: id },
        select: {
          id: true,
          courseId: true,
          issuedAt: true,
        },
      }),
      prisma.placementSession.findFirst({
        where: { userId: id, status: 'COMPLETED' },
        orderBy: { finishedAt: 'desc' },
        select: {
          id: true,
          language: true,
          estimatedLevel: true,
          finishedAt: true,
        },
      }),
    ])

    const coursesMap = new Map<
      string,
      {
        id: string
        title: string
        level: string
        status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED'
      }
    >()

    for (const enrollment of enrollments) {
      const status =
        enrollment.completedAt != null
          ? 'COMPLETED'
          : enrollment.startedAt != null
            ? 'IN_PROGRESS'
            : 'NOT_STARTED'

      coursesMap.set(enrollment.courseId, {
        id: enrollment.course.id,
        title: enrollment.course.title,
        level: enrollment.course.level,
        status,
      })
    }

    const totalTimeSpent = progresses.reduce((sum, p) => sum + p.timeSpent, 0)
    const totalLessons = progresses.length
    const completedLessons = progresses.filter(p => p.isCompleted).length

    return {
      user,
      courses: Array.from(coursesMap.values()),
      stats: {
        totalCourses: enrollments.length,
        completedCourses: enrollments.filter(e => e.completedAt != null).length,
        totalLessons,
        completedLessons,
        totalTimeSpent,
        certificatesCount: certificates.length,
      },
      placement,
    }
  }

  async getStats() {
    const [students, teachers, admins, inactive] = await Promise.all([
      prisma.user.count({ where: { role: 'STUDENT' } }),
      prisma.user.count({ where: { role: 'TEACHER' } }),
      prisma.user.count({ where: { role: 'ADMIN' } }),
      prisma.user.count({ where: { isActive: false } }),
    ])
    return { students, teachers, admins, inactive, total: students + teachers + admins }
  }
}

export const userService = new UserService()

