import { api } from '@/app/store/api'
import type {
  Lesson,
  CreateLessonDto,
  UpdateLessonDto,
  Question,
  CreateQuestionDto,
  UpdateQuestionDto,
  Answer,
  SubmitAnswerDto,
  LessonProgress,
  UpdateProgressDto,
  CourseProgressResponse,
} from '@/shared/types/course'

export const lessonApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Получить урок по ID
    getLessonById: builder.query<{ data: Lesson }, string>({
      query: (id) => ({
        url: `/lessons/${id}`,
        method: 'GET',
      }),
      providesTags: (_result, _error, id) => [{ type: 'Lesson', id }],
    }),

    // Получить уроки курса
    getCourseLessons: builder.query<{ data: Lesson[] }, string>({
      query: (courseId) => ({
        url: `/courses/${courseId}/lessons`,
        method: 'GET',
      }),
      providesTags: (result, _error, courseId) =>
        result
          ? [
              ...result.data.map(({ id }) => ({ type: 'Lesson' as const, id })),
              { type: 'Lesson', id: `COURSE-${courseId}` },
            ]
          : [{ type: 'Lesson', id: `COURSE-${courseId}` }],
    }),

    // Создать урок
    createLesson: builder.mutation<{ data: Lesson }, CreateLessonDto>({
      query: (body) => ({
        url: '/lessons',
        method: 'POST',
        body,
      }),
      invalidatesTags: (_result, _error, { courseId }) => [
        { type: 'Lesson', id: `COURSE-${courseId}` },
        { type: 'Course', id: courseId },
      ],
    }),

    // Обновить урок
    updateLesson: builder.mutation<
      { data: Lesson },
      { id: string; data: UpdateLessonDto }
    >({
      query: ({ id, data }) => ({
        url: `/lessons/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Lesson', id },
      ],
    }),

    // Удалить урок
    deleteLesson: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/lessons/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Lesson', id },
      ],
    }),

    // Создать вопрос
    createQuestion: builder.mutation<{ data: Question }, CreateQuestionDto>({
      query: (body) => ({
        url: '/questions',
        method: 'POST',
        body,
      }),
      invalidatesTags: (_result, _error, { lessonId }) => [
        { type: 'Lesson', id: lessonId },
        { type: 'Question', id: 'LIST' },
      ],
    }),

    // Обновить вопрос
    updateQuestion: builder.mutation<
      { data: Question },
      { id: string; data: UpdateQuestionDto }
    >({
      query: ({ id, data }) => ({
        url: `/questions/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Question', id },
      ],
    }),

    // Удалить вопрос
    deleteQuestion: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/questions/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Question', id },
      ],
    }),

    // Отправить ответ на вопрос
    submitAnswer: builder.mutation<{ data: Answer }, SubmitAnswerDto>({
      query: (body) => ({
        url: '/questions/answer',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Progress', id: 'LIST' }],
    }),

    // Обновить прогресс урока
    updateProgress: builder.mutation<{ data: LessonProgress }, UpdateProgressDto>({
      query: (body) => ({
        url: '/lessons/progress',
        method: 'POST',
        body,
      }),
      invalidatesTags: (_result, _error, { lessonId }) => [
        { type: 'Progress', id: lessonId },
        { type: 'Progress', id: 'LIST' },
        { type: 'Lesson', id: lessonId },
      ],
    }),

    // Получить прогресс курса
    getCourseProgress: builder.query<{ data: CourseProgressResponse }, string>({
      query: (courseId) => ({
        url: `/courses/${courseId}/progress`,
        method: 'GET',
      }),
      providesTags: (_result, _error, courseId) => [
        { type: 'Progress', id: `COURSE-${courseId}` },
      ],
    }),
  }),
})

export const {
  useGetLessonByIdQuery,
  useGetCourseLessonsQuery,
  useCreateLessonMutation,
  useUpdateLessonMutation,
  useDeleteLessonMutation,
  useCreateQuestionMutation,
  useUpdateQuestionMutation,
  useDeleteQuestionMutation,
  useSubmitAnswerMutation,
  useUpdateProgressMutation,
  useGetCourseProgressQuery,
} = lessonApi
