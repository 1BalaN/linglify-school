import { Prisma, CourseLevel, PlacementSessionStatus, PlacementQuestionType } from '@prisma/client'
import { prisma } from '../../shared/lib/prisma'
import { AppError } from '../../shared/middleware/errorHandler'
import { platformSettingsService } from '../settings/platformSettings.service'
import type {
  StartPlacementDto,
  SubmitPlacementAnswerDto,
  GetPlacementQuestionsQuery,
  CreatePlacementQuestionDto,
  UpdatePlacementQuestionDto,
} from './placement.schema'

const MAX_DURATION_MINUTES = 25
const STREAK_TO_INCREASE = 2
const STREAK_TO_DECREASE = 2

export class PlacementService {
  async startSession(userId: string | null, dto: StartPlacementDto) {
    const settings = await platformSettingsService.getSettings()
    const allowedLanguages = settings.placementAllowedLanguages

    if (Array.isArray(allowedLanguages) && allowedLanguages.length > 0) {
      const isAllowed = allowedLanguages.includes(dto.language)
      if (!isAllowed) {
        throw new AppError(
          400,
          'PLACEMENT_LANGUAGE_NOT_ALLOWED',
          'Для выбранного языка placement-тест сейчас недоступен'
        )
      }
    }

    const maxQuestions = settings.placementDefaultQuestions || 25

    const now = new Date()

    const session = await prisma.placementSession.create({
      data: {
        userId: userId ?? undefined,
        language: dto.language,
        status: PlacementSessionStatus.IN_PROGRESS,
        startedAt: now,
        currentDifficulty: 3,
      },
    })

    const firstQuestion = await this.pickNextQuestion(session.id, dto.language, 3, [])

    if (!firstQuestion) {
      throw new AppError(
        400,
        'PLACEMENT_QUESTION_BANK_EMPTY',
        'Для выбранного языка пока нет вопросов для placement-теста'
      )
    }

    return {
      session,
      question: firstQuestion,
      questionIndex: 1,
      maxQuestions,
    }
  }

  private async pickNextQuestion(
    sessionId: string,
    language: string,
    targetDifficulty: number,
    excludeQuestionIds: string[]
  ) {
    const difficultyRange: number[] = []

    for (let delta = 0; delta <= 2; delta++) {
      const up = targetDifficulty + delta
      const down = targetDifficulty - delta
      if (down >= 1 && !difficultyRange.includes(down)) difficultyRange.push(down)
      if (up <= 6 && !difficultyRange.includes(up)) difficultyRange.push(up)
    }

    let candidates = await prisma.placementQuestion.findMany({
      where: {
        language,
        difficulty: { in: difficultyRange },
        id: { notIn: excludeQuestionIds },
      },
      orderBy: [
        { difficulty: 'asc' },
        { createdAt: 'asc' },
      ],
    })

    if (!candidates.length) {
      // Если в диапазоне сложностей больше нет вопросов,
      // используем любой оставшийся вопрос по этому языку,
      // чтобы добрать до нужного количества (например, 25).
      candidates = await prisma.placementQuestion.findMany({
        where: {
          language,
          id: { notIn: excludeQuestionIds },
        },
        orderBy: [
          { difficulty: 'asc' },
          { createdAt: 'asc' },
        ],
      })
    }

    if (!candidates.length) {
      return null
    }

    const randomIndex = Math.floor(Math.random() * candidates.length)
    const question = candidates[randomIndex]

    return {
      id: question.id,
      language: question.language,
      type: question.type,
      difficulty: question.difficulty,
      prompt: question.prompt,
      context: question.context,
      mediaUrl: question.mediaUrl,
      options: question.options,
    }
  }

  private calculateNextDifficulty(
    currentDifficulty: number | null,
    recentAnswers: { isCorrect: boolean }[]
  ): number {
    const base = currentDifficulty ?? 3

    if (recentAnswers.length === 0) {
      return base
    }

    const lastTwo = recentAnswers.slice(-STREAK_TO_INCREASE)
    const lastTwoIncorrect = recentAnswers.slice(-STREAK_TO_DECREASE)

    if (lastTwo.length === STREAK_TO_INCREASE && lastTwo.every(a => a.isCorrect)) {
      return Math.min(6, base + 1)
    }

    if (lastTwoIncorrect.length === STREAK_TO_DECREASE && lastTwoIncorrect.every(a => !a.isCorrect)) {
      return Math.max(1, base - 1)
    }

    return base
  }

  private mapScoreToLevel(rawScore: number, totalQuestions: number): CourseLevel {
    if (totalQuestions <= 0) {
      return CourseLevel.A1
    }

    const percent = (rawScore / (totalQuestions * 6)) * 100

    if (percent < 25) return CourseLevel.A1
    if (percent < 40) return CourseLevel.A2
    if (percent < 60) return CourseLevel.B1
    if (percent < 75) return CourseLevel.B2
    if (percent < 90) return CourseLevel.C1
    return CourseLevel.C2
  }

