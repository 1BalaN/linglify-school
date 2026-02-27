import type { Response } from 'express'
import type { AuthRequest } from '../../shared/types/express'
import { lessonService } from './lesson.service'
import {
  createLessonSchema,
  updateLessonSchema,
  createQuestionSchema,
  updateQuestionSchema,
  submitAnswerSchema,
  updateProgressSchema,
} from './lesson.schema'

class LessonController {
  /**
   * POST /api/lessons
   * Создать урок
   */
  async createLesson(req: AuthRequest, res: Response) {
    const dto = createLessonSchema.parse(req.body)
    const lesson = await lessonService.createLesson(
      req.user!.userId,
      req.user!.role,
      dto
    )

    res.status(201).json({ data: lesson })
  }

  /**
   * GET /api/lessons/:id
   * Получить урок по ID
   */
  async getLessonById(req: AuthRequest, res: Response) {
    const { id } = req.params
    const userId = req.user?.userId
    const userRole = req.user?.role

    const lesson = await lessonService.getLessonById(id, userId, userRole)

    res.json({ data: lesson })
  }

  /**
   * GET /api/courses/:courseId/lessons
   * Получить уроки курса
   */
  async getCourseLessons(req: AuthRequest, res: Response) {
    const { courseId } = req.params
    const userId = req.user?.userId
    const userRole = req.user?.role

    const lessons = await lessonService.getCourseLessons(courseId, userId, userRole)

    res.json({ data: lessons })
  }

  /**
   * PATCH /api/lessons/:id
   * Обновить урок
   */
  async updateLesson(req: AuthRequest, res: Response) {
    const { id } = req.params
    const dto = updateLessonSchema.parse(req.body)

    const lesson = await lessonService.updateLesson(
      id,
      req.user!.userId,
      req.user!.role,
      dto
    )

    res.json({ data: lesson })
  }

  /**
   * DELETE /api/lessons/:id
   * Удалить урок
   */
  async deleteLesson(req: AuthRequest, res: Response) {
    const { id } = req.params

    const result = await lessonService.deleteLesson(
      id,
      req.user!.userId,
      req.user!.role
    )

    res.json(result)
  }

  /**
   * POST /api/questions
   * Создать вопрос
   */
  async createQuestion(req: AuthRequest, res: Response) {
    const dto = createQuestionSchema.parse(req.body)

    const question = await lessonService.createQuestion(
      req.user!.userId,
      req.user!.role,
      dto
    )

    res.status(201).json({ data: question })
  }

  /**
   * PATCH /api/questions/:id
   * Обновить вопрос
   */
  async updateQuestion(req: AuthRequest, res: Response) {
    const { id } = req.params
    const dto = updateQuestionSchema.parse(req.body)

    const question = await lessonService.updateQuestion(
      id,
      req.user!.userId,
      req.user!.role,
      dto
    )

    res.json({ data: question })
  }

  /**
   * DELETE /api/questions/:id
   * Удалить вопрос
   */
  async deleteQuestion(req: AuthRequest, res: Response) {
    const { id } = req.params

    const result = await lessonService.deleteQuestion(
      id,
      req.user!.userId,
      req.user!.role
    )

    res.json(result)
  }

  /**
   * POST /api/questions/answer
   * Отправить ответ на вопрос
   */
  async submitAnswer(req: AuthRequest, res: Response) {
    const dto = submitAnswerSchema.parse(req.body)

    const answer = await lessonService.submitAnswer(req.user!.userId, dto)

    res.status(201).json({ data: answer })
  }

  /**
   * POST /api/lessons/progress
   * Обновить прогресс урока
   */
  async updateProgress(req: AuthRequest, res: Response) {
    const dto = updateProgressSchema.parse(req.body)

    const progress = await lessonService.updateProgress(req.user!.userId, dto)

    res.json({ data: progress })
  }

  /**
   * GET /api/courses/:courseId/progress
   * Получить прогресс курса
   */
  async getCourseProgress(req: AuthRequest, res: Response) {
    const { courseId } = req.params

    const progress = await lessonService.getCourseProgress(req.user!.userId, courseId)

    res.json({ data: progress })
  }
}

export const lessonController = new LessonController()
