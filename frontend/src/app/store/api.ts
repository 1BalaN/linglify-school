import {
  createApi,
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from '@reduxjs/toolkit/query/react'
import type { ApiResponse } from '@/shared/types/api'

const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
export const apiBaseUrl = baseUrl

const baseQuery = fetchBaseQuery({
  baseUrl,
  credentials: 'include',
  prepareHeaders: headers => {
    const token = localStorage.getItem('accessToken')
    if (token) {
      headers.set('authorization', `Bearer ${token}`)
    }
    return headers
  },
})

const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions)

  // Если получили 401 и есть refresh token в cookies, пытаемся обновить access token
  if (result.error && result.error.status === 401) {
    const refreshResult = await baseQuery(
      { url: '/auth/refresh', method: 'POST' },
      api,
      extraOptions
    )

    if (refreshResult.data) {
      const data = refreshResult.data as ApiResponse<{ accessToken: string }>
      // Сохраняем новый access token
      localStorage.setItem('accessToken', data.data.accessToken)
      // Повторяем исходный запрос с новым токеном
      result = await baseQuery(args, api, extraOptions)
    } else {
      // Refresh токен тоже невалидный, выходим из системы
      localStorage.removeItem('accessToken')
    }
  }

  return result
}

export const api = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    'User',
    'Course',
    'Lesson',
    'Question',
    'Progress',
    'Enrollment',
    'Review',
    'Certificate',
    'FAQ',
    'Contact',
    'PlacementQuestion',
    'PlatformSettings',
    'AdminAnalytics',
    'TeacherAnalytics',
  ],
  endpoints: () => ({}),
})
