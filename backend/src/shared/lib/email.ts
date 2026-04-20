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
    const { host, port, secure, user, password, } = config.email.smtp
    const refreshToken = config.email.gmailRefreshToken

    // --- Режим 1: Gmail OAuth2 (рекомендуется для Railway/production) ---
    // Использует HTTPS (порт 443), а не SMTP-порты (465/587).
    // Railway блокирует исходящий SMTP, OAuth2 этот запрет обходит.
    if (refreshToken && user && config.oauth.google.clientId && config.oauth.google.clientSecret) {
      try {
        this.transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            type: 'OAuth2',
            user,
            clientId: config.oauth.google.clientId,
            clientSecret: config.oauth.google.clientSecret,
            refreshToken,
          },
        })
        console.log('📧 Email service: Gmail OAuth2 configured')

        this.transporter.verify((err) => {
          if (err) {
            console.error('❌ Gmail OAuth2 verify failed:', err.message)
            console.error('   Проверьте GMAIL_REFRESH_TOKEN, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET')
          } else {
            console.log('✅ Gmail OAuth2 connection verified')
          }
        })
        return
      } catch (error) {
        console.error('❌ Gmail OAuth2 setup failed:', error instanceof Error ? error.message : error)
      }
    }

    // --- Режим 2: обычный SMTP (dev/local окружение) ---
    if (host && user && password) {
      try {
        this.transporter = nodemailer.createTransport({
          host,
          port,
          secure,
          auth: { user, pass: password },
          tls: { rejectUnauthorized: false },
          connectionTimeout: 10_000,
          greetingTimeout: 10_000,
          socketTimeout: 15_000,
        })
        console.log(`📧 Email service: SMTP configured (${host}:${port})`)

        if (config.isProduction) {
          this.transporter.verify((err) => {
            if (err) {
              console.error('❌ SMTP verify failed:', err.message)
              console.error('   На Railway лучше использовать Gmail OAuth2 (GMAIL_REFRESH_TOKEN)')
            } else {
              console.log('✅ SMTP connection verified')
            }
          })
        }
        return
      } catch (error) {
        console.error('❌ SMTP setup failed:', error instanceof Error ? error.message : error)
      }
    }

    console.warn('⚠️  Email service: не настроен. Установите GMAIL_REFRESH_TOKEN (production) или SMTP_HOST/USER/PASSWORD (dev)')
  }

  async sendEmail(options: EmailOptions): Promise<void> {
    if (!this.transporter) {
      if (config.isDevelopment) {
        console.log(`📧 [DEV] Email → ${options.to} | ${options.subject}`)
      } else {
        console.warn(`⚠️  Email skipped (no transporter): ${options.to} | ${options.subject}`)
      }
      return
    }

    const { user, fromEmail, fromName } = config.email.smtp
    const from = `${fromName} <${fromEmail || user}>`

    try {
      const info = await this.transporter.sendMail({
        from,
        to: options.to,
        subject: options.subject,
        html: options.html,
      })
      console.log(`✅ Email sent: ${info.messageId} → ${options.to}`)
    } catch (error) {
      console.error('❌ Email send error:', error instanceof Error ? error.message : error)
      console.error(`   To: ${options.to} | Subject: ${options.subject}`)
      // Не пробрасываем ошибку — email не должен блокировать регистрацию/сброс пароля
    }
  }

  async sendVerificationEmail(email: string, token: string): Promise<void> {
    const verificationUrl = `${config.frontendUrl}/verify-email?token=${token}`
    await this.sendEmail({
      to: email,
      subject: 'Подтверждение email — Linglify',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4F46E5;">Подтверждение email</h2>
          <p>Спасибо за регистрацию на платформе Linglify!</p>
          <p>Для подтверждения вашего email перейдите по ссылке:</p>
          <a href="${verificationUrl}" style="display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 6px; margin: 16px 0;">
            Подтвердить email
          </a>
          <p style="color: #666; font-size: 14px;">Ссылка действительна 24 часа.</p>
          <p style="color: #666; font-size: 14px;">Если вы не регистрировались — проигнорируйте это письмо.</p>
        </div>
      `,
    })
  }

  async sendPasswordResetEmail(email: string, token: string): Promise<void> {
    const resetUrl = `${config.frontendUrl}/reset-password?token=${token}`
    await this.sendEmail({
      to: email,
      subject: 'Восстановление пароля — Linglify',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4F46E5;">Восстановление пароля</h2>
          <p>Вы запросили восстановление пароля для аккаунта на Linglify.</p>
          <p>Перейдите по ссылке для создания нового пароля:</p>
          <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 6px; margin: 16px 0;">
            Сбросить пароль
          </a>
          <p style="color: #666; font-size: 14px;">Ссылка действительна 1 час.</p>
          <p style="color: #666; font-size: 14px;">Если вы не запрашивали — проигнорируйте это письмо.</p>
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
          <h2 style="color: #4F46E5;">Добро пожаловать, ${name}! 🎉</h2>
          <p>Рады видеть вас на платформе Linglify!</p>
          <ul>
            <li>Пройдите тест на определение уровня языка</li>
            <li>Выберите подходящий курс</li>
            <li>Начните обучение в удобном темпе</li>
            <li>Получите сертификат по окончании</li>
          </ul>
          <a href="${config.frontendUrl}/courses" style="display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 6px; margin: 16px 0;">
            Перейти к курсам
          </a>
        </div>
      `,
    })
  }

  async sendEnrollmentEmail(
    email: string,
    options: { courseTitle: string; courseUrl: string; firstName?: string }
  ): Promise<void> {
    await this.sendEmail({
      to: email,
      subject: `Вы записаны на курс "${options.courseTitle}" — Linglify`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4F46E5;">Добро пожаловать на курс${options.firstName ? `, ${options.firstName}` : ''}! 🎉</h2>
          <p>Вы успешно записались на курс <strong>"${options.courseTitle}"</strong>.</p>
          <p>Всё готово — можете приступать к обучению прямо сейчас!</p>
          <a href="${options.courseUrl}"
             style="display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white;
                    text-decoration: none; border-radius: 6px; margin: 16px 0;">
            Начать курс
          </a>
          <p style="color: #666; font-size: 14px;">
            Если у вас возникнут вопросы, вы всегда можете написать преподавателю в чате на странице курса.
          </p>
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
          <h2 style="color: #4F46E5;">Поздравляем${options.firstName ? `, ${options.firstName}` : ''}! 🎓</h2>
          <p>Вы успешно завершили курс <strong>"${options.courseTitle}"</strong> на Linglify.</p>
          <p>Ваш сертификат доступен по ссылке:</p>
          <a href="${options.certificateUrl}" style="display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 6px; margin: 16px 0;">
            Открыть сертификат
          </a>
          <p style="color: #666; font-size: 14px;">
            Код верификации: <strong>${options.verificationCode}</strong>
          </p>
        </div>
      `,
    })
  }
}

export const emailService = new EmailService()
