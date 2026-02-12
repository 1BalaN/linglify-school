import crypto from 'crypto'

export class TokenService {
  generateToken(length = 32): string {
    return crypto.randomBytes(length).toString('hex')
  }

  generateNumericCode(length = 6): string {
    const min = Math.pow(10, length - 1)
    const max = Math.pow(10, length) - 1
    return Math.floor(Math.random() * (max - min + 1) + min).toString()
  }

  hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex')
  }
}

export const tokenService = new TokenService()
