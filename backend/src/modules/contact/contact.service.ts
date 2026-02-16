import { prisma } from '../../shared/lib/prisma'
import { emailService } from '../../shared/lib/email'
import { config } from '../../config/env'
import type { SendContactMessageDto } from './contact.schema'
import { AppError } from '../../shared/middleware/errorHandler'

class ContactService {
  async sendContactMessage(dto: SendContactMessageDto) {
    // Сохраняем сообщение в БД
    const message = await prisma.contactMessage.create({
      data: {
        name: dto.name,
        email: dto.email,
        subject: dto.subject,
        message: dto.message,
      },
    })

    // Отправляем email администратору
    try {
      await emailService.sendEmail({
        to: 'gormachdv@gmail.com',
        subject: `[Контакты Linglify] ${dto.subject}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #7C3AED;">Новое сообщение с формы контактов</h2>
            
            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>От:</strong> ${dto.name}</p>
              <p><strong>Email:</strong> <a href="mailto:${dto.email}">${dto.email}</a></p>
              <p><strong>Тема:</strong> ${dto.subject}</p>
            </div>
            
            <div style="background: white; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
              <h3 style="margin-top: 0;">Сообщение:</h3>
              <p style="white-space: pre-wrap;">${dto.message}</p>
            </div>
            
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
            
            <p style="color: #6b7280; font-size: 14px;">
              Это сообщение отправлено через форму контактов на платформе Linglify.
              <br>
              Для ответа используйте email: ${dto.email}
            </p>
          </div>
        `,
      })

      console.log('✅ Contact message email sent to admin')
    } catch (error) {
      console.error('❌ Failed to send contact email to admin:', error)
      // Не бросаем ошибку, чтобы не блокировать сохранение в БД
    }

    // Отправляем подтверждение пользователю
    try {
      await emailService.sendEmail({
        to: dto.email,
        subject: 'Спасибо за ваше сообщение - Linglify',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #7C3AED;">Спасибо за обращение!</h2>
            
            <p>Здравствуйте, ${dto.name}!</p>
            
            <p>Мы получили ваше сообщение и свяжемся с вами в ближайшее время.</p>
            
            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0;">Детали вашего обращения:</h3>
              <p><strong>Тема:</strong> ${dto.subject}</p>
              <p><strong>Дата:</strong> ${new Date().toLocaleString('ru-RU')}</p>
            </div>
            
            <p>Обычно мы отвечаем в течение 24 часов в рабочие дни (Пн-Пт, 9:00-18:00 UTC+3).</p>
            
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
            
            <p style="color: #6b7280; font-size: 14px;">
              С уважением,<br>
              Команда Linglify<br>
              <a href="${config.frontendUrl}" style="color: #7C3AED;">linglify.com</a>
            </p>
          </div>
        `,
      })

      console.log('✅ Confirmation email sent to user')
    } catch (error) {
      console.error('❌ Failed to send confirmation email to user:', error)
    }

    return {
      message: 'Спасибо! Ваше сообщение отправлено. Мы свяжемся с вами в ближайшее время.',
      id: message.id,
    }
  }

  async getAllMessages(includeRead = true) {
    const where = includeRead ? {} : { isRead: false }

    const messages = await prisma.contactMessage.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })

    return { messages }
  }

  async markAsRead(id: string) {
    const message = await prisma.contactMessage.findUnique({
      where: { id },
    })

    if (!message) {
      throw new AppError(404, 'MESSAGE_NOT_FOUND', 'Сообщение не найдено')
    }

    const updated = await prisma.contactMessage.update({
      where: { id },
      data: { isRead: true },
    })

    return updated
  }

  async markAsReplied(id: string, adminNote?: string) {
    const message = await prisma.contactMessage.findUnique({
      where: { id },
    })

    if (!message) {
      throw new AppError(404, 'MESSAGE_NOT_FOUND', 'Сообщение не найдено')
    }

    const updated = await prisma.contactMessage.update({
      where: { id },
      data: { 
        isReplied: true,
        isRead: true,
        adminNote: adminNote || null,
      },
    })

    return updated
  }

  async updateAdminNote(id: string, adminNote: string) {
    const message = await prisma.contactMessage.findUnique({
      where: { id },
    })

    if (!message) {
      throw new AppError(404, 'MESSAGE_NOT_FOUND', 'Сообщение не найдено')
    }

    const updated = await prisma.contactMessage.update({
      where: { id },
      data: { adminNote },
    })

    return updated
  }

  async deleteMessage(id: string) {
    const message = await prisma.contactMessage.findUnique({
      where: { id },
    })

    if (!message) {
      throw new AppError(404, 'MESSAGE_NOT_FOUND', 'Сообщение не найдено')
    }

    await prisma.contactMessage.delete({
      where: { id },
    })

    return { message: 'Сообщение успешно удалено' }
  }
}

export const contactService = new ContactService()
