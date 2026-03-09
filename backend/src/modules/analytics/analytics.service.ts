import { CourseLevel, CourseStatus, PlacementSessionStatus, UserRole } from '@prisma/client'
import { prisma } from '../../shared/lib/prisma'
import { AppError } from '../../shared/middleware/errorHandler'

type AdminOverviewCourseStatusMap = Record<CourseStatus, number>

interface AdminOverviewCourseSummary {
  id: string
  title: string
  level: CourseLevel
  language: string
  enrolledCount: number
  averageRating: number | null
  reviewsCount: number
  status: CourseStatus
}

interface AdminOverviewLanguageStats {
  language: string
  coursesCount: number
  totalEnrollments: number
}

interface AdminOverviewFunnel {
  totalUsers: number
  placementCompleted: number
  enrolled: number
  certificatesIssued: number
}

interface AdminOverview {
  users: {
    total: number
    students: number
    teachers: number
    admins: number
    newLast30Days: number
  }
  courses: {
    total: number
    newLast30Days: number
    byStatus: AdminOverviewCourseStatusMap
  }
  enrollments: {
    total: number
    completed: number
    completionRate: number
    newLast30Days: number
  }
  placement: {
    /**
     * За какой период в днях рассчитана статистика
     */
    periodDays: number
    /**
     * Количество завершённых placement-сессий за период
     */
    completedSessions: number
    /**
     * Распределение сессий по языку и уровню CEFR
     */
    byLanguageAndLevel: Record<string, Partial<Record<CourseLevel, number>>>
  }
  /**
   * Топ-курсы по вовлечённости/рейтингу
   */
  topCourses: AdminOverviewCourseSummary[]
  /**
   * Курсы с наименьшим рейтингом (потенциально проблемные)
   */
  lowRatedCourses: AdminOverviewCourseSummary[]
  /**
   * Статистика по языкам курсов
   */
  languageCourses: AdminOverviewLanguageStats[]
  /**
   * Воронка обучения по ключевым шагам
   */
  funnel: AdminOverviewFunnel
}

interface TeacherCourseLessonStats {
  id: string
  title: string
  type: string
  studentsReached: number
  studentsCompleted: number
  avgScore: number | null
  avgTimeSpentSec: number | null
}

interface TeacherCourseAnalytics {
  course: {
    id: string
    title: string
    level: CourseLevel
    language: string
  }
  enrollments: {
    total: number
    completed: number
    completionRate: number
    activeStudents7Days: number
    newLast30Days: number
  }
  lessons: TeacherCourseLessonStats[]
}

class AnalyticsService {
  private buildDateRange(periodDays: number): { labels: string[]; byKey: Record<string, number> } {
    const labels: string[] = []
    const byKey: Record<string, number> = {}

    const now = new Date()
    const start = new Date(now.getTime() - (periodDays - 1) * 24 * 60 * 60 * 1000)

    for (let i = 0; i < periodDays; i++) {
      const d = new Date(start.getTime() + i * 24 * 60 * 60 * 1000)
      const key = d.toISOString().slice(0, 10)
      labels.push(key)
      byKey[key] = 0
    }

    return { labels, byKey }
  }

  private getDateKey(date: Date): string {
    return date.toISOString().slice(0, 10)
  }

