import nodemailer from 'nodemailer'
import { config } from '../../config/env'

interface EmailOptions {
  to: string
  subject: string
  html: string
}

export class EmailService {
  private transporter: nodemailer.Transporter | null = null

  constructor() {
    this.initializeTransporter()
  }

  private initializeTransporter() {
    // Используем только SMTP
    if (config.email.smtp.host && config.email.smtp.user && config.email.smtp.password) {
      try {
        this.transporter = nodemailer.createTransport({
          host: config.email.smtp.host,
          port: config.email.smtp.port,
          secure: config.email.smtp.secure,
          auth: {
            user: config.email.smtp.user,
            pass: config.email.smtp.password,
          },
        })
        console.log('📧 Email service: SMTP configured')
      } catch (error) {
        console.error('❌ Email service: Failed to configure SMTP:', error instanceof Error ? error.message : 'Unknown error')
      }
    } else {
      console.warn('⚠️  Email service: SMTP credentials missing (host, user, or password)')
      console.warn('   Set SMTP_HOST, SMTP_USER, SMTP_PASSWORD in environment variables')
    }
  }

  async sendEmail(options: EmailOptions): Promise<void> {
    if (!this.transporter) {
      // SMTP не настроен - пропускаем отправку
      if (config.isDevelopment) {
        console.log(`📧 [DEV] Email would be sent to: ${options.to}`)
        console.log(`   Subject: ${options.subject}`)
      }
      return
    }

    try {
      const info = await this.transporter.sendMail({
        from: `${config.email.smtp.fromName} <${config.email.smtp.fromEmail}>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
      })

      if (config.isDevelopment) {
        console.log('✅ Email sent:', info.messageId, 'to:', options.to)
      }
    } catch (error) {
      console.error('❌ Email error:', error instanceof Error ? error.message : 'Unknown error')
      console.error('   To:', options.to, 'Subject:', options.subject)
      // Не выбрасываем ошибку, чтобы не блокировать регистрацию
    }
  }

  async sendVerificationEmail(email: string, token: string): Promise<void> {
    const verificationUrl = `${config.frontendUrl}/verify-email?token=${token}`

    await this.sendEmail({
      to: email,
      subject: 'Подтверждение email - Linglify',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Подтверждение email</h2>
          <p>Спасибо за регистрацию на платформе Linglify!</p>
          <p>Для подтверждения вашего email перейдите по ссылке:</p>
          <a href="${verificationUrl}" style="display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 6px; margin: 16px 0;">
            Подтвердить email
          </a>
          <p style="color: #666; font-size: 14px;">Ссылка действительна в течение 24 часов.</p>
          <p style="color: #666; font-size: 14px;">Если вы не регистрировались на Linglify, проигнорируйте это письмо.</p>
        </div>
      `,
    })
  }

  async sendPasswordResetEmail(email: string, token: string): Promise<void> {
    const resetUrl = `${config.frontendUrl}/reset-password?token=${token}`

    await this.sendEmail({
      to: email,
      subject: 'Восстановление пароля - Linglify',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Восстановление пароля</h2>
          <p>Вы запросили восстановление пароля для вашего аккаунта на Linglify.</p>
          <p>Перейдите по ссылке для создания нового пароля:</p>
          <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 6px; margin: 16px 0;">
            Сбросить пароль
          </a>
          <p style="color: #666; font-size: 14px;">Ссылка действительна в течение 1 часа.</p>
          <p style="color: #666; font-size: 14px;">Если вы не запрашивали восстановление пароля, проигнорируйте это письмо.</p>
        </div>
      `,
    })
  }

  async sendWelcomeEmail(email: string, name: string): Promise<void> {
    await this.sendEmail({
      to: email,
      subject: 'Добро пожаловать в Linglify! 🎉',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Добро пожаловать, ${name}! 🎉</h2>
          <p>Рады видеть вас на платформе Linglify!</p>
          <p>Теперь вы можете:</p>
          <ul>
            <li>Пройти тест на определение уровня языка</li>
            <li>Выбрать подходящий курс</li>
            <li>Начать обучение в удобном темпе</li>
            <li>Получить сертификат по окончании</li>
          </ul>
          <a href="${config.frontendUrl}/courses" style="display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 6px; margin: 16px 0;">
            Перейти к курсам
          </a>
        </div>
      `,
    })
  }

  async sendCertificateEmail(
    email: string,
    options: { courseTitle: string; certificateUrl: string; verificationCode: string; firstName?: string }
  ): Promise<void> {
    await this.sendEmail({
      to: email,
      subject: `Ваш сертификат по курсу "${options.courseTitle}"`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Поздравляем${options.firstName ? `, ${options.firstName}` : ''}! 🎓</h2>
          <p>Вы успешно завершили курс <strong>"${options.courseTitle}"</strong> на платформе Linglify.</p>
          <p>Ваш сертификат доступен по ссылке:</p>
          <a href="${options.certificateUrl}" style="display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 6px; margin: 16px 0;">
            Открыть сертификат
          </a>
          <p style="color: #666; font-size: 14px;">
            Код верификации сертификата: <strong>${options.verificationCode}</strong>
          </p>
          <p style="color: #666; font-size: 14px; margin-top: 16px;">
            Этот код можно использовать для проверки подлинности сертификата.
          </p>
        </div>
      `,
    })
  }
}

export const emailService = new EmailService()
