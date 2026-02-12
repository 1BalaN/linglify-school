import { config } from '../../config/env'

export class SmsService {
  private async sendWithTwilio(phone: string, message: string): Promise<void> {
    const { accountSid, authToken, phoneNumber } = config.sms.twilio

    if (!accountSid || !authToken || !phoneNumber) {
      throw new Error('Twilio credentials are not configured')
    }

    const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`
    const auth = Buffer.from(`${accountSid}:${authToken}`).toString('base64')

    const body = new URLSearchParams({
      From: phoneNumber,
      To: phone,
      Body: message,
    })

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${auth}`,
      },
      body: body.toString(),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`Twilio API error: ${JSON.stringify(error)}`)
    }

    const data = (await response.json()) as { sid: string }
    console.log('📱 SMS sent via Twilio:', data.sid)
  }

  async sendSms(phone: string, message: string): Promise<void> {
    const { accountSid, authToken, phoneNumber } = config.sms.twilio

    // Если Twilio настроен - всегда используем его
    if (accountSid && authToken && phoneNumber) {
      try {
        await this.sendWithTwilio(phone, message)
        return
      } catch (error) {
        console.error('❌ Failed to send SMS via Twilio:', error)
        throw error
      }
    }

    // Fallback: если Twilio не настроен - логируем
    console.log('\n📱 =============== SMS (NO API KEYS) ===============')
    console.log(`To: ${phone}`)
    console.log(`Message: ${message}`)
    console.log('===================================================\n')
  }

  async sendVerificationCode(phone: string, code: string): Promise<void> {
    const message = `Ваш код подтверждения Linglify: ${code}. Действителен 10 минут.`
    await this.sendSms(phone, message)
  }
}

export const smsService = new SmsService()
