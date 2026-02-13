import rateLimit from 'express-rate-limit'

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 requests per window
  message: {
    error: {
      code: 'TOO_MANY_REQUESTS',
      message: 'Слишком много попыток входа. Пожалуйста, попробуйте через 15 минут',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
  statusCode: 429,
})

export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // 200 requests per window
  message: {
    error: {
      code: 'TOO_MANY_REQUESTS',
      message: 'Превышен лимит запросов. Пожалуйста, подождите немного',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
  statusCode: 429,
})
