import type { Request, Response } from 'express'
import { oauthService } from './oauth.service'
import { googleOAuthSchema } from './auth.schema'
import { config } from '../../config/env'

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000

export class OAuthController {
  async getGoogleAuthUrl(req: Request, res: Response): Promise<void> {
    const mode = (req.query.mode as 'login' | 'register') || 'login'
    const url = await oauthService.getGoogleAuthUrl(mode)
    res.redirect(url)
  }

  async googleCallback(req: Request, res: Response): Promise<void> {
    const { code, state } = req.query

    // Диагностическое логирование для production
    console.log('🔍 [OAuth Callback] Environment:', {
      nodeEnv: config.nodeEnv,
      isProduction: config.isProduction,
      frontendUrl: config.frontendUrl,
      redirectUri: config.oauth.google.redirectUri,
      hasClientId: !!config.oauth.google.clientId,
      hasClientSecret: !!config.oauth.google.clientSecret,
    })
    console.log('🔍 [OAuth Callback] Request:', {
      hasCode: !!code,
      state,
      origin: req.headers.origin,
      referer: req.headers.referer,
    })

    if (!code || typeof code !== 'string') {
      console.error('❌ [OAuth Callback] Missing authorization code')
      res.status(400).json({
        error: {
          code: 'MISSING_CODE',
          message: 'Код авторизации обязателен !',
        },
      })
      return
    }

    const mode = (state as 'login' | 'register') || 'login'
    const data = googleOAuthSchema.parse({ code })
    const result = await oauthService.handleGoogleCallback(data.code, mode)

    // sameSite: 'lax' используется для OAuth, чтобы cookies отправлялись при редиректе
    const cookieOptions = {
      httpOnly: true,
      secure: config.isProduction,
      sameSite: config.isProduction ? ('none' as const) : ('lax' as const), // 'none' для production с кросс-доменными запросами
      maxAge: SEVEN_DAYS_MS,
    }

    console.log('🔍 [OAuth Callback] Setting cookie with options:', cookieOptions)
    res.cookie('refreshToken', result.tokens.refreshToken, cookieOptions)

    // Редирект на frontend с токеном
    const redirectUrl = new URL(config.frontendUrl)
    redirectUrl.searchParams.set('accessToken', result.tokens.accessToken)
    redirectUrl.pathname = '/auth/callback'

    console.log('✅ [OAuth Callback] Redirecting to:', redirectUrl.toString())
    res.redirect(redirectUrl.toString())
  }
}

export const oauthController = new OAuthController()
