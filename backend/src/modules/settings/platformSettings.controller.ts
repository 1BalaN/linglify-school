import type { Response } from 'express'
import type { AuthRequest } from '../../shared/middleware/auth'
import { platformSettingsService } from './platformSettings.service'
import { platformSettingsUpdateSchema } from './platformSettings.schema'

export class PlatformSettingsController {
  async get(req: AuthRequest, res: Response) {
    const settings = await platformSettingsService.getSettings()
    res.json({ data: settings })
  }

  async update(req: AuthRequest, res: Response) {
    const dto = platformSettingsUpdateSchema.parse(req.body)
    const settings = await platformSettingsService.updateSettings(dto)
    res.json({ data: settings })
  }
}

export const platformSettingsController = new PlatformSettingsController()

