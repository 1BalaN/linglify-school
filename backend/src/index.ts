import http from 'http'
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
import userRouter from './modules/user/user.router'
import chatRouter from './modules/chat/chat.router'
import subscriptionRouter from './modules/subscription/subscription.router'
import revenueRouter from './modules/revenue/revenue.router'
import { setSocketServer } from './shared/lib/socket'
import { jwtService } from './shared/lib/jwt'
import { Server } from 'socket.io'
import { startCronJobs } from './cron'

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
app.use('/api/users', userRouter)
app.use('/api/chats', chatRouter)
app.use('/api/subscriptions', subscriptionRouter)
app.use('/api/revenue', revenueRouter)

// Error handlers
app.use(notFoundHandler)
app.use(errorHandler)

// HTTP server + WebSocket (socket.io)
const httpServer = http.createServer(app)

const io = new Server(httpServer, {
  cors: {
    origin: config.frontendUrl,
    credentials: true,
    methods: ['GET', 'POST'],
  },
  // Polling первым — Railway и другие облачные прокси могут не поддерживать
  // WebSocket upgrade без специальной конфигурации. Клиент автоматически
  // поднимется до WebSocket, если прокси это разрешает.
  transports: ['polling', 'websocket'],
  pingTimeout: 60_000,
  pingInterval: 25_000,
  // Максимальный размер пакета (для вложений-превью и т.д.)
  maxHttpBufferSize: 1e7,
})

setSocketServer(io)

io.use((socket, next) => {
  try {
    const token =
      (socket.handshake.auth?.token as string | undefined) ||
      (socket.handshake.query?.token as string | undefined)

    if (!token) {
      return next(new Error('UNAUTHORIZED'))
    }

    const payload = jwtService.verifyAccessToken(token) as { userId: string; role: string }
    socket.data.userId = payload.userId
    socket.data.role = payload.role
    return next()
  } catch {
    return next(new Error('UNAUTHORIZED'))
  }
})

io.on('connection', socket => {
 
  const userId: string | undefined = socket.data.userId
  if (userId) {
    socket.join(`user:${userId}`)
  }
})

// Start server
const PORT = config.port
httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
  console.log(`📝 Environment: ${config.nodeEnv}`)
  console.log(`🔗 Frontend URL: ${config.frontendUrl}`)
  startCronJobs()
})

export default app
