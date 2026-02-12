import { config as dotenvConfig } from 'dotenv'
import { z } from 'zod'

dotenvConfig()

const envSchema = z.object({
  // Environment
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  PORT: z.string().default('5000'),
  FRONTEND_URL: z.string().default('http://localhost:3000'),

  // Database
  DATABASE_URL: z.string(),
  REDIS_URL: z.string().optional(),

  // JWT
  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),

  // Google OAuth
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GOOGLE_REDIRECT_URI: z.string().optional(),

  // Email (Resend)
  RESEND_API_KEY: z.string().optional(),
  RESEND_FROM_EMAIL: z.string().optional().default('onboarding@resend.dev'),
  RESEND_FROM_NAME: z.string().optional().default('Linglify'),

  // SMS (Twilio)
  TWILIO_ACCOUNT_SID: z.string().optional(),
  TWILIO_AUTH_TOKEN: z.string().optional(),
  TWILIO_PHONE_NUMBER: z.string().optional(),

  // Stripe (optional)
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  STRIPE_PUBLISHABLE_KEY: z.string().optional(),

  // Analytics (optional)
  GA_TRACKING_ID: z.string().optional(),

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: z.string().optional().default('900000'),
  RATE_LIMIT_MAX_REQUESTS: z.string().optional().default('100'),
  RATE_LIMIT_AUTH_MAX: z.string().optional().default('5'),

  // File Upload
  MAX_FILE_SIZE: z.string().optional().default('5242880'),
  ALLOWED_FILE_TYPES: z
    .string()
    .optional()
    .default('image/jpeg,image/png,image/webp'),

  // Logging
  LOG_LEVEL: z
    .enum(['error', 'warn', 'info', 'debug'])
    .optional()
    .default('info'),
})

const parsed = envSchema.safeParse(process.env)

if (!parsed.success) {
  console.error(
    '❌ Invalid environment variables:',
    parsed.error.flatten().fieldErrors
  )
  process.exit(1)
}

export const config = {
  nodeEnv: parsed.data.NODE_ENV,
  isDevelopment: parsed.data.NODE_ENV === 'development',
  isProduction: parsed.data.NODE_ENV === 'production',
  isTest: parsed.data.NODE_ENV === 'test',
  port: parseInt(parsed.data.PORT, 10),
  frontendUrl: parsed.data.FRONTEND_URL,

  database: {
    url: parsed.data.DATABASE_URL,
  },

  redis: {
    url: parsed.data.REDIS_URL,
  },

  jwt: {
    accessSecret: parsed.data.JWT_ACCESS_SECRET,
    refreshSecret: parsed.data.JWT_REFRESH_SECRET,
    accessExpiresIn: parsed.data.JWT_ACCESS_EXPIRES_IN,
    refreshExpiresIn: parsed.data.JWT_REFRESH_EXPIRES_IN,
  },

  oauth: {
    google: {
      clientId: parsed.data.GOOGLE_CLIENT_ID,
      clientSecret: parsed.data.GOOGLE_CLIENT_SECRET,
      redirectUri: parsed.data.GOOGLE_REDIRECT_URI,
    },
  },

  email: {
    resend: {
      apiKey: parsed.data.RESEND_API_KEY,
      fromEmail: parsed.data.RESEND_FROM_EMAIL,
      fromName: parsed.data.RESEND_FROM_NAME,
    },
  },

  sms: {
    twilio: {
      accountSid: parsed.data.TWILIO_ACCOUNT_SID,
      authToken: parsed.data.TWILIO_AUTH_TOKEN,
      phoneNumber: parsed.data.TWILIO_PHONE_NUMBER,
    },
  },

  stripe: {
    secretKey: parsed.data.STRIPE_SECRET_KEY,
    webhookSecret: parsed.data.STRIPE_WEBHOOK_SECRET,
    publishableKey: parsed.data.STRIPE_PUBLISHABLE_KEY,
  },

  analytics: {
    gaTrackingId: parsed.data.GA_TRACKING_ID,
  },

  rateLimit: {
    windowMs: parseInt(parsed.data.RATE_LIMIT_WINDOW_MS, 10),
    maxRequests: parseInt(parsed.data.RATE_LIMIT_MAX_REQUESTS, 10),
    authMax: parseInt(parsed.data.RATE_LIMIT_AUTH_MAX, 10),
  },

  upload: {
    maxFileSize: parseInt(parsed.data.MAX_FILE_SIZE, 10),
    allowedTypes: parsed.data.ALLOWED_FILE_TYPES.split(','),
  },

  logging: {
    level: parsed.data.LOG_LEVEL,
  },
}
