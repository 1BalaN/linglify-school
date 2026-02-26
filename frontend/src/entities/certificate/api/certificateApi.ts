import { api } from '@/app/store/api'
import type { Certificate } from '@/shared/types/course'

export const certificateApi = api.injectEndpoints({
  endpoints: builder => ({
    getMyCertificates: builder.query<{ data: Certificate[] }, void>({
      query: () => ({
        url: '/certificates/my',
        method: 'GET',
      }),
      providesTags: result =>
        result
          ? [
              ...result.data.map(({ id }) => ({ type: 'Certificate' as const, id })),
              { type: 'Certificate', id: 'LIST' },
            ]
          : [{ type: 'Certificate', id: 'LIST' }],
    }),

    getMyCertificateByCourse: builder.query<{ data: Certificate }, string>({
      query: courseId => ({
        url: `/certificates/my/${courseId}`,
        method: 'GET',
      }),
      providesTags: (_result, _error, courseId) => [{ type: 'Certificate', id: `COURSE-${courseId}` }],
    }),

    issueCertificate: builder.mutation<{ data: Certificate }, { courseId: string }>({
      query: body => ({
        url: '/certificates',
        method: 'POST',
        body,
      }),
      invalidatesTags: (_result, _error, { courseId }) => [
        { type: 'Certificate', id: 'LIST' },
        { type: 'Certificate', id: `COURSE-${courseId}` },
      ],
    }),

    verifyCertificate: builder.query<{ data: Certificate }, string>({
      query: code => ({
        url: `/certificates/verify/${code}`,
        method: 'GET',
      }),
      providesTags: (_result, _error, code) => [{ type: 'Certificate', id: `CODE-${code}` }],
    }),
  }),
})

export const {
  useGetMyCertificatesQuery,
  useGetMyCertificateByCourseQuery,
  useIssueCertificateMutation,
  useVerifyCertificateQuery,
} = certificateApi

