import type { Response, Request } from 'express'
import type { AuthRequest } from '../../shared/middleware/auth'
import { placementService } from './placement.service'
import {
  startPlacementSchema,
  submitPlacementAnswerSchema,
  getPlacementResultSchema,
  getPlacementQuestionsQuerySchema,
  createPlacementQuestionSchema,
  updatePlacementQuestionSchema,
} from './placement.schema'

export class PlacementController {
  async start(req: AuthRequest, res: Response) {
    const dto = startPlacementSchema.parse(req.body)
    const userId = req.user?.userId ?? null

    const result = await placementService.startSession(userId, dto)

    res.status(201).json({ data: result })
  }

  async answer(req: AuthRequest, res: Response) {
    const dto = submitPlacementAnswerSchema.parse(req.body)
    const userId = req.user?.userId ?? null

    const result = await placementService.submitAnswer(userId, dto)

    res.json({ data: result })
  }

  async getResult(req: AuthRequest, res: Response) {
    const { sessionId } = getPlacementResultSchema.parse(req.query)
    const userId = req.user?.userId ?? null

    const result = await placementService.getResult(sessionId, userId)

    res.json({ data: result })
  }

  async getRecommendedCourses(req: AuthRequest, res: Response) {
    const { sessionId } = getPlacementResultSchema.parse(req.query)
    const userId = req.user?.userId ?? null

    const { session } = await placementService.getResult(sessionId, userId)

    const level = session.estimatedLevel
    if (!level) {
      res.status(400).json({
        error: {
          code: 'PLACEMENT_LEVEL_NOT_AVAILABLE',
          message: 'У этой сессии ещё не определён уровень',
        },
      })
      return
    }

    const courses = await placementService.getRecommendedCourses(session.language, level)

    res.json({ data: courses })
  }

  async listQuestions(req: Request, res: Response) {
    const query = getPlacementQuestionsQuerySchema.parse(req.query)
    const result = await placementService.listQuestions(query)
    res.json({ data: result })
  }

  async createQuestion(req: Request, res: Response) {
    const dto = createPlacementQuestionSchema.parse(req.body)
    const question = await placementService.createQuestion(dto)
    res.status(201).json({ data: question })
  }

  async updateQuestion(req: Request, res: Response) {
    const { id } = req.params
    const dto = updatePlacementQuestionSchema.parse(req.body)
    const question = await placementService.updateQuestion(id, dto)
    res.json({ data: question })
  }

  async deleteQuestion(req: Request, res: Response) {
    const { id } = req.params
    const result = await placementService.deleteQuestion(id)
    res.json(result)
  }
}

export const placementController = new PlacementController()

