import jwt from 'jsonwebtoken'
import { config } from '../../config/env'
import type { UserRole } from '@prisma/client'

export interface JwtPayload {
  userId: string
  role: UserRole
}

export class JwtService {
  generateAccessToken(payload: JwtPayload): string {
    const token = jwt.sign(
      payload,
      config.jwt.accessSecret,
      { expiresIn: config.jwt.accessExpiresIn } as never
    )
    return token as string
  }

  generateRefreshToken(payload: JwtPayload): string {
    const token = jwt.sign(
      payload,
      config.jwt.refreshSecret,
      { expiresIn: config.jwt.refreshExpiresIn } as never
    )
    return token as string
  }

  verifyAccessToken(token: string): JwtPayload {
    const decoded = jwt.verify(token, config.jwt.accessSecret)
    return decoded as JwtPayload
  }

  verifyRefreshToken(token: string): JwtPayload {
    const decoded = jwt.verify(token, config.jwt.refreshSecret)
    return decoded as JwtPayload
  }

  generateTokenPair(payload: JwtPayload) {
    return {
      accessToken: this.generateAccessToken(payload),
      refreshToken: this.generateRefreshToken(payload),
    }
  }
}

export const jwtService = new JwtService()
