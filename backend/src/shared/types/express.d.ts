import type { Request } from 'express'
import type { JwtPayload } from '../lib/jwt'

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: JwtPayload
    }
  }
}

export interface AuthRequest extends Request {
  user?: JwtPayload
}
