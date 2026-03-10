import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import cookieParser from 'cookie-parser'
import 'express-async-errors'
import { config } from './config/env'
import { errorHandler } from './shared/middleware/errorHandler'
import { notFoundHandler } from './shared/middleware/notFoundHandler'
import { generalLimiter } from './shared/middleware/rateLimit'
import authRouter from './modules/auth/auth.router'
import faqRouter from './modules/faq/faq.router'
import contactRouter from './modules/contact/contact.router'
import courseRouter from './modules/course/course.router'
import lessonRouter from './modules/lesson/lesson.router'
import questionRouter from './modules/question/question.router'
import uploadRouter from './modules/upload/upload.router'
import certificateRouter from './modules/certificate/certificate.router'
import paymentRouter, { paymentWebhookRouter } from './modules/payment/payment.router'
import placementRouter from './modules/placement/placement.router'
import analyticsRouter from './modules/analytics/analytics.router'
import settingsRouter from './modules/settings/settings.router'

const app = express()

if(config.nodeEnv === 'production') {
  app.set('trust proxy', 1)
}

// Middleware
app.use(helmet())
app.use(
  cors({
    origin: config.frontendUrl,
    credentials: true,
  })
)

// Stripe webhook должен получать "raw" body до json-парсера
app.use('/api/payments', paymentWebhookRouter)

app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))
app.use(cookieParser())
app.use(generalLimiter)

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// API Routes
app.use('/api/auth', authRouter)
app.use('/api/faq', faqRouter)
app.use('/api/contact', contactRouter)
app.use('/api/courses', courseRouter)
app.use('/api/lessons', lessonRouter)
app.use('/api/questions', questionRouter)
app.use('/api/upload', uploadRouter)
app.use('/api/certificates', certificateRouter)
app.use('/api/payments', paymentRouter)
app.use('/api/placement', placementRouter)
app.use('/api/analytics', analyticsRouter)
app.use('/api/settings', settingsRouter)

// Error handlers
app.use(notFoundHandler)
app.use(errorHandler)

// Start server
const PORT = config.port
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
  console.log(`📝 Environment: ${config.nodeEnv}`)
  console.log(`🔗 Frontend URL: ${config.frontendUrl}`)
})

export default app
