import { prisma } from '../../shared/lib/prisma'
import { AppError } from '../../shared/middleware/errorHandler'
import type {
  CreateLessonDto,
  UpdateLessonDto,
  CreateQuestionDto,
  UpdateQuestionDto,
  SubmitAnswerDto,
  UpdateProgressDto,
} from './lesson.schema'
import { UserRole } from '@prisma/client'

class LessonService {
  /**
   * Создать урок
   */
  async createLesson(userId: string, userRole: UserRole, dto: CreateLessonDto) {
    // Проверка доступа к курсу
    const course = await prisma.course.findUnique({
      where: { id: dto.courseId },
      select: { teacherId: true },
    })

    if (!course) {
      throw new AppError(404, 'COURSE_NOT_FOUND', 'Курс не найден')
    }

    if (course.teacherId !== userId && userRole !== UserRole.ADMIN) {
      throw new AppError(403, 'ACCESS_DENIED', 'Нет доступа к созданию уроков в этом курсе')
    }

    // Определяем корректный порядок на основе существующих уроков
    const lastLesson = await prisma.lesson.findFirst({
      where: { courseId: dto.courseId },
      orderBy: { order: 'desc' },
      select: { order: true },
    })

    const nextOrder = (lastLesson?.order ?? 0) + 1

    const lesson = await prisma.lesson.create({
      data: {
        courseId: dto.courseId,
        title: dto.title,
        description: dto.description,
        order: nextOrder,
        type: dto.type,
        content: dto.content,
        videoUrl: dto.videoUrl,
        duration: dto.duration,
        attachments: dto.attachments,
        isPublished: dto.isPublished,
      },
    })

    // Обновить счетчик уроков в курсе
    await prisma.course.update({
      where: { id: dto.courseId },
      data: {
        lessonsCount: {
          increment: 1,
        },
      },
    })

    return lesson
  }

