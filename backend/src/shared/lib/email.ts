import { config } from '../../config/env'

interface EmailOptions {
  to: string
  subject: string
  html: string
}

export class EmailService {
  private async sendWithResend(options: EmailOptions): Promise<void> {
    const apiKey = config.email.resend.apiKey

    if (!apiKey) {
      throw new Error('RESEND_API_KEY is not configured')
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: `${config.email.resend.fromName} <${config.email.resend.fromEmail}>`,
        to: [options.to],
        subject: options.subject,
        html: options.html,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`Resend API error: ${JSON.stringify(error)}`)
    }

    const data = (await response.json()) as { id: string }
    console.log('📧 Email sent via Resend:', data.id)
  }

  async sendEmail(options: EmailOptions): Promise<void> {
    const apiKey = config.email.resend.apiKey

    // Если API ключ настроен - всегда используем Resend
    if (apiKey) {
      try {
        await this.sendWithResend(options)
        return
      } catch (error) {
        console.error('❌ Failed to send email via Resend:', error)
        throw error
      }
    }

    // Fallback: если API ключ не настроен - логируем
    console.log('\n📧 =============== EMAIL (NO API KEY) ===============')
    console.log(`To: ${options.to}`)
    console.log(`Subject: ${options.subject}`)
    console.log('Body:')
    console.log(options.html)
    console.log('====================================================\n')
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
}

export const emailService = new EmailService()
