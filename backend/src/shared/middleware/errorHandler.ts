import { Request, Response, NextFunction } from 'express'
import { ZodError } from 'zod'

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  console.error('Error:', err)

  // AppError - наши кастомные ошибки
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: {
        code: err.code,
        message: err.message,
      },
    })
  }

  // Zod валидация
  if (err instanceof ZodError) {
    const firstError = err.errors[0]
    const fieldName = firstError.path.join('.')
    const errorMessage = firstError.message
    
    return res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: `Ошибка валидации${fieldName ? ` в поле "${fieldName}"` : ''}: ${errorMessage}`,
        details: err.errors,
      },
    })
  }

  // Prisma ошибки
  if (err.name === 'PrismaClientKnownRequestError') {
    interface PrismaError extends Error {
      code: string
      meta?: {
        target?: string[]
      }
    }
    
    const prismaError = err as PrismaError
    
    // Нарушение уникальности
    if (prismaError.code === 'P2002') {
      const field = prismaError.meta?.target?.[0] || 'значение'
      return res.status(409).json({
        error: {
          code: 'UNIQUE_CONSTRAINT_VIOLATION',
          message: `Такое ${field === 'email' ? 'email' : field === 'phone' ? 'номер телефона' : 'значение'} уже существует`,
        },
      })
    }

    // Запись не найдена
    if (prismaError.code === 'P2025') {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'Запись не найдена',
        },
      })
    }
  }

  // JWT ошибки
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: {
        code: 'INVALID_TOKEN',
        message: 'Недействительный токен авторизации',
      },
    })
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: {
        code: 'TOKEN_EXPIRED',
        message: 'Токен авторизации истек. Пожалуйста, войдите снова',
      },
    })
  }

  // PayloadTooLargeError - слишком большой запрос
  if (err.name === 'PayloadTooLargeError') {
    return res.status(413).json({
      error: {
        code: 'PAYLOAD_TOO_LARGE',
        message: 'Размер загружаемого файла слишком большой. Максимум 10 МБ',
      },
    })
  }

  // Неизвестная ошибка
  return res.status(500).json({
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Произошла внутренняя ошибка сервера. Пожалуйста, попробуйте позже',
    },
  })
}