  /**
   * Получить урок по ID
   */
  async getLessonById(lessonId: string, userId?: string, userRole?: UserRole) {
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            teacherId: true,
            isPublished: true,
          },
        },
        questions: {
          orderBy: { order: 'asc' },
          select: {
            id: true,
            type: true,
            order: true,
            question: true,
            options: true,
            points: true,
            timeLimit: true,
            // Explanation скрыт до ответа
          },
        },
      },
    })

    if (!lesson) {
      throw new AppError(404, 'LESSON_NOT_FOUND', 'Урок не найден')
    }

    // Проверка доступа
    const isTeacher = lesson.course.teacherId === userId
    const isAdmin = userRole === UserRole.ADMIN
    const isEnrolled = userId ? await this.checkEnrollment(userId, lesson.course.id) : false

    // Доступ только если записан на курс (или преподаватель/админ)
    if (!isEnrolled && !isTeacher && !isAdmin) {
      throw new AppError(403, 'ACCESS_DENIED', 'Нет доступа к этому уроку. Необходимо записаться на курс.')
    }

    // Получить прогресс пользователя
    let progress = null
    if (userId) {
      progress = await prisma.progress.findUnique({
        where: {
          userId_lessonId: {
            userId,
            lessonId,
          },
        },
      })
    }

    return {
      ...lesson,
      userProgress: progress,
      hasAccess: isEnrolled || isTeacher || isAdmin,
    }
  }

  /**
   * Получить уроки курса
   */
  async getCourseLessons(courseId: string, userId?: string, userRole?: UserRole) {
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { teacherId: true, isPublished: true },
    })

    if (!course) {
      throw new AppError(404, 'COURSE_NOT_FOUND', 'Курс не найден')
    }

    const isTeacher = course.teacherId === userId
    const isAdmin = userRole === UserRole.ADMIN
    const isEnrolled = userId ? await this.checkEnrollment(userId, courseId) : false

    const lessons = await prisma.lesson.findMany({
      where: { courseId },
      orderBy: { order: 'asc' },
      select: {
        id: true,
        title: true,
        description: true,
        order: true,
        type: true,
        duration: true,
        isPublished: true,
      },
    })

    // Получить прогресс пользователя
    let progressMap = new Map()
    if (userId) {
      const progresses = await prisma.progress.findMany({
        where: {
          userId,
          courseId,
        },
        select: {
          lessonId: true,
          isCompleted: true,
          score: true,
          timeSpent: true,
        },
      })
      progressMap = new Map(progresses.map((p) => [p.lessonId, p]))
    }

    return lessons.map((lesson) => ({
      ...lesson,
      hasAccess: isEnrolled || isTeacher || isAdmin,
      progress: progressMap.get(lesson.id) || null,
    }))
  }

  /**
   * Обновить урок
   */
  async updateLesson(
    lessonId: string,
    userId: string,
    userRole: UserRole,
    dto: UpdateLessonDto
  ) {
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        course: {
          select: { teacherId: true },
        },
      },
    })

    if (!lesson) {
      throw new AppError(404, 'LESSON_NOT_FOUND', 'Урок не найден')
    }

    if (lesson.course.teacherId !== userId && userRole !== UserRole.ADMIN) {
      throw new AppError(403, 'ACCESS_DENIED', 'Нет доступа к редактированию этого урока')
    }

    const updatedLesson = await prisma.lesson.update({
      where: { id: lessonId },
      data: dto,
    })

    return updatedLesson
  }

  /**
   * Удалить урок
   */
  async deleteLesson(lessonId: string, userId: string, userRole: UserRole) {
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        course: {
          select: { id: true, teacherId: true },
        },
      },
    })

    if (!lesson) {
      throw new AppError(404, 'LESSON_NOT_FOUND', 'Урок не найден')
    }

    if (lesson.course.teacherId !== userId && userRole !== UserRole.ADMIN) {
      throw new AppError(403, 'ACCESS_DENIED', 'Нет доступа к удалению этого урока')
    }

    await prisma.lesson.delete({
      where: { id: lessonId },
    })

    // Обновить счетчик уроков в курсе
    await prisma.course.update({
      where: { id: lesson.courseId },
      data: {
        lessonsCount: {
          decrement: 1,
        },
      },
    })

    // Перенумеровать оставшиеся уроки, чтобы порядок был последовательным
    const remainingLessons = await prisma.lesson.findMany({
      where: { courseId: lesson.courseId },
      orderBy: { order: 'asc' },
      select: { id: true },
    })

    await Promise.all(
      remainingLessons.map((l, index) =>
        prisma.lesson.update({
          where: { id: l.id },
          data: { order: index + 1 },
        }),
      ),
    )

    return { message: 'Урок успешно удален' }
  }

  /**
   * Создать вопрос
   */
  async createQuestion(
    userId: string,
    userRole: UserRole,
    dto: CreateQuestionDto
  ) {
    const lesson = await prisma.lesson.findUnique({
      where: { id: dto.lessonId },
      include: {
        course: {
          select: { teacherId: true },
        },
      },
    })

    if (!lesson) {
      throw new AppError(404, 'LESSON_NOT_FOUND', 'Урок не найден')
    }

    if (lesson.course.teacherId !== userId && userRole !== UserRole.ADMIN) {
      throw new AppError(403, 'ACCESS_DENIED', 'Нет доступа к созданию вопросов в этом уроке')
    }

    const question = await prisma.question.create({
      data: {
        lessonId: dto.lessonId,
        type: dto.type,
        order: dto.order,
        question: dto.question,
        explanation: dto.explanation,
        options: dto.options || {},
        points: dto.points,
        timeLimit: dto.timeLimit,
      },
    })

    return question
  }

  /**
   * Обновить вопрос
   */
  async updateQuestion(
    questionId: string,
    userId: string,
    userRole: UserRole,
    dto: UpdateQuestionDto
  ) {
    const question = await prisma.question.findUnique({
      where: { id: questionId },
      include: {
        lesson: {
          include: {
            course: {
              select: { teacherId: true },
            },
          },
        },
      },
    })

    if (!question) {
      throw new AppError(404, 'QUESTION_NOT_FOUND', 'Вопрос не найден')
    }

    if (question.lesson.course.teacherId !== userId && userRole !== UserRole.ADMIN) {
      throw new AppError(403, 'ACCESS_DENIED', 'Нет доступа к редактированию этого вопроса')
    }

    const updatedQuestion = await prisma.question.update({
      where: { id: questionId },
      data: dto,
    })

    return updatedQuestion
  }

  /**
   * Удалить вопрос
   */
  async deleteQuestion(questionId: string, userId: string, userRole: UserRole) {
    const question = await prisma.question.findUnique({
      where: { id: questionId },
      include: {
        lesson: {
          include: {
            course: {
              select: { teacherId: true },
            },
          },
        },
      },
    })

    if (!question) {
      throw new AppError(404, 'QUESTION_NOT_FOUND', 'Вопрос не найден')
    }

    if (question.lesson.course.teacherId !== userId && userRole !== UserRole.ADMIN) {
      throw new AppError(403, 'ACCESS_DENIED', 'Нет доступа к удалению этого вопроса')
    }

    await prisma.question.delete({
      where: { id: questionId },
    })

    return { message: 'Вопрос успешно удален' }
  }

  /**
   * Отправить ответ на вопрос
   */
  async submitAnswer(userId: string, dto: SubmitAnswerDto) {
    const question = await prisma.question.findUnique({
      where: { id: dto.questionId },
      include: {
        lesson: {
          select: {
            courseId: true,
          },
        },
      },
    })

    if (!question) {
      throw new AppError(404, 'QUESTION_NOT_FOUND', 'Вопрос не найден')
    }

    // Проверка зачисления
    const isEnrolled = await this.checkEnrollment(userId, question.lesson.courseId)
    if (!isEnrolled) {
      throw new AppError(403, 'NOT_ENROLLED', 'Необходимо записаться на курс')
    }

    // Проверка правильности ответа
    const isCorrect = this.checkAnswer(question.options, dto.answer, question.type)

    // Сохранить ответ
    const answer = await prisma.answer.create({
      data: {
        userId,
        questionId: dto.questionId,
        answer: dto.answer,
        isCorrect,
      },
    })

    return {
      ...answer,
      explanation: question.explanation,
      correctAnswer: question.options,
    }
  }

  /**
   * Обновить прогресс урока
   */
  async updateProgress(userId: string, dto: UpdateProgressDto) {
    const lesson = await prisma.lesson.findUnique({
      where: { id: dto.lessonId },
      select: { courseId: true },
    })

    if (!lesson) {
      throw new AppError(404, 'LESSON_NOT_FOUND', 'Урок не найден')
    }

    // Проверка зачисления
    const isEnrolled = await this.checkEnrollment(userId, lesson.courseId)
    if (!isEnrolled) {
      throw new AppError(403, 'NOT_ENROLLED', 'Необходимо записаться на курс')
    }

    // Создать или обновить прогресс
    const progress = await prisma.progress.upsert({
      where: {
        userId_lessonId: {
          userId,
          lessonId: dto.lessonId,
        },
      },
      update: {
        ...(dto.isCompleted !== undefined && { isCompleted: dto.isCompleted }),
        ...(dto.isCompleted && { completedAt: new Date() }),
        ...(dto.timeSpent !== undefined && { timeSpent: { increment: dto.timeSpent } }),
        ...(dto.lastPosition !== undefined && { lastPosition: dto.lastPosition }),
        ...(dto.score !== undefined && { score: dto.score }),
        attempts: { increment: 1 },
      },
      create: {
        userId,
        courseId: lesson.courseId,
        lessonId: dto.lessonId,
        isCompleted: dto.isCompleted || false,
        completedAt: dto.isCompleted ? new Date() : null,
        timeSpent: dto.timeSpent || 0,
        lastPosition: dto.lastPosition || 0,
        score: dto.score,
      },
    })

    // Обновить общий прогресс курса
    if (dto.isCompleted) {
      await this.updateCourseProgress(userId, lesson.courseId)
    }

    return progress
  }

  /**
   * Получить прогресс курса
   */
  async getCourseProgress(userId: string, courseId: string) {
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
    })

    if (!enrollment) {
      throw new AppError(404, 'NOT_ENROLLED', 'Вы не зачислены на этот курс')
    }

    const progresses = await prisma.progress.findMany({
      where: {
        userId,
        courseId,
      },
      include: {
        lesson: {
          select: {
            id: true,
            title: true,
            order: true,
            duration: true,
          },
        },
      },
      orderBy: {
        lesson: {
          order: 'asc',
        },
      },
    })

    const totalLessons = await prisma.lesson.count({
      where: { courseId },
    })

    const completedLessons = progresses.filter((p) => p.isCompleted).length

    return {
      enrollment,
      progresses,
      statistics: {
        totalLessons,
        completedLessons,
        progress: totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0,
        totalTimeSpent: progresses.reduce((sum: number, p) => sum + p.timeSpent, 0),
        averageScore: progresses.length > 0
          ? progresses.reduce((sum: number, p) => sum + (p.score || 0), 0) / progresses.length
          : null,
      },
    }
  }

  /**
   * Проверка зачисления пользователя на курс
   */
  private async checkEnrollment(userId: string, courseId: string): Promise<boolean> {
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
    })

    return !!enrollment
  }

  /**
   * Проверка правильности ответа
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private checkAnswer(options: any, answer: any, type: string): boolean {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const correctOptions = options.filter((o: any) => o.isCorrect)

    switch (type) {
      case 'SINGLE_CHOICE':
      case 'TRUE_FALSE': {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return correctOptions.some((o: any) => o.id === answer)
      }

      case 'MULTIPLE_CHOICE': {
        if (!Array.isArray(answer)) return false
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const correctIds = new Set(correctOptions.map((o: any) => o.id))
        const answerIds = new Set(answer)
        return correctIds.size === answerIds.size &&
          [...correctIds].every((id) => answerIds.has(id))
      }

      case 'FILL_IN_BLANK': {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return correctOptions.some((o: any) =>
          o.text.toLowerCase() === String(answer).toLowerCase()
        )
      }

      case 'MATCHING': {
        if (!Array.isArray(answer)) return false
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return answer.every((pair: any) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const correctPair = correctOptions.find(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (o: any) => o.from === pair.from
          )
          return correctPair && correctPair.to === pair.to
        })
      }

      default:
        return false
    }
  }

  /**
   * Обновить общий прогресс курса
   */
  private async updateCourseProgress(userId: string, courseId: string) {
    const totalLessons = await prisma.lesson.count({
      where: { courseId },
    })

    const completedLessons = await prisma.progress.count({
      where: {
        userId,
        courseId,
        isCompleted: true,
      },
    })

    const progress = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0

    await prisma.enrollment.update({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
      data: {
        progress,
        ...(progress === 100 && { completedAt: new Date() }),
        ...(completedLessons === 1 && !progress && { startedAt: new Date() }),
      },
    })
  }
}

export const lessonService = new LessonService()
