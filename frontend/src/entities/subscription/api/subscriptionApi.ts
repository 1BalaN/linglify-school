import { api } from '@/app/store/api'
import type { ApiResponse } from '@/shared/types/api'
import type { TeacherSubscription } from '@/shared/types/user'

interface SubscriptionPlanInfo {
  amount: number
  currency: string
  label: string
  description: string
  savings?: string
}

interface SubscriptionPlans {
  MONTHLY: SubscriptionPlanInfo
  ANNUAL:  SubscriptionPlanInfo
}

interface CheckoutSessionResult {
  sessionId: string
  url: string | null
}

export const subscriptionApi = api.injectEndpoints({
  endpoints: build => ({
    getSubscriptionPlans: build.query<ApiResponse<SubscriptionPlans>, void>({
      query: () => '/subscriptions/plans',
    }),

    getMySubscription: build.query<ApiResponse<TeacherSubscription | null>, void>({
      query: () => '/subscriptions/me',
      providesTags: ['Subscription'],
      keepUnusedDataFor: 0,
    }),

    createSubscriptionCheckout: build.mutation<ApiResponse<CheckoutSessionResult>, { plan: 'MONTHLY' | 'ANNUAL' }>({
      query: body => ({ url: '/subscriptions/checkout', method: 'POST', body }),
    }),

    cancelSubscription: build.mutation<ApiResponse<{ message: string }>, void>({
      query: () => ({ url: '/subscriptions/cancel', method: 'POST' }),
      invalidatesTags: ['Subscription'],
    }),

    syncSubscription: build.mutation<ApiResponse<TeacherSubscription | null>, void>({
      query: () => ({ url: '/subscriptions/sync', method: 'POST' }),
      invalidatesTags: ['Subscription'],
    }),
  }),
})

export const {
  useGetSubscriptionPlansQuery,
  useGetMySubscriptionQuery,
  useCreateSubscriptionCheckoutMutation,
  useCancelSubscriptionMutation,
  useSyncSubscriptionMutation,
} = subscriptionApi
