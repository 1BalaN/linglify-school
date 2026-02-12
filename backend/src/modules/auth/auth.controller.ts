import type { Request, Response } from 'express'
import { authService } from './auth.service'
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  verifyEmailSchema,
  resendVerificationSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  updateProfileSchema,
  changePasswordSchema,
  sendPhoneVerificationSchema,
  verifyPhoneSchema,
} from './auth.schema'

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000

export class AuthController {
  async register(req: Request, res: Response): Promise<void> {
    const data = registerSchema.parse(req.body)
    const result = await authService.register(data)

    res.cookie('refreshToken', result.tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: SEVEN_DAYS_MS,
    })

    res.status(201).json({
      data: {
        user: result.user,
        accessToken: result.tokens.accessToken,
      },
    })
  }

  async login(req: Request, res: Response): Promise<void> {
    const data = loginSchema.parse(req.body)
    const result = await authService.login(data)

    res.cookie('refreshToken', result.tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: SEVEN_DAYS_MS,
    })

    res.json({
      data: {
        user: result.user,
        accessToken: result.tokens.accessToken,
      },
    })
  }

  async verifyEmail(req: Request, res: Response): Promise<void> {
    const data = verifyEmailSchema.parse(req.body)
    const result = await authService.verifyEmail(data.token)
    res.json({ data: result })
  }

  async resendVerification(req: Request, res: Response): Promise<void> {
    const data = resendVerificationSchema.parse(req.body)
    const result = await authService.resendVerificationEmail(data.email)
    res.json({ data: result })
  }

  async forgotPassword(req: Request, res: Response): Promise<void> {
    const data = forgotPasswordSchema.parse(req.body)
    const result = await authService.forgotPassword(data)
    res.json({ data: result })
  }

  async resetPassword(req: Request, res: Response): Promise<void> {
    const data = resetPasswordSchema.parse(req.body)
    const result = await authService.resetPassword(data)
    res.json({ data: result })
  }

  async refresh(req: Request, res: Response): Promise<void> {
    const refreshToken = req.cookies.refreshToken ?? req.body.refreshToken

    if (!refreshToken) {
      res.status(401).json({
        error: {
          code: 'REFRESH_TOKEN_REQUIRED',
          message: 'Refresh token обязателен !',
        },
      })
      return
    }

    const data = refreshTokenSchema.parse({ refreshToken })
    const result = await authService.refreshToken(data.refreshToken)

    res.cookie('refreshToken', result.tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: SEVEN_DAYS_MS,
    })

    res.json({
      data: {
        accessToken: result.tokens.accessToken,
      },
    })
  }

  async logout(_req: Request, res: Response): Promise<void> {
    res.clearCookie('refreshToken')
    res.json({
      data: {
        message: 'Вы вышли из системы успешно',
      },
    })
  }

  async getCurrentUser(req: Request, res: Response): Promise<void> {
    const userId = req.user?.userId

    if (!userId) {
      res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Не авторизован',
        },
      })
      return
    }

    const user = await authService.getCurrentUser(userId)
    res.json({ data: user })
  }

  async updateProfile(req: Request, res: Response): Promise<void> {
    const userId = req.user?.userId

    if (!userId) {
      res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Не авторизован',
        },
      })
      return
    }

    const data = updateProfileSchema.parse(req.body)
    const user = await authService.updateProfile(userId, data)
    res.json({ data: user })
  }

  async changePassword(req: Request, res: Response): Promise<void> {
    const userId = req.user?.userId

    if (!userId) {
      res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Не авторизован',
        },
      })
      return
    }

    const data = changePasswordSchema.parse(req.body)
    const result = await authService.changePassword(userId, data)
    res.json({ data: result })
  }

  async sendPhoneVerification(req: Request, res: Response): Promise<void> {
    const userId = req.user?.userId

    if (!userId) {
      res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Не авторизован',
        },
      })
      return
    }

    const data = sendPhoneVerificationSchema.parse(req.body)
    const result = await authService.sendPhoneVerification(userId, data)
    res.json({ data: result })
  }

  async verifyPhone(req: Request, res: Response): Promise<void> {
    const userId = req.user?.userId

    if (!userId) {
      res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Не авторизован',
        },
      })
      return
    }

    const data = verifyPhoneSchema.parse(req.body)
    const result = await authService.verifyPhone(userId, data)
    res.json({ data: result })
  }
}

export const authController = new AuthController()
