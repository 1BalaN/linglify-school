import { api } from '@/app/store/api'
import type {
  StartPlacementResponse,
  SubmitPlacementResponse,
  PlacementResultResponse,
  PlacementRecommendedCourse,
  PlacementQuestion,
  PlacementQuestionType,
} from '@/shared/types/placement'

export interface StartPlacementRequest {
  language: string
}

export interface SubmitPlacementRequest {
  sessionId: string
  questionId: string
  optionIndex: number
  timeMs?: number
}

export interface GetPlacementResultRequest {
  sessionId: string
}

export interface GetPlacementQuestionsQuery {
  language?: string
  type?: PlacementQuestionType
  difficulty?: number
  page?: number
  limit?: number
}

export interface PlacementQuestionsListResponse {
  items: (PlacementQuestion & { correctOptionIndex: number })[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface CreatePlacementQuestionRequest {
  language: string
  type: PlacementQuestionType
  difficulty: number
  prompt: string
  context?: string
  mediaUrl?: string
  options: string[]
  correctOptionIndex: number
  explanation?: string
}

export interface UpdatePlacementQuestionRequest extends Partial<CreatePlacementQuestionRequest> {
  id: string
}

export const placementApi = api.injectEndpoints({
  endpoints: builder => ({
    startPlacement: builder.mutation<{ data: StartPlacementResponse }, StartPlacementRequest>({
      query: body => ({
        url: '/placement/start',
        method: 'POST',
        body,
      }),
    }),

    submitPlacementAnswer: builder.mutation<{ data: SubmitPlacementResponse }, SubmitPlacementRequest>({
      query: body => ({
        url: '/placement/answer',
        method: 'POST',
        body,
      }),
    }),

    getPlacementResult: builder.query<{ data: PlacementResultResponse }, GetPlacementResultRequest>({
      query: ({ sessionId }) => ({
        url: '/placement/result',
        method: 'GET',
        params: { sessionId },
      }),
    }),

    getPlacementRecommendedCourses: builder.query<{ data: PlacementRecommendedCourse[] }, GetPlacementResultRequest>({
      query: ({ sessionId }) => ({
        url: '/placement/recommended-courses',
        method: 'GET',
        params: { sessionId },
      }),
      providesTags: ['Course'],
    }),

    getPlacementQuestions: builder.query<
      { data: { items: PlacementQuestionsListResponse['items']; pagination: PlacementQuestionsListResponse['pagination'] } },
      GetPlacementQuestionsQuery | void
    >({
      query: params => ({
        url: '/placement/questions',
        method: 'GET',
        params: params || undefined,
      }),
      providesTags: result =>
        result
          ? [
              ...result.data.items.map(question => ({ type: 'PlacementQuestion' as const, id: question.id })),
              { type: 'PlacementQuestion' as const, id: 'LIST' },
            ]
          : [{ type: 'PlacementQuestion' as const, id: 'LIST' }],
    }),

    createPlacementQuestion: builder.mutation<
      { data: PlacementQuestion & { correctOptionIndex: number; explanation?: string | null } },
      CreatePlacementQuestionRequest
    >({
      query: body => ({
        url: '/placement/questions',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'PlacementQuestion', id: 'LIST' }],
    }),

    updatePlacementQuestion: builder.mutation<
      { data: PlacementQuestion & { correctOptionIndex: number; explanation?: string | null } },
      UpdatePlacementQuestionRequest
    >({
      query: ({ id, ...data }) => ({
        url: `/placement/questions/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'PlacementQuestion', id },
        { type: 'PlacementQuestion', id: 'LIST' },
      ],
    }),

    deletePlacementQuestion: builder.mutation<{ message: string }, string>({
      query: id => ({
        url: `/placement/questions/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'PlacementQuestion', id },
        { type: 'PlacementQuestion', id: 'LIST' },
      ],
    }),
  }),
})

export const {
  useStartPlacementMutation,
  useSubmitPlacementAnswerMutation,
  useGetPlacementResultQuery,
  useGetPlacementRecommendedCoursesQuery,
  useGetPlacementQuestionsQuery,
  useCreatePlacementQuestionMutation,
  useUpdatePlacementQuestionMutation,
  useDeletePlacementQuestionMutation,
} = placementApi

