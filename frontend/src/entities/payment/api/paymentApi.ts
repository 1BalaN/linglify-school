import { api } from '@/app/store/api'

interface CreateCheckoutSessionRequest {
  courseId: string
}

interface CreateCheckoutSessionResponse {
  sessionId: string
  url: string | null
}

interface ConfirmPaymentRequest {
  sessionId: string
}

interface ConfirmPaymentResponse {
  courseId: string
}

export const paymentApi = api.injectEndpoints({
  endpoints: builder => ({
    createCheckoutSession: builder.mutation<
      { data: CreateCheckoutSessionResponse },
      CreateCheckoutSessionRequest
    >({
      query: body => ({
        url: '/payments/checkout-session',
        method: 'POST',
        body,
      }),
    }),
    confirmPayment: builder.mutation<{ data: ConfirmPaymentResponse }, ConfirmPaymentRequest>({
      query: body => ({
        url: '/payments/confirm',
        method: 'POST',
        body,
      }),
    }),
  }),
})

export const { useCreateCheckoutSessionMutation, useConfirmPaymentMutation } = paymentApi

