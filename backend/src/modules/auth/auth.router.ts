import { Router } from 'express'
import { authController } from './auth.controller'
import { oauthController } from './oauth.controller'
import { authLimiter } from '../../shared/middleware/rateLimit'
import { requireAuth } from '../../shared/middleware/auth'

const router = Router()

// Public routes with rate limiting
router.post('/register', authLimiter, (req, res) =>
  authController.register(req, res)
)

router.post('/login', authLimiter, (req, res) =>
  authController.login(req, res)
)

router.post('/verify-email', authLimiter, (req, res) =>
  authController.verifyEmail(req, res)
)

router.post('/resend-verification', authLimiter, (req, res) =>
  authController.resendVerification(req, res)
)

router.post('/forgot-password', authLimiter, (req, res) =>
  authController.forgotPassword(req, res)
)

router.post('/reset-password', authLimiter, (req, res) =>
  authController.resetPassword(req, res)
)

router.post('/refresh', (req, res) => authController.refresh(req, res))

router.post('/logout', (req, res) => authController.logout(req, res))

// OAuth routes
router.get('/google', (req, res) => oauthController.getGoogleAuthUrl(req, res))

router.get('/google/callback', (req, res) =>
  oauthController.googleCallback(req, res)
)

// Protected routes
router.get('/me', requireAuth, (req, res) =>
  authController.getCurrentUser(req, res)
)

router.patch('/profile', requireAuth, (req, res) =>
  authController.updateProfile(req, res)
)

router.post('/change-password', requireAuth, (req, res) =>
  authController.changePassword(req, res)
)

router.post('/send-phone-verification', requireAuth, (req, res) =>
  authController.sendPhoneVerification(req, res)
)

router.post('/verify-phone', requireAuth, (req, res) =>
  authController.verifyPhone(req, res)
)

export default router
