import { prisma } from '../../shared/lib/prisma'
import { AppError } from '../../shared/middleware/errorHandler'
import type {
  CreateCourseDto,
  UpdateCourseDto,
  UpdateCourseStatusDto,
  PublishCourseDto,
  GetCoursesQuery,
  EnrollCourseDto,
  CreateReviewDto,
  UpdateReviewDto,
} from './course.schema'
import { CourseStatus, UserRole } from '@prisma/client'

class CourseService {
  /**
   * Создать новый курс (для преподавателя)
   */
  async createCourse(teacherId: string, dto: CreateCourseDto) {
    const course = await prisma.course.create({
      data: {
        teacherId,
        title: dto.title,
        description: dto.description,
        shortDescription: dto.shortDescription,
        level: dto.level,
        language: dto.language,
        category: dto.category,
        coverImage: dto.coverImage,
        previewVideo: dto.previewVideo,
        duration: dto.duration,
        price: dto.price,
        currency: dto.currency,
        tags: dto.tags,
        learningOutcomes: dto.learningOutcomes,
        prerequisites: dto.prerequisites,
      },
      include: {
        teacher: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true,
            bio: true,
          },
        },
      },
    })

    return course
  }

  /**
   * Получить список курсов с фильтрацией и пагинацией
   */
  async getCourses(query: GetCoursesQuery, userId?: string, userRole?: UserRole) {
    const { page, limit, sortBy, order, search, tags, isPublished, ...filters } = query
    const skip = (page - 1) * limit

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {
      ...filters,
    }

    // Фильтрация по публикации
    if (isPublished !== undefined) {
      where.isPublished = isPublished
    } else if (userRole === UserRole.ADMIN) {
      // Админ видит все курсы
      // Не добавляем фильтр
    } else if (userRole === UserRole.TEACHER && userId) {
      // Преподаватель видит свои курсы (все) + опубликованные других
      where.OR = [
        { teacherId: userId }, // Свои курсы (любые)
        { isPublished: true, status: CourseStatus.PUBLISHED }, // Опубликованные других
      ]
    } else {
      // Обычные пользователи видят только опубликованные курсы
      where.isPublished = true
      where.status = CourseStatus.PUBLISHED
    }

    // Поиск по названию и описанию
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { shortDescription: { contains: search, mode: 'insensitive' } },
      ]
    }

    // Фильтрация по тегам
    if (tags) {
      where.tags = { hasSome: tags.split(',') }
    }

    // Фильтрация по цене
    if (query.minPrice !== undefined || query.maxPrice !== undefined) {
      where.price = {}
      if (query.minPrice !== undefined) where.price.gte = query.minPrice
      if (query.maxPrice !== undefined) where.price.lte = query.maxPrice
    }

    const [courses, total] = await Promise.all([
      prisma.course.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: order },
        include: {
          teacher: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              avatar: true,
              bio: true,
            },
          },
          _count: {
            select: {
              lessons: true,
              enrollments: true,
              reviews: true,
            },
          },
        },
      }),
      prisma.course.count({ where }),
    ])

    // Проверка зачисления пользователя
    let coursesWithEnrollment = courses

    if (userId) {
      const enrollments = await prisma.enrollment.findMany({
        where: {
          userId,
          courseId: { in: courses.map((c) => c.id) },
        },
        select: { courseId: true, progress: true, enrolledAt: true, completedAt: true },
      })

      const enrollmentMap = new Map(enrollments.map((e) => [e.courseId, e]))

      coursesWithEnrollment = courses.map((course) => ({
        ...course,
        isEnrolled: enrollmentMap.has(course.id),
        enrollment: enrollmentMap.get(course.id) || null,
      }))
    }

    return {
      data: coursesWithEnrollment,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }
  }

  /**
   * Получить курс по ID
   */
  async getCourseById(courseId: string, userId?: string, userRole?: UserRole) {
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        teacher: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true,
            bio: true,
          },
        },
        lessons: {
          where: {
            isPublished: true,
          },
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
        },
        reviews: {
          where: { isVisible: true },
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true,
                role: true,
              },
            },
          },
        },
        _count: {
          select: {
            lessons: true,
            enrollments: true,
            reviews: true,
          },
        },
      },
    })

    if (!course) {
      throw new AppError(404, 'COURSE_NOT_FOUND', 'Курс не найден')
    }

    // Проверка зачисления
    let enrollment = null
    let userProgress = null

    if (userId) {
      enrollment = await prisma.enrollment.findUnique({
        where: {
          userId_courseId: {
            userId,
            courseId,
          },
        },
      })

      if (enrollment) {
        // Получить прогресс по урокам
        userProgress = await prisma.progress.findMany({
          where: {
            userId,
            lesson: {
              courseId,
            },
          },
          select: {
            lessonId: true,
            isCompleted: true,
            score: true,
            timeSpent: true,
          },
        })
      }
    }

    // Проверка доступа к неопубликованному курсу
    if (!course.isPublished) {
      // Доступ к неопубликованному курсу имеют:
      // 1. Админ
      // 2. Создатель курса
      // 3. Записавшиеся студенты
      const hasAccess =
        userRole === UserRole.ADMIN ||
        course.teacherId === userId ||
        (userId && enrollment !== null)

      if (!hasAccess) {
        throw new AppError(403, 'COURSE_NOT_PUBLISHED', 'Курс не опубликован')
      }
    }

    const progressMap = userProgress
      ? userProgress.reduce((acc: Record<string, unknown>, p: { lessonId: string; [key: string]: unknown }) => {
          acc[p.lessonId] = p
          return acc
        }, {} as Record<string, unknown>)
      : null

    return {
      ...course,
      isEnrolled: !!enrollment,
      enrollment,
      userProgress: progressMap,
    }
  }

  /**
   * Обновить курс (для преподавателя-владельца или админа)
   */
  async updateCourse(courseId: string, userId: string, userRole: UserRole, dto: UpdateCourseDto) {
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { teacherId: true },
    })

    if (!course) {
      throw new AppError(404, 'COURSE_NOT_FOUND', 'Курс не найден')
    }

    if (course.teacherId !== userId && userRole !== UserRole.ADMIN) {
      throw new AppError(403, 'ACCESS_DENIED', 'Нет доступа к редактированию этого курса')
    }

    const updatedCourse = await prisma.course.update({
      where: { id: courseId },
      data: dto,
      include: {
        teacher: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true,
          },
        },
      },
    })

    return updatedCourse
  }

  /**
   * Изменить статус курса
   */
  async updateCourseStatus(courseId: string, userId: string, userRole: UserRole, dto: UpdateCourseStatusDto) {
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { teacherId: true },
    })

    if (!course) {
      throw new AppError(404, 'COURSE_NOT_FOUND', 'Курс не найден')
    }

    if (course.teacherId !== userId && userRole !== UserRole.ADMIN) {
      throw new AppError(403, 'ACCESS_DENIED', 'Нет доступа к изменению статуса курса')
    }

    // Автоматически устанавливаем isPublished при PUBLISHED
    const updateData: { status: CourseStatus; isPublished?: boolean; publishedAt?: Date } = { 
      status: dto.status 
    }
    
    if (dto.status === CourseStatus.PUBLISHED) {
      updateData.isPublished = true
      updateData.publishedAt = new Date()
    } else if (dto.status === CourseStatus.DRAFT || dto.status === CourseStatus.ARCHIVED) {
      updateData.isPublished = false
    }

    const updatedCourse = await prisma.course.update({
      where: { id: courseId },
      data: updateData,
    })

    return updatedCourse
  }

  /**
   * Опубликовать/снять с публикации курс
   */
  async publishCourse(courseId: string, userId: string, userRole: UserRole, dto: PublishCourseDto) {
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { teacherId: true, status: true },
    })

    if (!course) {
      throw new AppError(404, 'COURSE_NOT_FOUND', 'Курс не найден')
    }

    if (course.teacherId !== userId && userRole !== UserRole.ADMIN) {
      throw new AppError(403, 'ACCESS_DENIED', 'Нет доступа к публикации курса')
    }

    // Можно публиковать только курсы со статусом IN_REVIEW или PUBLISHED
    if (dto.isPublished && course.status !== CourseStatus.IN_REVIEW && course.status !== CourseStatus.PUBLISHED) {
      throw new AppError(400, 'INVALID_STATUS', 'Курс должен быть на модерации или уже опубликован')
    }

    const updatedCourse = await prisma.course.update({
      where: { id: courseId },
      data: {
        isPublished: dto.isPublished,
        publishedAt: dto.isPublished ? new Date() : null,
        status: dto.isPublished ? CourseStatus.PUBLISHED : CourseStatus.DRAFT,
      },
    })

    return updatedCourse
  }

  /**
   * Удалить курс
   */
  async deleteCourse(courseId: string, userId: string, userRole: UserRole) {
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { teacherId: true },
    })

    if (!course) {
      throw new AppError(404, 'COURSE_NOT_FOUND', 'Курс не найден')
    }

    if (course.teacherId !== userId && userRole !== UserRole.ADMIN) {
      throw new AppError(403, 'ACCESS_DENIED', 'Нет доступа к удалению этого курса')
    }

    await prisma.course.delete({
      where: { id: courseId },
    })

    return { message: 'Курс успешно удален' }
  }

  /**
   * Зачислить пользователя на курс
   */
  async enrollCourse(userId: string, dto: EnrollCourseDto) {
    const course = await prisma.course.findUnique({
      where: { id: dto.courseId },
      select: { id: true, isPublished: true, price: true },
    })

    if (!course) {
      throw new AppError(404, 'COURSE_NOT_FOUND', 'Курс не найден')
    }

    if (!course.isPublished) {
      throw new AppError(403, 'COURSE_NOT_PUBLISHED', 'Курс не опубликован')
    }

    // Проверка, что пользователь еще не зачислен
    const existingEnrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId: dto.courseId,
        },
      },
    })

    if (existingEnrollment) {
      throw new AppError(400, 'ALREADY_ENROLLED', 'Вы уже зачислены на этот курс')
    }

    // TODO: Здесь должна быть логика оплаты для платных курсов
    // Пока зачисляем бесплатно

    const enrollment = await prisma.enrollment.create({
      data: {
        userId,
        courseId: dto.courseId,
      },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            coverImage: true,
          },
        },
      },
    })

    // Увеличить счетчик зачисленных
    await prisma.course.update({
      where: { id: dto.courseId },
      data: {
        enrolledCount: {
          increment: 1,
        },
      },
    })

    return enrollment
  }

  /**
   * Получить курсы пользователя
   */
  async getUserCourses(userId: string) {
    const enrollments = await prisma.enrollment.findMany({
      where: { userId },
      include: {
        course: {
          include: {
            teacher: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true,
              },
            },
            _count: {
              select: {
                lessons: true,
              },
            },
          },
        },
      },
      orderBy: { enrolledAt: 'desc' },
    })

    return enrollments
  }

  /**
   * Создать отзыв на курс
   */
  async createReview(userId: string, dto: CreateReviewDto, userRole?: UserRole) {
    // Проверка прав: записан на курс ИЛИ преподаватель курса ИЛИ администратор
    const isAdmin = userRole === UserRole.ADMIN

    if (!isAdmin) {
      const course = await prisma.course.findUnique({
        where: { id: dto.courseId },
        select: { teacherId: true },
      })
      const isTeacher = course?.teacherId === userId

      if (!isTeacher) {
        const enrollment = await prisma.enrollment.findUnique({
          where: { userId_courseId: { userId, courseId: dto.courseId } },
        })
        if (!enrollment) {
          throw new AppError(403, 'NOT_ENROLLED', 'Оставить отзыв могут записанные студенты, преподаватель курса и администраторы')
        }
      }
    }

    // Проверка существующего отзыва
    const existingReview = await prisma.review.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId: dto.courseId,
        },
      },
    })

    if (existingReview) {
      throw new AppError(400, 'REVIEW_EXISTS', 'Вы уже оставили отзыв на этот курс')
    }

    const review = await prisma.review.create({
      data: {
        userId,
        courseId: dto.courseId,
        rating: dto.rating,
        comment: dto.comment,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
      },
    })

    // Пересчитать средний рейтинг курса
    await this.recalculateCourseRating(dto.courseId)

    return review
  }

  /**
   * Обновить отзыв
   */
  async updateReview(reviewId: string, userId: string, dto: UpdateReviewDto) {
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
      select: { userId: true, courseId: true },
    })

    if (!review) {
      throw new AppError(404, 'REVIEW_NOT_FOUND', 'Отзыв не найден')
    }

    if (review.userId !== userId) {
      throw new AppError(403, 'ACCESS_DENIED', 'Нет доступа к редактированию этого отзыва')
    }

    const updatedReview = await prisma.review.update({
      where: { id: reviewId },
      data: dto,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
      },
    })

    // Пересчитать средний рейтинг курса
    await this.recalculateCourseRating(review.courseId)

    return updatedReview
  }

  /**
   * Удалить отзыв
   */
  async deleteReview(reviewId: string, userId: string, userRole: UserRole) {
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
      select: { userId: true, courseId: true },
    })

    if (!review) {
      throw new AppError(404, 'REVIEW_NOT_FOUND', 'Отзыв не найден')
    }

    if (review.userId !== userId && userRole !== UserRole.ADMIN) {
      throw new AppError(403, 'ACCESS_DENIED', 'Нет доступа к удалению этого отзыва')
    }

    await prisma.review.delete({
      where: { id: reviewId },
    })

    // Пересчитать средний рейтинг курса
    await this.recalculateCourseRating(review.courseId)

    return { message: 'Отзыв успешно удален' }
  }

  /**
   * Пересчитать средний рейтинг и количество отзывов курса
   */
  private async recalculateCourseRating(courseId: string) {
    const reviews = await prisma.review.findMany({
      where: { courseId, isVisible: true },
      select: { rating: true },
    })

    const averageRating = reviews.length > 0
      ? reviews.reduce((sum: number, r) => sum + r.rating, 0) / reviews.length
      : null

    await prisma.course.update({
      where: { id: courseId },
      data: {
        averageRating,
        reviewsCount: reviews.length,
      },
    })
  }
}

export const courseService = new CourseService()