  async submitAnswer(userId: string | null, dto: SubmitPlacementAnswerDto) {
    const settings = await platformSettingsService.getSettings()
    const maxQuestions = settings.placementDefaultQuestions || 25
    const session = await prisma.placementSession.findUnique({
      where: { id: dto.sessionId },
      include: { answers: true },
    })

    if (!session) {
      throw new AppError(404, 'PLACEMENT_SESSION_NOT_FOUND', 'Сессия placement-теста не найдена')
    }

    if (session.status === PlacementSessionStatus.COMPLETED) {
      throw new AppError(400, 'PLACEMENT_SESSION_COMPLETED', 'Эта сессия уже завершена')
    }

    if (session.userId && userId && session.userId !== userId) {
      throw new AppError(403, 'ACCESS_DENIED', 'Нет доступа к этой сессии placement-теста')
    }

    const elapsedMinutes = (Date.now() - session.startedAt.getTime()) / (60 * 1000)
    const timeExceeded = elapsedMinutes > MAX_DURATION_MINUTES

    const question = await prisma.placementQuestion.findUnique({
      where: { id: dto.questionId },
    })

    if (!question || question.language !== session.language) {
      throw new AppError(400, 'PLACEMENT_INVALID_QUESTION', 'Некорректный вопрос для этой сессии')
    }

    if (dto.optionIndex < 0 || dto.optionIndex >= question.options.length) {
      throw new AppError(400, 'PLACEMENT_INVALID_ANSWER', 'Некорректный вариант ответа')
    }

    const isCorrect = dto.optionIndex === question.correctOptionIndex

    const answer = await prisma.placementAnswer.create({
      data: {
        sessionId: session.id,
        questionId: question.id,
        givenOptionIndex: dto.optionIndex,
        isCorrect,
        timeMs: dto.timeMs,
      },
    })

    const allAnswers = [...session.answers, answer]
    const totalQuestions = allAnswers.length

    const rawScore = allAnswers.reduce((sum, a) => {
      if (!a.isCorrect) return sum
      const related = a.questionId === question.id ? question : null
      const difficulty = (related as { difficulty?: number } | null)?.difficulty ?? session.currentDifficulty ?? 3
      return sum + difficulty
    }, 0)

    const recentAnswers = allAnswers.slice(-3).map(a => ({ isCorrect: a.isCorrect }))
    const nextDifficulty = this.calculateNextDifficulty(session.currentDifficulty, recentAnswers)

    const shouldFinishByCount = totalQuestions >= maxQuestions
    const shouldFinishByTime = timeExceeded
    const shouldFinish = shouldFinishByCount || shouldFinishByTime

    if (shouldFinish) {
      const estimatedLevel = this.mapScoreToLevel(rawScore, totalQuestions)

      const updatedSession = await prisma.placementSession.update({
        where: { id: session.id },
        data: {
          status: PlacementSessionStatus.COMPLETED,
          finishedAt: new Date(),
          rawScore,
          totalQuestions,
          estimatedLevel,
          currentDifficulty: nextDifficulty,
        },
      })

      return {
        finished: true,
        session: updatedSession,
        result: {
          estimatedLevel,
          rawScore,
          totalQuestions,
        },
      }
    }

    const excludeIds = allAnswers.map(a => a.questionId)
    const nextQuestion = await this.pickNextQuestion(session.id, session.language, nextDifficulty, excludeIds)

    const updatedSession = await prisma.placementSession.update({
      where: { id: session.id },
      data: {
        currentDifficulty: nextDifficulty,
        rawScore,
        totalQuestions,
      },
    })

    if (!nextQuestion) {
      const estimatedLevel = this.mapScoreToLevel(rawScore, totalQuestions)

      const completed = await prisma.placementSession.update({
        where: { id: session.id },
        data: {
          status: PlacementSessionStatus.COMPLETED,
          finishedAt: new Date(),
          estimatedLevel,
        },
      })

      return {
        finished: true,
        session: completed,
        result: {
          estimatedLevel,
          rawScore,
          totalQuestions,
        },
      }
    }

    return {
      finished: false,
      session: updatedSession,
      question: nextQuestion,
      questionIndex: totalQuestions + 1,
      maxQuestions,
    }
  }

