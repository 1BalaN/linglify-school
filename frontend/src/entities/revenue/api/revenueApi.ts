import { api } from '@/app/store/api'
import type { ApiResponse } from '@/shared/types/api'
import type { CourseRevenue, PayoutRequest } from '@/shared/types/user'

export interface TeacherEarnings {
  totalEarned: number
  totalPaidOut: number
  pendingPayout: number
  availableForPayout: number
  salesHistory: CourseRevenue[]
  byCourse: { courseId: string; title: string; coverImage: string | null; sales: number; earned: number }[]
  payouts: PayoutRequest[]
}

interface TeacherByRevenue {
  teacherId: string
  name: string
  email: string
  avatar: string | null
  sales: number
  totalAmount: number
  platformFee: number
  teacherEarning: number
}

interface AdminRevenue {
  summary: {
    totalRevenue: number
    totalPlatformFee: number
    totalTeacherPayout: number
    totalSales: number
    teacherCount: number
    subscriptionRevenue: number
    subscriptionByPlan: { MONTHLY: number; ANNUAL: number; total: number }
    totalPlatformIncome: number
  }
  revenueHistory: CourseRevenue[]
  byTeacher: TeacherByRevenue[]
  payouts: PayoutRequest[]
}

export const revenueApi = api.injectEndpoints({
  endpoints: build => ({
    // Arg is current teacher user id — only for cache keys; API still returns data for the authenticated user.
    getTeacherEarnings: build.query<ApiResponse<TeacherEarnings>, string>({
      query: () => '/revenue/teacher/earnings',
      providesTags: (_result, _error, teacherUserId) => [
        'Revenue',
        { type: 'Revenue', id: `teacher-earnings-${teacherUserId}` },
      ],
    }),

    createPayoutRequest: build.mutation<ApiResponse<PayoutRequest>, { amount: number; payoutDetails: string }>({
      query: body => ({ url: '/revenue/teacher/payouts', method: 'POST', body }),
      invalidatesTags: ['Revenue'],
    }),

    getAdminRevenue: build.query<ApiResponse<AdminRevenue>, void>({
      query: () => '/revenue/admin',
      providesTags: ['Revenue'],
    }),

    updatePayoutStatus: build.mutation<
      ApiResponse<PayoutRequest>,
      { id: string; status: 'PROCESSING' | 'COMPLETED' | 'REJECTED'; adminNote?: string }
    >({
      query: ({ id, ...body }) => ({ url: `/revenue/admin/payouts/${id}`, method: 'PATCH', body }),
      invalidatesTags: ['Revenue'],
    }),
  }),
})

export const {
  useGetTeacherEarningsQuery,
  useCreatePayoutRequestMutation,
  useGetAdminRevenueQuery,
  useUpdatePayoutStatusMutation,
} = revenueApi
