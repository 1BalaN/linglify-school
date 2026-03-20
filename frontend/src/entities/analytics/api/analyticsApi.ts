import { api } from '@/app/store/api'
import type {
  AdminAnalyticsOverview,
  AdminAnalyticsTimeseries,
  TeacherCourseAnalytics,
  TeacherCourseAnalyticsTimeseries,
  StudentEfficiencyScore,
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

    /** Teacher/admin: all students ranked by efficiency score */
    getCourseStudentScores: builder.query<{ data: StudentEfficiencyScore[] }, string>({
      query: courseId => ({
        url: `/analytics/teacher/course/${courseId}/student-scores`,
        method: 'GET',
      }),
      providesTags: ['TeacherAnalytics'],
    }),

    /** Student: own efficiency score for a course */
    getMyEfficiencyScore: builder.query<{ data: StudentEfficiencyScore | null }, string>({
      query: courseId => ({
        url: `/analytics/course/${courseId}/my-score`,
        method: 'GET',
      }),
      // Refetch when progress is invalidated (lesson completion)
      providesTags: ['TeacherAnalytics', 'Progress'],
    }),
  }),
})

export const {
  useGetAdminAnalyticsOverviewQuery,
  useGetAdminAnalyticsTimeseriesQuery,
  useGetTeacherCourseAnalyticsQuery,
  useGetTeacherCourseTimeseriesQuery,
  useGetCourseStudentScoresQuery,
  useGetMyEfficiencyScoreQuery,
} = analyticsApi

