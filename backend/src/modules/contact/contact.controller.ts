import type { Request, Response } from 'express'
import { contactService } from './contact.service'
import { sendContactMessageSchema } from './contact.schema'

class ContactController {
  async sendMessage(req: Request, res: Response): Promise<void> {
    const data = sendContactMessageSchema.parse(req.body)
    const result = await contactService.sendContactMessage(data)
    res.status(201).json({ data: result })
  }

  async getAllMessages(req: Request, res: Response): Promise<void> {
    const includeRead = req.query.includeRead !== 'false'
    const result = await contactService.getAllMessages(includeRead)
    res.json({ data: result })
  }

  async markAsRead(req: Request, res: Response): Promise<void> {
    const { id } = req.params
    const result = await contactService.markAsRead(id)
    res.json({ data: result })
  }

  async markAsReplied(req: Request, res: Response): Promise<void> {
    const { id } = req.params
    const { adminNote } = req.body
    const result = await contactService.markAsReplied(id, adminNote)
    res.json({ data: result })
  }

  async updateAdminNote(req: Request, res: Response): Promise<void> {
    const { id } = req.params
    const { adminNote } = req.body
    const result = await contactService.updateAdminNote(id, adminNote)
    res.json({ data: result })
  }

  async deleteMessage(req: Request, res: Response): Promise<void> {
    const { id } = req.params
    const result = await contactService.deleteMessage(id)
    res.json({ data: result })
  }
}

export const contactController = new ContactController()
