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
  async getGoogleAuthUrl(mode: 'login' | 'register' = 'login'): Promise<string> {
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
      prompt: 'select_account', // Всегда показывать выбор аккаунта
      state: mode, // Передаем mode через state
    })

    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
  }

  async handleGoogleCallback(code: string, mode: 'login' | 'register' = 'login') {
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

    const tokenData = (await tokenResponse.json()) as { 
      access_token: string
      id_token: string 
    }
    const accessToken = tokenData.access_token

    // Получение информации о пользователе - используем правильный endpoint
    const userResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    })

    if (!userResponse.ok) {
      throw new AppError(400, 'OAUTH_USER_ERROR', 'Failed to get user info')
    }

    const userInfo = (await userResponse.json()) as GoogleUserInfo

    // Проверка наличия sub
    if (!userInfo.sub) {
      throw new AppError(400, 'OAUTH_MISSING_SUB', 'Google не вернул уникальный ID пользователя')
    }

    // Ищем пользователя по Google ID (самый надёжный способ)
    let user = await prisma.user.findFirst({
      where: {
        oauthProvider: 'GOOGLE',
        oauthId: userInfo.sub,
      },
    })

    // Если не нашли по Google ID, ищем по email
    if (!user) {
      user = await prisma.user.findUnique({
        where: { email: userInfo.email },
      })
    }

    if (mode === 'register') {
      // Регистрация: пользователь не должен существовать
      if (user) {
        throw new AppError(
          409,
          'USER_ALREADY_EXISTS',
          `Аккаунт с email ${userInfo.email} уже существует. Используйте форму входа.`
        )
      }

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
    } else {
      // Вход: создаем если не существует, или привязываем Google
      if (!user) {
        // Создаем нового пользователя при первом входе
        user = await prisma.user.create({
          data: {
            email: userInfo.email,
            firstName: userInfo.given_name,
            lastName: userInfo.family_name,
            avatar: userInfo.picture,
            oauthProvider: 'GOOGLE',
            oauthId: userInfo.sub,
            isEmailVerified: true,
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
