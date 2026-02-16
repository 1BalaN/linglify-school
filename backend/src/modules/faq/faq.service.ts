import { prisma } from '../../shared/lib/prisma'
import type { CreateFAQDto, UpdateFAQDto } from './faq.schema'
import { AppError } from '../../shared/middleware/errorHandler'

class FAQService {
  async getAllFAQs(includeInactive = false) {
    const where = includeInactive ? {} : { isActive: true }

    const items = await prisma.fAQItem.findMany({
      where,
      orderBy: [{ category: 'asc' }, { order: 'asc' }, { createdAt: 'asc' }],
    })

    return { items }
  }

  async getFAQById(id: string) {
    const item = await prisma.fAQItem.findUnique({
      where: { id },
    })

    if (!item) {
      throw new AppError(404, 'FAQ_NOT_FOUND', 'FAQ запись не найдена')
    }

    return item
  }

  async createFAQ(dto: CreateFAQDto) {
    const item = await prisma.fAQItem.create({
      data: {
        question: dto.question,
        answer: dto.answer,
        category: dto.category,
        order: dto.order ?? 0,
        isActive: dto.isActive ?? true,
      },
    })

    return item
  }

  async updateFAQ(id: string, dto: UpdateFAQDto) {
    const existingItem = await prisma.fAQItem.findUnique({
      where: { id },
    })

    if (!existingItem) {
      throw new AppError(404, 'FAQ_NOT_FOUND', 'FAQ запись не найдена')
    }

    const updated = await prisma.fAQItem.update({
      where: { id },
      data: dto,
    })

    return updated
  }

  async deleteFAQ(id: string) {
    const existingItem = await prisma.fAQItem.findUnique({
      where: { id },
    })

    if (!existingItem) {
      throw new AppError(404, 'FAQ_NOT_FOUND', 'FAQ запись не найдена')
    }

    await prisma.fAQItem.delete({
      where: { id },
    })

    return { message: 'FAQ запись успешно удалена' }
  }

  async reorderFAQs(items: Array<{ id: string; order: number }>) {
    await prisma.$transaction(
      items.map(item =>
        prisma.fAQItem.update({
          where: { id: item.id },
          data: { order: item.order },
        })
      )
    )

    return { message: 'Порядок FAQ успешно обновлён' }
  }
}

export const faqService = new FAQService()