  async getAdminOverview(periodDays: number = 30): Promise<AdminOverview> {
    const now = new Date()
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const periodFrom = new Date(now.getTime() - periodDays * 24 * 60 * 60 * 1000)

    const [
      totalUsers,
      totalStudents,
      totalTeachers,
      totalAdmins,
      newUsersLast30Days,
      totalCourses,
      newCoursesLast30Days,
      coursesByStatusRaw,
      totalEnrollments,
      newEnrollmentsLast30Days,
      completedEnrollments,
      placementSessionsLastPeriod,
      placementCompletedTotal,
      certificatesIssued,
      topCoursesRaw,
      lowRatedCoursesRaw,
      languageGroups,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: UserRole.STUDENT } }),
      prisma.user.count({ where: { role: UserRole.TEACHER } }),
      prisma.user.count({ where: { role: UserRole.ADMIN } }),
      prisma.user.count({ where: { createdAt: { gte: last30Days } } }),
      prisma.course.count(),
      prisma.course.count({ where: { createdAt: { gte: last30Days } } }),
      prisma.course.groupBy({
        by: ['status'],
        _count: { _all: true },
      }),
      prisma.enrollment.count(),
      prisma.enrollment.count({ where: { enrolledAt: { gte: last30Days } } }),
      prisma.enrollment.count({ where: { completedAt: { not: null } } }),
      prisma.placementSession.findMany({
        where: {
          status: PlacementSessionStatus.COMPLETED,
          finishedAt: { gte: periodFrom },
        },
        select: {
          id: true,
          language: true,
          estimatedLevel: true,
        },
      }),
      prisma.placementSession.count({
        where: {
          status: PlacementSessionStatus.COMPLETED,
        },
      }),
      prisma.certificate.count(),
      prisma.course.findMany({
        where: {
          status: CourseStatus.PUBLISHED,
        },
        orderBy: [
          { enrolledCount: 'desc' },
          { averageRating: 'desc' },
        ],
        select: {
          id: true,
          title: true,
          level: true,
          language: true,
          enrolledCount: true,
          averageRating: true,
          reviewsCount: true,
          status: true,
        },
      }),
      prisma.course.findMany({
        where: {
          averageRating: {
            not: null,
            lte: 2.5,
          },
        },
        orderBy: [
          { averageRating: 'asc' },
          { enrolledCount: 'desc' },
        ],
        select: {
          id: true,
          title: true,
          level: true,
          language: true,
          enrolledCount: true,
          averageRating: true,
          reviewsCount: true,
          status: true,
        },
      }),
      prisma.course.groupBy({
        by: ['language'],
        _count: {
          _all: true,
        },
        _sum: {
          enrolledCount: true,
        },
      }),
    ])

    const coursesByStatus: AdminOverviewCourseStatusMap = {
      [CourseStatus.DRAFT]: 0,
      [CourseStatus.PENDING_REVIEW]: 0,
      [CourseStatus.IN_REVIEW]: 0,
      [CourseStatus.REJECTED]: 0,
      [CourseStatus.PUBLISHED]: 0,
      [CourseStatus.ARCHIVED]: 0,
    }

    for (const row of coursesByStatusRaw) {
      coursesByStatus[row.status] = row._count._all
    }

    const byLanguageAndLevel: Record<string, Partial<Record<CourseLevel, number>>> = {}

    for (const session of placementSessionsLastPeriod) {
      if (!session.estimatedLevel) continue
      const languageKey = session.language
      const levelKey = session.estimatedLevel

      if (!byLanguageAndLevel[languageKey]) {
        byLanguageAndLevel[languageKey] = {}
      }

      const current = byLanguageAndLevel[languageKey][levelKey] ?? 0
      byLanguageAndLevel[languageKey][levelKey] = current + 1
    }

    const completionRate =
      totalEnrollments > 0 ? Math.round((completedEnrollments / totalEnrollments) * 100) : 0

    const topCourses: AdminOverviewCourseSummary[] = topCoursesRaw

    const lowRatedCourses: AdminOverviewCourseSummary[] = lowRatedCoursesRaw

    const languageCourses: AdminOverviewLanguageStats[] = languageGroups.map(group => ({
      language: group.language,
      coursesCount: group._count._all,
      totalEnrollments: group._sum.enrolledCount ?? 0,
    }))

    return {
      users: {
        total: totalUsers,
        students: totalStudents,
        teachers: totalTeachers,
        admins: totalAdmins,
        newLast30Days: newUsersLast30Days,
      },
      courses: {
        total: totalCourses,
        newLast30Days: newCoursesLast30Days,
        byStatus: coursesByStatus,
      },
      enrollments: {
        total: totalEnrollments,
        completed: completedEnrollments,
        completionRate,
        newLast30Days: newEnrollmentsLast30Days,
      },
      placement: {
        periodDays,
        completedSessions: placementSessionsLastPeriod.length,
        byLanguageAndLevel,
      },
      topCourses,
      lowRatedCourses,
      languageCourses,
      funnel: {
        totalUsers,
        placementCompleted: placementCompletedTotal,
        enrolled: totalEnrollments,
        certificatesIssued,
      },
    }
  }

  async getAdminTimeseries(periodDays: number = 30) {
    const now = new Date()
    const from = new Date(now.getTime() - periodDays * 24 * 60 * 60 * 1000)

    const [users, enrollmentsNew, enrollmentsCompleted, placementSessions] = await Promise.all([
      prisma.user.findMany({
        where: {
          createdAt: { gte: from },
        },
        select: {
          createdAt: true,
        },
      }),
      prisma.enrollment.findMany({
        where: {
          enrolledAt: { gte: from },
        },
        select: {
          enrolledAt: true,
        },
      }),
      prisma.enrollment.findMany({
        where: {
          completedAt: { not: null, gte: from },
        },
        select: {
          completedAt: true,
        },
      }),
      prisma.placementSession.findMany({
        where: {
          status: PlacementSessionStatus.COMPLETED,
          finishedAt: { gte: from },
        },
        select: {
          finishedAt: true,
        },
      }),
    ])

    const { labels, byKey: usersMap } = this.buildDateRange(periodDays)
    const enrollNewMap: Record<string, number> = { ...usersMap }
    const enrollCompletedMap: Record<string, number> = { ...usersMap }
    const placementMap: Record<string, number> = { ...usersMap }

    for (const u of users) {
      const key = this.getDateKey(u.createdAt)
      if (usersMap[key] !== undefined) {
        usersMap[key] += 1
      }
    }

    for (const e of enrollmentsNew) {
      const key = this.getDateKey(e.enrolledAt)
      if (enrollNewMap[key] !== undefined) {
        enrollNewMap[key] += 1
      }
    }

    for (const e of enrollmentsCompleted) {
      const key = this.getDateKey(e.completedAt as Date)
      if (enrollCompletedMap[key] !== undefined) {
        enrollCompletedMap[key] += 1
      }
    }

    for (const s of placementSessions) {
      const finishedAt = s.finishedAt as Date
      const key = this.getDateKey(finishedAt)
      if (placementMap[key] !== undefined) {
        placementMap[key] += 1
      }
    }

    const registrations: number[] = []
    const newEnrollments: number[] = []
    const completedEnrollments: number[] = []
    const placementCompleted: number[] = []

    for (const label of labels) {
      registrations.push(usersMap[label] ?? 0)
      newEnrollments.push(enrollNewMap[label] ?? 0)
      completedEnrollments.push(enrollCompletedMap[label] ?? 0)
      placementCompleted.push(placementMap[label] ?? 0)
    }

    return {
      periodDays,
      labels,
      users: {
        registrations,
      },
      enrollments: {
        new: newEnrollments,
        completed: completedEnrollments,
      },
      placement: {
        completedSessions: placementCompleted,
      },
    }
  }

  async getTeacherCourseAnalytics(
    userId: string,
    userRole: UserRole,
    courseId: string
  ): Promise<TeacherCourseAnalytics> {
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: {
        id: true,
        title: true,
        level: true,
        language: true,
        teacherId: true,
      },
    })

    if (!course) {
      throw new AppError(404, 'COURSE_NOT_FOUND', 'Курс не найден')
    }

    if (course.teacherId !== userId && userRole !== UserRole.ADMIN) {
      throw new AppError(403, 'ACCESS_DENIED', 'Нет доступа к аналитике этого курса')
    }

    const now = new Date()
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    const [
      totalEnrollments,
      completedEnrollments,
      newEnrollmentsLast30Days,
      activeStudentsProgress,
      lessons,
      progressGroups,
    ] = await Promise.all([
      prisma.enrollment.count({ where: { courseId } }),
      prisma.enrollment.count({
        where: {
          courseId,
          completedAt: { not: null },
        },
      }),
      prisma.enrollment.count({
        where: {
          courseId,
          enrolledAt: { gte: last30Days },
        },
      }),
      prisma.progress.groupBy({
        by: ['userId'],
        where: {
          courseId,
          updatedAt: { gte: last7Days },
        },
        _count: {
          _all: true,
        },
      }),
      prisma.lesson.findMany({
        where: { courseId },
        select: {
          id: true,
          title: true,
          type: true,
        },
        orderBy: {
          order: 'asc',
        },
      }),
      prisma.progress.groupBy({
        by: ['lessonId', 'isCompleted'],
        where: {
          courseId,
        },
        _count: {
          _all: true,
        },
        _avg: {
          score: true,
          timeSpent: true,
        },
        _sum: {
          timeSpent: true,
        },
      }),
    ])

    const activeStudents7Days = activeStudentsProgress.length

    const lessonStatsMap = new Map<
      string,
      {
        totalCount: number
        completedCount: number
        totalTimeSpent: number
        totalScoreSum: number
        totalScoreCount: number
      }
    >()

    for (const group of progressGroups) {
      const existing =
        lessonStatsMap.get(group.lessonId) ?? {
          totalCount: 0,
          completedCount: 0,
          totalTimeSpent: 0,
          totalScoreSum: 0,
          totalScoreCount: 0,
        }

      const groupCount = group._count._all
      const groupTimeSum = group._sum.timeSpent ?? 0
      const groupAvgScore = group._avg.score

      existing.totalCount += groupCount
      if (group.isCompleted) {
        existing.completedCount += groupCount
      }
      existing.totalTimeSpent += groupTimeSum

      if (groupAvgScore !== null) {
        existing.totalScoreSum += groupAvgScore * groupCount
        existing.totalScoreCount += groupCount
      }

      lessonStatsMap.set(group.lessonId, existing)
    }

    const lessonsStats: TeacherCourseLessonStats[] = lessons.map(lesson => {
      const stats = lessonStatsMap.get(lesson.id)

      if (!stats) {
        return {
          id: lesson.id,
          title: lesson.title,
          type: lesson.type,
          studentsReached: 0,
          studentsCompleted: 0,
          avgScore: null,
          avgTimeSpentSec: null,
        }
      }

      const avgTimeSpentSec =
        stats.totalCount > 0 ? Math.round(stats.totalTimeSpent / stats.totalCount) : null

      const avgScore =
        stats.totalScoreCount > 0
          ? Math.round((stats.totalScoreSum / stats.totalScoreCount) * 10) / 10
          : null

      return {
        id: lesson.id,
        title: lesson.title,
        type: lesson.type,
        studentsReached: stats.totalCount,
        studentsCompleted: stats.completedCount,
        avgScore,
        avgTimeSpentSec,
      }
    })

    const completionRate =
      totalEnrollments > 0 ? Math.round((completedEnrollments / totalEnrollments) * 100) : 0

    return {
      course: {
        id: course.id,
        title: course.title,
        level: course.level,
        language: course.language,
      },
      enrollments: {
        total: totalEnrollments,
        completed: completedEnrollments,
        completionRate,
        activeStudents7Days,
        newLast30Days: newEnrollmentsLast30Days,
      },
      lessons: lessonsStats,
    }
  }

  async getTeacherCourseTimeseries(
    userId: string,
    userRole: UserRole,
    courseId: string,
    periodDays: number = 30
  ) {
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: {
        id: true,
        teacherId: true,
      },
    })

    if (!course) {
      throw new AppError(404, 'COURSE_NOT_FOUND', 'Курс не найден')
    }

    if (course.teacherId !== userId && userRole !== UserRole.ADMIN) {
      throw new AppError(403, 'ACCESS_DENIED', 'Нет доступа к аналитике этого курса')
    }

    const now = new Date()
    const from = new Date(now.getTime() - periodDays * 24 * 60 * 60 * 1000)

    const [newEnrollments, progressUpdates] = await Promise.all([
      prisma.enrollment.findMany({
        where: {
          courseId,
          enrolledAt: { gte: from },
        },
        select: {
          enrolledAt: true,
        },
      }),
      prisma.progress.findMany({
        where: {
          courseId,
          updatedAt: { gte: from },
        },
        select: {
          updatedAt: true,
          userId: true,
        },
      }),
    ])

    const { labels, byKey } = this.buildDateRange(periodDays)
    const enrollMap: Record<string, number> = { ...byKey }
    const activeStudentsMap: Record<string, Set<string>> = {}

    for (const e of newEnrollments) {
      const key = this.getDateKey(e.enrolledAt)
      if (enrollMap[key] !== undefined) {
        enrollMap[key] += 1
      }
    }

    for (const p of progressUpdates) {
      const key = this.getDateKey(p.updatedAt)
      if (!activeStudentsMap[key]) {
        activeStudentsMap[key] = new Set()
      }
      activeStudentsMap[key].add(p.userId)
    }

    const newEnrollmentsSeries: number[] = []
    const activeStudentsSeries: number[] = []

    for (const label of labels) {
      newEnrollmentsSeries.push(enrollMap[label] ?? 0)
      activeStudentsSeries.push(activeStudentsMap[label]?.size ?? 0)
    }

    return {
      periodDays,
      labels,
      enrollments: {
        new: newEnrollmentsSeries,
      },
      activeStudents: activeStudentsSeries,
    }
  }
}

export const analyticsService = new AnalyticsService()

