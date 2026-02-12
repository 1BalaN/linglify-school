import { z } from 'zod'

export const registerSchema = z.object({
  email: z.string().email('Неверный формат email'),
  password: z
    .string()
    .min(8, 'Пароль должен быть не менее 8 символов')
    .max(128, 'Пароль не должен превышать 128 символов')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Пароль должен содержать хотя бы одну заглавную букву, одну строчную букву и одну цифру'
    ),
  firstName: z.string().min(1).max(50).optional(),
  lastName: z.string().min(1).max(50).optional(),
})

export const loginSchema = z.object({
  email: z.string().email('Неверный формат email'),
  password: z.string().min(1, 'Нужно заполнить пароль'),
})

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh токен обязательно для заполнения'),
})

export const verifyEmailSchema = z.object({
  token: z.string().min(1, 'Token is required'),
})

export const resendVerificationSchema = z.object({
  email: z.string().email('Неверный формат email'),
})

export const forgotPasswordSchema = z.object({
  email: z.string().email('Неверный формат email'),
})

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  password: z
    .string()
    .min(8, 'Пароль должен быть не менее 8 символов')
    .max(128, 'Пароль не должен превышать 128 символов')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Пароль должен содержать хотя бы одну заглавную букву, одну строчную букву и одну цифру'
    ),
})

export const updateProfileSchema = z.object({
  firstName: z.string().min(1).max(50).optional(),
  lastName: z.string().min(1).max(50).optional(),
  phone: z.string().regex(/^\+?\d{10,15}$/).optional(),
})

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Нужно заполнить пароль'),
  newPassword: z
    .string()
    .min(8, 'Пароль должен быть не менее 8 символов')
    .max(128, 'Пароль не должен превышать 128 символов')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Пароль должен содержать хотя бы одну заглавную букву, одну строчную букву и одну цифру'
    ),
})

export const sendPhoneVerificationSchema = z.object({
  phone: z.string().regex(/^\+?\d{10,15}$/, 'Неверный формат телефона'),
})

export const verifyPhoneSchema = z.object({
  phone: z.string().regex(/^\+?\d{10,15}$/, 'Неверный формат телефона'),
  code: z.string().length(6, 'Код должен быть 6 цифр'),
})

export const googleOAuthSchema = z.object({
  code: z.string().min(1, 'OAuth code is required'),
})

export type RegisterDto = z.infer<typeof registerSchema>
export type LoginDto = z.infer<typeof loginSchema>
export type RefreshTokenDto = z.infer<typeof refreshTokenSchema>
export type VerifyEmailDto = z.infer<typeof verifyEmailSchema>
export type ResendVerificationDto = z.infer<typeof resendVerificationSchema>
export type ForgotPasswordDto = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordDto = z.infer<typeof resetPasswordSchema>
export type UpdateProfileDto = z.infer<typeof updateProfileSchema>
export type ChangePasswordDto = z.infer<typeof changePasswordSchema>
export type SendPhoneVerificationDto = z.infer<typeof sendPhoneVerificationSchema>
export type VerifyPhoneDto = z.infer<typeof verifyPhoneSchema>
export type GoogleOAuthDto = z.infer<typeof googleOAuthSchema>
