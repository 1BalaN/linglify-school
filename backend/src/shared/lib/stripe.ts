import Stripe from 'stripe'
import { config } from '../../config/env'

const secretKey = config.stripe.secretKey

export const stripe =
  secretKey && secretKey.length > 0
    ? new Stripe(secretKey, {
        apiVersion: '2026-01-28.clover',
      })
    : null

