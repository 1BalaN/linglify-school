import type { Response } from 'express'
import type { AuthRequest } from '../../shared/middleware/auth'
import { userService } from './user.service'
import {
  getUsersQuerySchema,
  updateUserRoleSchema,
  updateUserStatusSchema,
  userIdParamsSchema,
} from './user.schema'

export class UserController {
  async list(req: AuthRequest, res: Response) {
    const query = getUsersQuerySchema.parse(req.query)
    const result = await userService.getUsers(query)
    res.json({ data: result })
  }

  async updateRole(req: AuthRequest, res: Response) {
    const { id } = userIdParamsSchema.parse(req.params)
    const dto = updateUserRoleSchema.parse(req.body)
    const user = await userService.updateUserRole(id, dto.role)
    res.json({ data: user })
  }

  async updateStatus(req: AuthRequest, res: Response) {
    const { id } = userIdParamsSchema.parse(req.params)
    const dto = updateUserStatusSchema.parse(req.body)
    const user = await userService.updateUserStatus(id, dto.isActive, dto.reason ?? null)
    res.json({ data: user })
  }

  async overview(req: AuthRequest, res: Response) {
    const { id } = userIdParamsSchema.parse(req.params)
    const overview = await userService.getUserOverview(id)
    res.json({ data: overview })
  }

  async delete(req: AuthRequest, res: Response) {
    const { id } = userIdParamsSchema.parse(req.params)
    const result = await userService.deleteUser(id)
    res.json(result)
  }

  async stats(_req: AuthRequest, res: Response) {
    const result = await userService.getStats()
    res.json({ data: result })
  }
}

export const userController = new UserController()