  async getResult(sessionId: string, userId: string | null) {
    const session = await prisma.placementSession.findUnique({
      where: { id: sessionId },
      include: {
        answers: {
          include: {
            question: true,
          },
        },
      },
    })

    if (!session) {
      throw new AppError(404, 'PLACEMENT_SESSION_NOT_FOUND', 'Сессия placement-теста не найдена')
    }

    if (session.userId && userId && session.userId !== userId) {
      throw new AppError(403, 'ACCESS_DENIED', 'Нет доступа к этой сессии placement-теста')
    }

    if (session.status !== PlacementSessionStatus.COMPLETED) {
      throw new AppError(400, 'PLACEMENT_SESSION_NOT_COMPLETED', 'Сессия ещё не завершена')
    }

    const level = session.estimatedLevel ?? this.mapScoreToLevel(session.rawScore, session.totalQuestions)

    return {
      session: {
        id: session.id,
        language: session.language,
        status: session.status,
        startedAt: session.startedAt,
        finishedAt: session.finishedAt,
        estimatedLevel: level,
        rawScore: session.rawScore,
        totalQuestions: session.totalQuestions,
      },
      answers: session.answers.map(a => ({
        id: a.id,
        questionId: a.questionId,
        isCorrect: a.isCorrect,
        givenOptionIndex: a.givenOptionIndex,
        timeMs: a.timeMs,
        question: {
          type: a.question.type,
          difficulty: a.question.difficulty,
          prompt: a.question.prompt,
          context: a.question.context,
          mediaUrl: a.question.mediaUrl,
          options: a.question.options,
          correctOptionIndex: a.question.correctOptionIndex,
          explanation: a.question.explanation,
        },
      })),
    }
  }

  async getRecommendedCourses(language: string, level: CourseLevel) {
    const settings = await platformSettingsService.getSettings()

    const defaultLevelOrder: CourseLevel[] = [
      CourseLevel.A1,
      CourseLevel.A2,
      CourseLevel.B1,
      CourseLevel.B2,
      CourseLevel.C1,
      CourseLevel.C2,
    ]

    let allowedLevels: CourseLevel[]

    if (settings.placementRecommendationMap) {
      const map = settings.placementRecommendationMap as Record<
        CourseLevel,
        CourseLevel[]
      >
      allowedLevels = map[level] && map[level].length > 0 ? map[level] : [level]
    } else {
      const levelIndex = defaultLevelOrder.indexOf(level)
      allowedLevels = defaultLevelOrder.filter((_, idx) => Math.abs(idx - levelIndex) <= 1)
    }

    const courses = await prisma.course.findMany({
      where: {
        isPublished: true,
        status: 'PUBLISHED',
        language,
        level: { in: allowedLevels },
      },
      orderBy: [
        { averageRating: 'desc' },
        { enrolledCount: 'desc' },
      ],
      take: 6,
      select: {
        id: true,
        title: true,
        shortDescription: true,
        level: true,
        language: true,
        coverImage: true,
        enrolledCount: true,
        averageRating: true,
      },
    })

    return courses
  }

  async listQuestions(query: GetPlacementQuestionsQuery) {
    const {
      page,
      limit,
      language,
      type,
      difficulty,
    } = query

    const skip = (page - 1) * limit

    const where: Prisma.PlacementQuestionWhereInput = {}

    if (language) where.language = language
    if (type) where.type = type as PlacementQuestionType
    if (typeof difficulty === 'number') where.difficulty = difficulty

    const [items, total] = await Promise.all([
      prisma.placementQuestion.findMany({
        where,
        skip,
        take: limit,
        orderBy: [
          { language: 'asc' },
          { type: 'asc' },
          { difficulty: 'asc' },
          { createdAt: 'asc' },
        ],
      }),
      prisma.placementQuestion.count({ where }),
    ])

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }
  }

  async createQuestion(dto: CreatePlacementQuestionDto) {
    const question = await prisma.placementQuestion.create({
      data: {
        language: dto.language,
        type: dto.type as PlacementQuestionType,
        difficulty: dto.difficulty,
        prompt: dto.prompt,
        context: dto.context,
        mediaUrl: dto.mediaUrl,
        options: dto.options,
        correctOptionIndex: dto.correctOptionIndex,
        explanation: dto.explanation,
      },
    })

    return question
  }

  async updateQuestion(id: string, dto: UpdatePlacementQuestionDto) {
    const existing = await prisma.placementQuestion.findUnique({ where: { id } })
    if (!existing) {
      throw new AppError(404, 'PLACEMENT_QUESTION_NOT_FOUND', 'Вопрос placement-теста не найден')
    }

    const merged = {
      ...existing,
      ...dto,
    }

    if (
      merged.correctOptionIndex < 0 ||
      merged.correctOptionIndex >= merged.options.length
    ) {
      throw new AppError(
        400,
        'PLACEMENT_INVALID_CORRECT_INDEX',
        'Индекс правильного ответа выходит за пределы массива options'
      )
    }

    const updated = await prisma.placementQuestion.update({
      where: { id },
      data: {
        language: dto.language ?? existing.language,
        type: (dto.type as PlacementQuestionType | undefined) ?? existing.type,
        difficulty: dto.difficulty ?? existing.difficulty,
        prompt: dto.prompt ?? existing.prompt,
        context: dto.context ?? existing.context,
        mediaUrl: dto.mediaUrl ?? existing.mediaUrl,
        options: dto.options ?? existing.options,
        correctOptionIndex: dto.correctOptionIndex ?? existing.correctOptionIndex,
        explanation: dto.explanation ?? existing.explanation,
      },
    })

    return updated
  }

  async deleteQuestion(id: string) {
    await prisma.placementQuestion.delete({
      where: { id },
    })
    return { message: 'Вопрос placement-теста удалён' }
  }
}

export const placementService = new PlacementService()

