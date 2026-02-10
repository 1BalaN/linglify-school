import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import cookieParser from 'cookie-parser'
import 'express-async-errors'
import { config } from '@/config/env'
import { errorHandler } from '@/shared/middleware/errorHandler'
import { notFoundHandler } from '@/shared/middleware/notFoundHandler'

const app = express()

// Middleware
app.use(helmet())
app.use(
  cors({
    origin: config.frontendUrl,
    credentials: true,
  })
)
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// API Routes
app.use('/api', (_req, res) => {
  res.json({ message: 'Linglify API v1.0' })
})

// Error handlers
app.use(notFoundHandler)
app.use(errorHandler)

// Start server
const PORT = config.port
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
  console.log(`📝 Environment: ${config.nodeEnv}`)
})

export default app
