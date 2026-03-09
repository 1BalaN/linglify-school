import type { Request, Response } from 'express'
import { courseService } from './course.service'
import {
  createCourseSchema,
  updateCourseSchema,
  updateCourseStatusSchema,
  publishCourseSchema,
  getCoursesQuerySchema,
  enrollCourseSchema,
  createReviewSchema,
  updateReviewSchema,
} from './course.schema'
import type { AuthRequest } from '../../shared/middleware/auth'
import { courseIdParamsSchema } from './course.students.schema'

class CourseController {
  /**
   * POST /api/courses
   * Создать новый курс
   */
  async createCourse(req: Request, res: Response) {
    const dto = createCourseSchema.parse(req.body)
    const course = await courseService.createCourse(req.user!.userId, dto)

    res.status(201).json({ data: course })
  }

  /**
   * GET /api/courses
   * Получить список курсов
   */
  async getCourses(req: Request, res: Response) {
    const query = getCoursesQuerySchema.parse(req.query)
    
    const authReq = req as AuthRequest
    const userId = authReq.user?.userId
    const userRole = authReq.user?.role

    const result = await courseService.getCourses(query, userId, userRole)

    res.json(result)
  }

  /**
   * GET /api/courses/:id
   * Получить курс по ID
   */
  async getCourseById(req: AuthRequest, res: Response) {
    const { id } = req.params
    
    const userId = req.user?.userId
    const userRole = req.user?.role

    const course = await courseService.getCourseById(id, userId, userRole)

    res.json({ data: course })
  }

  /**
   * PATCH /api/courses/:id
   * Обновить курс
   */
  async updateCourse(req: Request, res: Response) {
    const { id } = req.params
    const dto = updateCourseSchema.parse(req.body)

    const course = await courseService.updateCourse(
      id,
      req.user!.userId,
      req.user!.role,
      dto
    )

    res.json({ data: course })
  }

  /**
   * PATCH /api/courses/:id/status
   * Изменить статус курса
   */
  async updateCourseStatus(req: Request, res: Response) {
    const { id } = req.params
    const dto = updateCourseStatusSchema.parse(req.body)

    const course = await courseService.updateCourseStatus(
      id,
      req.user!.userId,
      req.user!.role,
      dto
    )

    res.json({ data: course })
  }

  /**
   * PATCH /api/courses/:id/publish
   * Опубликовать/снять с публикации курс
   */
  async publishCourse(req: Request, res: Response) {
    const { id } = req.params
    const dto = publishCourseSchema.parse(req.body)

    const course = await courseService.publishCourse(
      id,
      req.user!.userId,
      req.user!.role,
      dto
    )

    res.json({ data: course })
  }

  /**
   * DELETE /api/courses/:id
   * Удалить курс
   */
  async deleteCourse(req: Request, res: Response) {
    const { id } = req.params

    const result = await courseService.deleteCourse(
      id,
      req.user!.userId,
      req.user!.role
    )

    res.json(result)
  }

  /**
   * POST /api/courses/:id/enroll
   * Зачислить пользователя на курс
   */
  async enrollCourse(req: AuthRequest, res: Response) {
    const { id } = req.params
    const dto = enrollCourseSchema.parse({ courseId: id })

    const enrollment = await courseService.enrollCourse(req.user!.userId, dto)

    res.status(201).json({ data: enrollment })
  }

  /**
   * GET /api/courses/my/enrolled
   * Получить курсы пользователя
   */
  async getUserCourses(req: AuthRequest, res: Response) {
    const enrollments = await courseService.getUserCourses(req.user!.userId)

    res.json({ data: enrollments })
  }

  /**
   * GET /api/courses/:id/students
   * Получить список учеников курса (для преподавателя курса или админа)
   */
  async getCourseStudents(req: AuthRequest, res: Response) {
    const { id } = courseIdParamsSchema.parse(req.params)

    const enrollments = await courseService.getCourseStudents(
      id,
      req.user!.userId,
      req.user!.role
    )

    res.json({ data: enrollments })
  }

  /**
   * POST /api/courses/:id/reviews
   * Создать отзыв на курс
   */
  async createReview(req: Request, res: Response) {
    const { id } = req.params
    const dto = createReviewSchema.parse({ ...req.body, courseId: id })

    const review = await courseService.createReview(req.user!.userId, dto, req.user!.role)

    res.status(201).json({ data: review })
  }

  /**
   * PATCH /api/reviews/:id
   * Обновить отзыв
   */
  async updateReview(req: Request, res: Response) {
    const { id } = req.params
    const dto = updateReviewSchema.parse(req.body)

    const review = await courseService.updateReview(id, req.user!.userId, dto)

    res.json({ data: review })
  }

  /**
   * DELETE /api/reviews/:id
   * Удалить отзыв
   */
  async deleteReview(req: Request, res: Response) {
    const { id } = req.params

    const result = await courseService.deleteReview(
      id,
      req.user!.userId,
      req.user!.role
    )

    res.json(result)
  }

  /**
   * GET /api/courses/:courseId/progress
   * Получить прогресс курса (делегирует в lessonService)
   */
  async getCourseProgress(req: Request, res: Response) {
    const { courseId } = req.params
    const { lessonService } = await import('../lesson/lesson.service')
    
    const progress = await lessonService.getCourseProgress(req.user!.userId, courseId)

    res.json({ data: progress })
  }
}

export const courseController = new CourseController()
