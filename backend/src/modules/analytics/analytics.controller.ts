import type { Response } from 'express'
import type { AuthRequest } from '../../shared/middleware/auth'
import { analyticsService } from './analytics.service'
import {
  adminOverviewQuerySchema,
  adminTimeseriesQuerySchema,
  teacherCourseParamsSchema,
  teacherCourseTimeseriesQuerySchema,
} from './analytics.schema'
import { UserRole } from '@prisma/client'

export class AnalyticsController {
  async getAdminOverview(req: AuthRequest, res: Response) {
    const { periodDays } = adminOverviewQuerySchema.parse(req.query)

    const data = await analyticsService.getAdminOverview(periodDays ?? 30)

    res.json({ data })
  }

  async getAdminTimeseries(req: AuthRequest, res: Response) {
    const { periodDays } = adminTimeseriesQuerySchema.parse(req.query)

    const data = await analyticsService.getAdminTimeseries(periodDays ?? 30)

    res.json({ data })
  }

  async getTeacherCourseAnalytics(req: AuthRequest, res: Response) {
    const { courseId } = teacherCourseParamsSchema.parse(req.params)

    if (!req.user) {
      res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Не авторизован',
        },
      })
      return
    }

    const data = await analyticsService.getTeacherCourseAnalytics(
      req.user.userId,
      req.user.role as UserRole,
      courseId
    )

    res.json({ data })
  }

  async getTeacherCourseTimeseries(req: AuthRequest, res: Response) {
    const { courseId } = teacherCourseParamsSchema.parse(req.params)
    const { periodDays } = teacherCourseTimeseriesQuerySchema.parse(req.query)

    if (!req.user) {
      res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Не авторизован',
        },
      })
      return
    }

    const data = await analyticsService.getTeacherCourseTimeseries(
      req.user.userId,
      req.user.role as UserRole,
      courseId,
      periodDays ?? 30
    )

    res.json({ data })
  }
}

export const analyticsController = new AnalyticsController()

