import { prisma } from '../../shared/lib/prisma'
import type { PlatformSettings } from '@prisma/client'
import type { PlatformSettingsUpdateDto } from './platformSettings.schema'

class PlatformSettingsService {
  private cache: PlatformSettings | null = null

  private async loadSettings(): Promise<PlatformSettings> {
    const existing = await prisma.platformSettings.findUnique({
      where: { id: 1 },
    })

    if (existing) {
      return existing
    }

    // Создаём запись с дефолтами, если её ещё нет
    const created = await prisma.platformSettings.create({
      data: {
        id: 1,
      },
    })

    return created
  }

  async getSettings(): Promise<PlatformSettings> {
    if (this.cache) {
      return this.cache
    }

    const settings = await this.loadSettings()
    this.cache = settings
    return settings
  }

  async updateSettings(dto: PlatformSettingsUpdateDto): Promise<PlatformSettings> {
    const updated = await prisma.platformSettings.update({
      where: { id: 1 },
      data: dto,
    })

    this.cache = updated
    return updated
  }
}

export const platformSettingsService = new PlatformSettingsService()

