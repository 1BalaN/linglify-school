import type { Request, Response } from 'express'
import { faqService } from './faq.service'
import { createFAQSchema, updateFAQSchema } from './faq.schema'
import { z } from 'zod'

class FAQController {
  async getAllFAQs(req: Request, res: Response): Promise<void> {
    const includeInactive = req.query.includeInactive === 'true'
    const result = await faqService.getAllFAQs(includeInactive)
    res.json({ data: result })
  }

  async getFAQById(req: Request, res: Response): Promise<void> {
    const { id } = req.params
    const result = await faqService.getFAQById(id)
    res.json({ data: result })
  }

  async createFAQ(req: Request, res: Response): Promise<void> {
    const data = createFAQSchema.parse(req.body)
    const result = await faqService.createFAQ(data)
    res.status(201).json({ data: result })
  }

  async updateFAQ(req: Request, res: Response): Promise<void> {
    const { id } = req.params
    const data = updateFAQSchema.parse(req.body)
    const result = await faqService.updateFAQ(id, data)
    res.json({ data: result })
  }

  async deleteFAQ(req: Request, res: Response): Promise<void> {
    const { id } = req.params
    const result = await faqService.deleteFAQ(id)
    res.json({ data: result })
  }

  async reorderFAQs(req: Request, res: Response): Promise<void> {
    const reorderSchema = z.object({
      items: z.array(
        z.object({
          id: z.string(),
          order: z.number().int().min(0),
        })
      ),
    })

    const data = reorderSchema.parse(req.body)
    const result = await faqService.reorderFAQs(data.items as { id: string; order: number }[])
    res.json({ data: result })
  }
}

export const faqController = new FAQController()