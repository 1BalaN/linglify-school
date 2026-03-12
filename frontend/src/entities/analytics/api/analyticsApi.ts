import { api } from '@/app/store/api'
import type {
  AdminAnalyticsOverview,
  AdminAnalyticsTimeseries,
  TeacherCourseAnalytics,
  TeacherCourseAnalyticsTimeseries,
} from '@/shared/types/analytics'

export const analyticsApi = api.injectEndpoints({
  endpoints: builder => ({
    getAdminAnalyticsOverview: builder.query<
      { data: AdminAnalyticsOverview },
      { periodDays?: number } | void
    >({
      query: params => ({
        url: '/analytics/admin/overview',
        method: 'GET',
        params: params ?? undefined,
      }),
      providesTags: ['AdminAnalytics'],
    }),

    getAdminAnalyticsTimeseries: builder.query<
      { data: AdminAnalyticsTimeseries },
      { periodDays?: number } | void
    >({
      query: params => ({
        url: '/analytics/admin/timeseries',
        method: 'GET',
        params: params ?? undefined,
      }),
      providesTags: ['AdminAnalytics'],
    }),

    getTeacherCourseAnalytics: builder.query<{ data: TeacherCourseAnalytics }, string>({
      query: courseId => ({
        url: `/analytics/teacher/course/${courseId}`,
        method: 'GET',
      }),
      providesTags: ['TeacherAnalytics'],
    }),

    getTeacherCourseTimeseries: builder.query<
      { data: TeacherCourseAnalyticsTimeseries },
      { courseId: string; periodDays?: number }
    >({
      query: ({ courseId, periodDays }) => ({
        url: `/analytics/teacher/course/${courseId}/timeseries`,
        method: 'GET',
        params: periodDays ? { periodDays } : undefined,
      }),
      providesTags: ['TeacherAnalytics'],
    }),
  }),
})

export const {
  useGetAdminAnalyticsOverviewQuery,
  useGetAdminAnalyticsTimeseriesQuery,
  useGetTeacherCourseAnalyticsQuery,
  useGetTeacherCourseTimeseriesQuery,
} = analyticsApi

