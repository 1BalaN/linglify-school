import { api } from '@/app/store/api'
import type {
  Course,
  CoursesResponse,
  GetCoursesQuery,
  CreateCourseDto,
  UpdateCourseDto,
  CreateReviewDto,
  UpdateReviewDto,
  Review,
  Enrollment,
} from '@/shared/types/course'

export const courseApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Получить список курсов
    getCourses: builder.query<CoursesResponse, GetCoursesQuery | void>({
      query: (params) => ({
        url: '/courses',
        method: 'GET',
        params: params || undefined,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({ type: 'Course' as const, id })),
              { type: 'Course', id: 'LIST' },
            ]
          : [{ type: 'Course', id: 'LIST' }],
    }),

    // Получить курс по ID
    getCourseById: builder.query<{ data: Course }, string>({
      query: (id) => ({
        url: `/courses/${id}`,
        method: 'GET',
      }),
      providesTags: (_result, _error, id) => [{ type: 'Course', id }],
    }),

    // Создать курс
    createCourse: builder.mutation<{ data: Course }, CreateCourseDto>({
      query: (body) => ({
        url: '/courses',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Course', id: 'LIST' }],
    }),

    // Обновить курс
    updateCourse: builder.mutation<
      { data: Course },
      { id: string; data: UpdateCourseDto }
    >({
      query: ({ id, data }) => ({
        url: `/courses/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Course', id },
        { type: 'Course', id: 'LIST' },
      ],
    }),

    // Изменить статус курса
    updateCourseStatus: builder.mutation<
      { data: Course },
      { id: string; status: string }
    >({
      query: ({ id, status }) => ({
        url: `/courses/${id}/status`,
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Course', id },
        { type: 'Course', id: 'LIST' },
      ],
    }),

    // Опубликовать/снять с публикации курс
    publishCourse: builder.mutation<
      { data: Course },
      { id: string; isPublished: boolean }
    >({
      query: ({ id, isPublished }) => ({
        url: `/courses/${id}/publish`,
        method: 'PATCH',
        body: { isPublished },
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Course', id },
        { type: 'Course', id: 'LIST' },
      ],
    }),

    // Удалить курс
    deleteCourse: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/courses/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Course', id },
        { type: 'Course', id: 'LIST' },
      ],
    }),

    // Зачислить на курс
    enrollCourse: builder.mutation<{ data: Enrollment }, string>({
      query: (id) => ({
        url: `/courses/${id}/enroll`,
        method: 'POST',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Course', id },
        { type: 'Enrollment', id: 'LIST' },
      ],
    }),

    // Получить курсы пользователя
    getUserCourses: builder.query<{ data: Enrollment[] }, void>({
      query: () => ({
        url: '/courses/my/enrolled',
        method: 'GET',
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({ type: 'Enrollment' as const, id })),
              { type: 'Enrollment', id: 'LIST' },
            ]
          : [{ type: 'Enrollment', id: 'LIST' }],
    }),

    // Создать отзыв
    createReview: builder.mutation<{ data: Review }, CreateReviewDto>({
      query: (body) => ({
        url: `/courses/${body.courseId}/reviews`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (_result, _error, { courseId }) => [
        { type: 'Course', id: courseId },
        { type: 'Review', id: 'LIST' },
      ],
    }),

    // Обновить отзыв
    updateReview: builder.mutation<
      { data: Review },
      { id: string; courseId: string; data: UpdateReviewDto }
    >({
      query: ({ id, data }) => ({
        url: `/courses/reviews/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id, courseId }) => [
        { type: 'Review', id },
        { type: 'Review', id: 'LIST' },
        { type: 'Course', id: courseId },
      ],
    }),

    // Удалить отзыв
    deleteReview: builder.mutation<{ message: string }, { id: string; courseId: string }>({
      query: ({ id }) => ({
        url: `/courses/reviews/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, { id, courseId }) => [
        { type: 'Review', id },
        { type: 'Review', id: 'LIST' },
        { type: 'Course', id: courseId },
      ],
    }),
  }),
})

export const {
  useGetCoursesQuery,
  useGetCourseByIdQuery,
  useCreateCourseMutation,
  useUpdateCourseMutation,
  useUpdateCourseStatusMutation,
  usePublishCourseMutation,
  useDeleteCourseMutation,
  useEnrollCourseMutation,
  useGetUserCoursesQuery,
  useCreateReviewMutation,
  useUpdateReviewMutation,
  useDeleteReviewMutation,
} = courseApi
