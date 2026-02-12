import { prisma } from '../../shared/lib/prisma'
import { hashService } from '../../shared/lib/hash'
import { jwtService } from '../../shared/lib/jwt'
import { tokenService } from '../../shared/lib/token'
import { emailService } from '../../shared/lib/email'
import { smsService } from '../../shared/lib/sms'
import { AppError } from '../../shared/middleware/errorHandler'
import type {
  RegisterDto,
  LoginDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  UpdateProfileDto,
  ChangePasswordDto,
  SendPhoneVerificationDto,
  VerifyPhoneDto,
} from './auth.schema'

export class AuthService {
  async register(dto: RegisterDto) {
    const existingUser = await prisma.user.findUnique({
      where: { email: dto.email },
    })

    if (existingUser) {
      throw new AppError(409, 'USER_ALREADY_EXISTS', 'Пользователь уже существует')
    }

    const hashedPassword = await hashService.hash(dto.password)

    const user = await prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        firstName: dto.firstName,
        lastName: dto.lastName,
        role: 'STUDENT',
        isEmailVerified: false,
      },
    })

    // Создаем токен подтверждения email
    const verificationToken = tokenService.generateToken()
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 часа

    await prisma.verificationToken.create({
      data: {
        userId: user.id,
        token: verificationToken,
        type: 'EMAIL',
        expiresAt,
      },
    })

    // Отправляем email
    await emailService.sendVerificationEmail(user.email, verificationToken)

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
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        isPhoneVerified: user.isPhoneVerified,
        createdAt: user.createdAt,
      },
      tokens,
    }
  }

  async login(dto: LoginDto) {
    const user = await prisma.user.findUnique({
      where: { email: dto.email },
    })

    if (!user?.password) {
      throw new AppError(401, 'INVALID_CREDENTIALS', 'Неверные данные')
    }

    const isPasswordValid = await hashService.compare(
      dto.password,
      user.password
    )

    if (!isPasswordValid) {
      throw new AppError(401, 'INVALID_CREDENTIALS', 'Неверные данные')
    }

    const tokens = jwtService.generateTokenPair({
      userId: user.id,
      role: user.role,
    })

    await prisma.user.update({
      where: { id: user.id },
      data: { updatedAt: new Date() },
    })

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        isPhoneVerified: user.isPhoneVerified,
        phone: user.phone,
        avatar: user.avatar,
        createdAt: user.createdAt,
      },
      tokens,
    }
  }

  async verifyEmail(token: string) {
    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token },
      include: { user: true },
    })

    if (!verificationToken || verificationToken.type !== 'EMAIL') {
      throw new AppError(400, 'INVALID_TOKEN', 'Неверный токен подтверждения email')
    }

    if (verificationToken.expiresAt < new Date()) {
      throw new AppError(400, 'TOKEN_EXPIRED', 'Токен подтверждения email истек')
    }

    await prisma.$transaction([
      prisma.user.update({
        where: { id: verificationToken.userId },
        data: { isEmailVerified: true },
      }),
      prisma.verificationToken.delete({
        where: { id: verificationToken.id },
      }),
    ])

    // Отправляем приветственное письмо
    const userName = verificationToken.user.firstName ?? 'пользователь'
    await emailService.sendWelcomeEmail(verificationToken.user.email, userName)

    return { message: 'Email подтвержден успешно' }
  }

  async resendVerificationEmail(email: string) {
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      throw new AppError(404, 'USER_NOT_FOUND', 'Пользователь не найден')
    }

    if (user.isEmailVerified) {
      throw new AppError(400, 'ALREADY_VERIFIED', 'Email уже подтвержден')
    }

    // Удаляем старые токены
    await prisma.verificationToken.deleteMany({
      where: {
        userId: user.id,
        type: 'EMAIL',
      },
    })

    // Создаем новый токен
    const verificationToken = tokenService.generateToken()
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000)

    await prisma.verificationToken.create({
      data: {
        userId: user.id,
        token: verificationToken,
        type: 'EMAIL',
        expiresAt,
      },
    })

    await emailService.sendVerificationEmail(user.email, verificationToken)

    return { message: 'Verification email sent' }
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await prisma.user.findUnique({
      where: { email: dto.email },
    })

    // Не раскрываем, существует ли пользователь
    if (!user) {
      return { message: 'Если email существует, ссылка для сброса пароля отправлена' }
    }

    // Удаляем старые токены
    await prisma.passwordReset.deleteMany({
      where: {
        userId: user.id,
        used: false,
      },
    })

    const resetToken = tokenService.generateToken()
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 час

    await prisma.passwordReset.create({
      data: {
        userId: user.id,
        token: resetToken,
        expiresAt,
      },
    })

    await emailService.sendPasswordResetEmail(user.email, resetToken)

    return { message: 'Если email существует, ссылка для сброса пароля отправлена' }
  }

  async resetPassword(dto: ResetPasswordDto) {
    const passwordReset = await prisma.passwordReset.findUnique({
      where: { token: dto.token },
      include: { user: true },
    })

    if (!passwordReset || passwordReset.used) {
      throw new AppError(400, 'INVALID_TOKEN', 'Неверный или истекший reset token')
    }

    if (passwordReset.expiresAt < new Date()) {
      throw new AppError(400, 'TOKEN_EXPIRED', 'Reset token умер')
    }

    const hashedPassword = await hashService.hash(dto.password)

    await prisma.$transaction([
      prisma.user.update({
        where: { id: passwordReset.userId },
        data: { password: hashedPassword },
      }),
      prisma.passwordReset.update({
        where: { id: passwordReset.id },
        data: { used: true },
      }),
    ])

    return { message: 'Пароль сброшен успешно' }
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = jwtService.verifyRefreshToken(refreshToken)

      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
      })

      if (!user) {
        throw new AppError(401, 'INVALID_TOKEN', 'Неверный refresh token')
      }

      const tokens = jwtService.generateTokenPair({
        userId: user.id,
        role: user.role,
      })

      return { tokens }
    } catch (error) {
      throw new AppError(401, 'INVALID_TOKEN', 'Неверный refresh token')
    }
  }

  async getCurrentUser(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      throw new AppError(404, 'USER_NOT_FOUND', 'Пользователь не найден')
    }

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      avatar: user.avatar,
      role: user.role,
      isEmailVerified: user.isEmailVerified,
      isPhoneVerified: user.isPhoneVerified,
      oauthProvider: user.oauthProvider,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        firstName: dto.firstName,
        lastName: dto.lastName,
        phone: dto.phone,
      },
    })

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      avatar: user.avatar,
      role: user.role,
      isEmailVerified: user.isEmailVerified,
      isPhoneVerified: user.isPhoneVerified,
    }
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user?.password) {
      throw new AppError(400, 'NO_PASSWORD', 'У пользователя нет пароля')
    }

    const isPasswordValid = await hashService.compare(
      dto.currentPassword,
      user.password
    )

    if (!isPasswordValid) {
      throw new AppError(401, 'INVALID_PASSWORD', 'Текущий пароль неверный')
    }

    const hashedPassword = await hashService.hash(dto.newPassword)

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    })

    return { message: 'Пароль изменен успешно' }
  }

  async sendPhoneVerification(userId: string, dto: SendPhoneVerificationDto) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      throw new AppError(404, 'USER_NOT_FOUND', 'Пользователь не найден')
    }

    // Удаляем старые токены
    await prisma.verificationToken.deleteMany({
      where: {
        userId: user.id,
        type: 'PHONE',
      },
    })

    const code = tokenService.generateNumericCode(6)
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 минут

    await prisma.verificationToken.create({
      data: {
        userId: user.id,
        token: code,
        type: 'PHONE',
        expiresAt,
      },
    })

    await smsService.sendVerificationCode(dto.phone, code)

    return { message: 'Код подтверждения отправлен' }
  }

  async verifyPhone(userId: string, dto: VerifyPhoneDto) {
    const verificationToken = await prisma.verificationToken.findFirst({
      where: {
        userId,
        token: dto.code,
        type: 'PHONE',
      },
    })

    if (!verificationToken) {
      throw new AppError(400, 'INVALID_CODE', 'Неверный код подтверждения')
    }

    if (verificationToken.expiresAt < new Date()) {
      throw new AppError(400, 'CODE_EXPIRED', 'Код подтверждения истек')
    }

    await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: {
          phone: dto.phone,
          isPhoneVerified: true,
        },
      }),
      prisma.verificationToken.delete({
        where: { id: verificationToken.id },
      }),
    ])

    return { message: 'Телефон подтвержден успешно' }
  }
}

export const authService = new AuthService()
