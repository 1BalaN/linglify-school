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
