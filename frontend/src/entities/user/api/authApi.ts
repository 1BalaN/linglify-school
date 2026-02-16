import { api } from '@/app/store/api'
import type { ApiResponse } from '@/shared/types/api'
import type {
  User,
  AuthResponse,
  LoginDto,
  RegisterDto,
} from '@/shared/types/user'

export const authApi = api.injectEndpoints({
  endpoints: build => ({
    register: build.mutation<ApiResponse<AuthResponse>, RegisterDto>({
      query: credentials => ({
        url: '/auth/register',
        method: 'POST',
        body: credentials,
      }),
      invalidatesTags: ['User'],
    }),

    login: build.mutation<ApiResponse<AuthResponse>, LoginDto>({
      query: credentials => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
      invalidatesTags: ['User'],
    }),

    logout: build.mutation<ApiResponse<{ message: string }>, void>({
      query: () => ({
        url: '/auth/logout',
        method: 'POST',
      }),
      invalidatesTags: ['User'],
    }),

    getCurrentUser: build.query<ApiResponse<User>, void>({
      query: () => '/auth/me',
      providesTags: ['User'],
    }),

    refreshToken: build.mutation<ApiResponse<{ accessToken: string }>, void>({
      query: () => ({
        url: '/auth/refresh',
        method: 'POST',
      }),
    }),

    updateProfile: build.mutation<
      ApiResponse<User>,
      Partial<{
        firstName: string
        lastName: string
        bio: string
        avatar: string
        dateOfBirth: string
        preferredLanguage: string
        targetLanguages: string[]
        timezone: string
      }>
    >({
      query: data => ({
        url: '/auth/profile',
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['User'],
    }),

    changePassword: build.mutation<
      ApiResponse<{ message: string }>,
      { currentPassword: string; newPassword: string }
    >({
      query: data => ({
        url: '/auth/change-password',
        method: 'POST',
        body: data,
      }),
    }),

    sendPhoneVerification: build.mutation<
      ApiResponse<{ message: string }>,
      { phone: string }
    >({
      query: data => ({
        url: '/auth/send-phone-verification',
        method: 'POST',
        body: data,
      }),
    }),

    verifyPhone: build.mutation<
      ApiResponse<User>,
      { phone: string; code: string }
    >({
      query: data => ({
        url: '/auth/verify-phone',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['User'],
    }),

    resendVerification: build.mutation<
      ApiResponse<{ message: string }>,
      { email: string }
    >({
      query: data => ({
        url: '/auth/resend-verification',
        method: 'POST',
        body: data,
      }),
    }),

    verifyEmail: build.mutation<
      ApiResponse<{ message: string }>,
      { token: string }
    >({
      query: data => ({
        url: '/auth/verify-email',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['User'],
    }),

    forgotPassword: build.mutation<
      ApiResponse<{ message: string }>,
      { email: string }
    >({
      query: data => ({
        url: '/auth/forgot-password',
        method: 'POST',
        body: data,
      }),
    }),

    resetPassword: build.mutation<
      ApiResponse<{ message: string }>,
      { token: string; password: string }
    >({
      query: data => ({
        url: '/auth/reset-password',
        method: 'POST',
        body: data,
      }),
    }),
  }),
})

export const {
  useRegisterMutation,
  useLoginMutation,
  useLogoutMutation,
  useGetCurrentUserQuery,
  useRefreshTokenMutation,
  useUpdateProfileMutation,
  useChangePasswordMutation,
  useSendPhoneVerificationMutation,
  useVerifyPhoneMutation,
  useResendVerificationMutation,
  useVerifyEmailMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
} = authApi
