import { prisma } from '../../shared/lib/prisma'
import { jwtService } from '../../shared/lib/jwt'
import { AppError } from '../../shared/middleware/errorHandler'
import { config } from '../../config/env'

interface GoogleUserInfo {
  email: string
  given_name?: string
  family_name?: string
  picture?: string
  sub: string
}

export class OAuthService {
  async getGoogleAuthUrl(): Promise<string> {
    const { clientId, redirectUri } = config.oauth.google

    if (!clientId || !redirectUri) {
      throw new AppError(500, 'OAUTH_NOT_CONFIGURED', 'Google OAuth not configured')
    }

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'openid email profile',
      access_type: 'offline',
      prompt: 'consent',
    })

    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
  }

  async handleGoogleCallback(code: string) {
    const { clientId, clientSecret, redirectUri } = config.oauth.google

    if (!clientId || !clientSecret || !redirectUri) {
      throw new AppError(500, 'OAUTH_NOT_CONFIGURED', 'Google OAuth not configured')
    }

    // Обмен code на access_token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    })

    if (!tokenResponse.ok) {
      throw new AppError(400, 'OAUTH_TOKEN_ERROR', 'Failed to exchange code for token')
    }

    const tokenData = (await tokenResponse.json()) as { access_token: string }
    const accessToken = tokenData.access_token

    // Получение информации о пользователе
    const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    })

    if (!userResponse.ok) {
      throw new AppError(400, 'OAUTH_USER_ERROR', 'Failed to get user info')
    }

    const userInfo = (await userResponse.json()) as GoogleUserInfo

    // Найти или создать пользователя
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: userInfo.email },
          { oauthProvider: 'GOOGLE', oauthId: userInfo.sub },
        ],
      },
    })

    if (!user) {
      // Создаем нового пользователя через OAuth
      user = await prisma.user.create({
        data: {
          email: userInfo.email,
          firstName: userInfo.given_name,
          lastName: userInfo.family_name,
          avatar: userInfo.picture,
          oauthProvider: 'GOOGLE',
          oauthId: userInfo.sub,
          isEmailVerified: true, // Google emails уже верифицированы
          role: 'STUDENT',
        },
      })
    } else if (!user.oauthProvider) {
      // Привязываем Google к существующему аккаунту
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          oauthProvider: 'GOOGLE',
          oauthId: userInfo.sub,
          isEmailVerified: true,
          avatar: user.avatar ?? userInfo.picture,
        },
      })
    }

    // Генерируем токены
    const tokens = jwtService.generateTokenPair({
      userId: user.id,
      role: user.role,
    })

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        avatar: user.avatar,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        isPhoneVerified: user.isPhoneVerified,
      },
      tokens,
    }
  }
}

export const oauthService = new OAuthService()
