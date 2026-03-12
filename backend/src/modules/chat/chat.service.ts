import { ChatMessageType, ChatThreadType, UserRole, Prisma } from '@prisma/client'
import { prisma } from '../../shared/lib/prisma'
import type { CreateMessageDto } from './chat.schema'
import { AppError } from '../../shared/middleware/errorHandler'
import { getSocketServer } from '../../shared/lib/socket'

export class ChatService {
  async getMyThreads(userId: string, role: UserRole) {
    const where =
      role === UserRole.TEACHER
        ? {
            OR: [
              { teacherId: userId },
              { type: ChatThreadType.SUPPORT, userId },
            ],
          }
        : role === UserRole.ADMIN
          ? {
              // Админ видит только чаты поддержки, без диалогов студент ↔ преподаватель по курсу
              type: ChatThreadType.SUPPORT,
            }
          : {
              OR: [
                { studentId: userId },
                { type: ChatThreadType.SUPPORT, userId },
              ],
            }

    const threads = await prisma.chatThread.findMany({
      where,
      orderBy: { lastMessageAt: 'desc' },
      include: {
        course: {
          select: {
            id: true,
            title: true,
          },
        },
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true,
          },
        },
        teacher: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true,
          },
        },
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true,
          },
        },
      },
      take: 100,
    })

    return { data: threads }
  }

  async getThreadMessages(threadId: string, limit: number, cursor?: string) {
    const thread = await prisma.chatThread.findUnique({
      where: { id: threadId },
      select: { id: true },
    })

    if (!thread) {
      throw new AppError(404, 'CHAT_NOT_FOUND', 'Чат не найден')
    }

    const messages = await prisma.chatMessage.findMany({
      where: { threadId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      ...(cursor && { skip: 1, cursor: { id: cursor } }),
    })

    return { data: messages }
  }

  async ensureCourseDmThread(studentId: string, courseId: string) {
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { id: true, teacherId: true, title: true },
    })

    if (!course) {
      throw new AppError(404, 'COURSE_NOT_FOUND', 'Курс не найден')
    }

    const existing = await prisma.chatThread.findFirst({
      where: {
        type: ChatThreadType.COURSE_DM,
        courseId: course.id,
        studentId,
        teacherId: course.teacherId,
      },
    })

    if (existing) return existing

    const thread = await prisma.chatThread.create({
      data: {
        type: ChatThreadType.COURSE_DM,
        courseId: course.id,
        studentId,
        teacherId: course.teacherId,
      },
    })

    return thread
  }

  async ensureSupportThread(userId: string) {
    const existing = await prisma.chatThread.findFirst({
      where: {
        type: ChatThreadType.SUPPORT,
        userId,
      },
    })

    if (existing) return existing

    const thread = await prisma.chatThread.create({
      data: {
        type: ChatThreadType.SUPPORT,
        userId,
      },
    })

    return thread
  }

  async sendMessage(threadId: string, senderId: string, dto: CreateMessageDto) {
    const thread = await prisma.chatThread.findUnique({
      where: { id: threadId },
    })

    if (!thread) {
      throw new AppError(404, 'CHAT_NOT_FOUND', 'Чат не найден')
    }

    const message = await prisma.chatMessage.create({
      data: {
        threadId,
        senderId: senderId || null,
        type: ChatMessageType.USER,
        text: dto.text.trim(),
        attachments: dto.attachments ?? null,
      } as Prisma.ChatMessageUncheckedCreateInput,
    })

    let hasUnreadForStudent = thread.hasUnreadForStudent
    let hasUnreadForTeacher = thread.hasUnreadForTeacher
    let hasUnreadForAdmin = thread.hasUnreadForAdmin

    if (thread.type === ChatThreadType.COURSE_DM) {
      if (senderId !== thread.studentId) {
        hasUnreadForStudent = true
      }
      if (senderId !== thread.teacherId) {
        hasUnreadForTeacher = true
      }
    }

    if (thread.type === ChatThreadType.SUPPORT) {
      if (senderId === thread.userId) {
        // пользователь написал в поддержку → есть непрочитанные у админа
        hasUnreadForAdmin = true
      } else {
        // админ ответил пользователю → есть непрочитанные у пользователя
        hasUnreadForStudent = true
      }
    }

    await prisma.chatThread.update({
      where: { id: threadId },
      data: {
        lastMessageAt: message.createdAt,
        hasUnreadForStudent,
        hasUnreadForTeacher,
        hasUnreadForAdmin,
      },
    })

    const io = getSocketServer()
    if (io) {
      io.to(`thread:${threadId}`).emit('chat:message:new', { threadId, message })
      if (thread.studentId) {
        io.to(`user:${thread.studentId}`).emit('chat:thread:update', { threadId })
      }
      if (thread.teacherId) {
        io.to(`user:${thread.teacherId}`).emit('chat:thread:update', { threadId })
      }
      if (thread.userId) {
        io.to(`user:${thread.userId}`).emit('chat:thread:update', { threadId })
      }
    }

    return { data: message }
  }

  async markThreadAsRead(threadId: string, userId: string) {
    const thread = await prisma.chatThread.findUnique({
      where: { id: threadId },
    })

    if (!thread) {
      throw new AppError(404, 'CHAT_NOT_FOUND', 'Чат не найден')
    }

    const isStudent = thread.studentId === userId
    const isTeacher = thread.teacherId === userId
    const isSupportUser = thread.type === ChatThreadType.SUPPORT && thread.userId === userId
    const isAdminInSupport = thread.type === ChatThreadType.SUPPORT && thread.userId !== userId

    await prisma.chatMessage.updateMany({
      where: { threadId, isRead: false, senderId: { not: userId } },
      data: { isRead: true, readAt: new Date() },
    })

    await prisma.chatThread.update({
      where: { id: threadId },
      data: {
        ...(isStudent && { hasUnreadForStudent: false }),
        ...(isTeacher && { hasUnreadForTeacher: false }),
        ...(isSupportUser && { hasUnreadForStudent: false }),
        ...(isAdminInSupport && { hasUnreadForAdmin: false }),
      },
    })

    const io = getSocketServer()
    if (io) {
      io.to(`thread:${threadId}`).emit('chat:thread:read', { threadId, userId })
    }

    return { message: 'ok' }
  }

  async createSystemMessageForEnrollment(userId: string, courseId: string) {
    const thread = await this.ensureCourseDmThread(userId, courseId)

    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { title: true },
    })

    if (!course) return

    const text = `Вы записаны на курс «${course.title}». Если возникнут вопросы по занятиям, вы можете задать их здесь.`

    const message = await prisma.chatMessage.create({
      data: {
        threadId: thread.id,
        type: ChatMessageType.SYSTEM,
        text,
        attachments: null,
      } as Prisma.ChatMessageUncheckedCreateInput,
    })

    await prisma.chatThread.update({
      where: { id: thread.id },
      data: {
        lastMessageAt: message.createdAt,
        hasUnreadForStudent: true,
      },
    })

    const io = getSocketServer()
    if (io) {
      io.to(`thread:${thread.id}`).emit('chat:message:new', { threadId: thread.id, message })
      if (thread.studentId) {
        io.to(`user:${thread.studentId}`).emit('chat:thread:update', { threadId: thread.id })
      }
    }
  }

  async createSystemMessageForCourseArchived(courseId: string) {
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { id: true, title: true },
    })

    if (!course) return

    const enrollments = await prisma.enrollment.findMany({
      where: { courseId },
      select: { userId: true },
    })

    if (!enrollments.length) return

    const text = `Курс «${course.title}» переведён в архив. Материалы курса останутся доступны в вашем аккаунте, но запись на курс будет уже невозможна.`

    for (const enrollment of enrollments) {
      const thread = await this.ensureCourseDmThread(enrollment.userId, courseId)

      const message = await prisma.chatMessage.create({
        data: {
          threadId: thread.id,
          type: ChatMessageType.SYSTEM,
          text,
          attachments: null,
        } as Prisma.ChatMessageUncheckedCreateInput,
      })

      await prisma.chatThread.update({
        where: { id: thread.id },
        data: {
          lastMessageAt: message.createdAt,
          hasUnreadForStudent: true,
        },
      })

      const io = getSocketServer()
      if (io) {
        io.to(`thread:${thread.id}`).emit('chat:message:new', { threadId: thread.id, message })
        if (thread.studentId) {
          io.to(`user:${thread.studentId}`).emit('chat:thread:update', { threadId: thread.id })
        }
      }
    }
  }

  async createSystemMessageForCertificateIssued(userId: string, courseId: string, certificateCode: string) {
    const thread = await this.ensureCourseDmThread(userId, courseId)

    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { title: true },
    })

    if (!course) return

    const text = `Поздравляем! Вы завершили курс «${course.title}» и вам выдан сертификат (код: ${certificateCode}). Вы можете найти его в разделе «Мои сертификаты».`

    const message = await prisma.chatMessage.create({
      data: {
        threadId: thread.id,
        type: ChatMessageType.SYSTEM,
        text,
        attachments: null,
      } as Prisma.ChatMessageUncheckedCreateInput,
    })

    await prisma.chatThread.update({
      where: { id: thread.id },
      data: {
        lastMessageAt: message.createdAt,
        hasUnreadForStudent: true,
      },
    })

    const io = getSocketServer()
    if (io) {
      io.to(`thread:${thread.id}`).emit('chat:message:new', { threadId: thread.id, message })
      if (thread.studentId) {
        io.to(`user:${thread.studentId}`).emit('chat:thread:update', { threadId: thread.id })
      }
    }
  }
}

export const chatService = new ChatService()

