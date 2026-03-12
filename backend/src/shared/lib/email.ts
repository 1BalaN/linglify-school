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
    const { host, port, secure, user, password } = config.email.smtp

    if (!host || !user || !password) {
      console.warn('⚠️  Email service: SMTP credentials missing (SMTP_HOST, SMTP_USER, SMTP_PASSWORD)')
      return
    }

    try {
      this.transporter = nodemailer.createTransport({
        host,
        port,
        // port 465 → SSL (secure: true), port 587 → STARTTLS (secure: false)
        secure,
        auth: {
          user,
          pass: password,
        },
        // Критично для облачных хостингов (Railway, Render и т.д.):
        // Позволяет обойти проблемы с сертификатами внешних SMTP-серверов
        tls: {
          rejectUnauthorized: false,
        },
        // Таймауты — чтобы Railway не держал соединение вечно
        connectionTimeout: 10_000,
        greetingTimeout: 10_000,
        socketTimeout: 15_000,
      })

      console.log(`📧 Email service: SMTP configured (${host}:${port}, secure=${secure})`)

      // Проверяем соединение при старте (только в production, не блокируем запуск)
      if (config.isProduction) {
        this.transporter.verify((err) => {
          if (err) {
            console.error('❌ Email SMTP verify failed:', err.message)
            console.error('   Проверьте SMTP_HOST, SMTP_USER, SMTP_PASSWORD и App Password для Gmail')
          } else {
            console.log('✅ Email SMTP connection verified successfully')
          }
        })
      }
    } catch (error) {
      console.error('❌ Email service: Failed to configure SMTP:', error instanceof Error ? error.message : 'Unknown error')
    }
  }

  async sendEmail(options: EmailOptions): Promise<void> {
    if (!this.transporter) {
      if (config.isDevelopment) {
        console.log(`📧 [DEV] Email would be sent to: ${options.to}`)
        console.log(`   Subject: ${options.subject}`)
      } else {
        console.warn(`⚠️  Email skipped (no transporter): ${options.to} — ${options.subject}`)
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

      console.log(`✅ Email sent: ${info.messageId} → ${options.to}`)
    } catch (error) {
      console.error('❌ Email send error:', error instanceof Error ? error.message : 'Unknown error')
      console.error(`   To: ${options.to} | Subject: ${options.subject}`)
      // Не выбрасываем ошибку, чтобы не блокировать основные операции (регистрация и т.д.)
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
