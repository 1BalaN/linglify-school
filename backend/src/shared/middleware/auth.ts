import type { Request, Response, NextFunction } from 'express'
import { jwtService } from '../lib/jwt'
import { AppError } from './errorHandler'

export const requireAuth = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader?.startsWith('Bearer ')) {
      throw new AppError(401, 'UNAUTHORIZED', 'Токен не найден')
    }

    const token = authHeader.slice(7)
    const payload = jwtService.verifyAccessToken(token)

    req.user = payload

    next()
  } catch (error) {
    if (error instanceof AppError) {
      throw error
    }
    throw new AppError(401, 'INVALID_TOKEN', 'Неверный или просроченный токен')
  }
}

export const requireRole = (...roles: string[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new AppError(401, 'UNAUTHORIZED', 'Не авторизован')
    }

    if (!roles.includes(req.user.role)) {
      throw new AppError(
        403,
        'FORBIDDEN',
        'У вас нет доступа к этому ресурсу'
      )
    }

    next()
  }
}
