import { api } from '@/app/store/api'
import type { ApiResponse } from '@/shared/types/api'
import type { FAQItem, CreateFAQDto, UpdateFAQDto } from '@/shared/types/faq'

export const faqApi = api.injectEndpoints({
  endpoints: build => ({
    getAllFAQs: build.query<
      ApiResponse<{ items: FAQItem[] }>,
      { includeInactive?: boolean } | void
    >({
      query: params => ({
        url: '/faq',
        params: params || {},
      }),
      providesTags: ['FAQ'],
    }),

    getFAQById: build.query<ApiResponse<FAQItem>, string>({
      query: id => `/faq/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'FAQ', id }],
    }),

    createFAQ: build.mutation<ApiResponse<FAQItem>, CreateFAQDto>({
      query: data => ({
        url: '/faq',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['FAQ'],
    }),

    updateFAQ: build.mutation<
      ApiResponse<FAQItem>,
      { id: string; data: UpdateFAQDto }
    >({
      query: ({ id, data }) => ({
        url: `/faq/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        'FAQ',
        { type: 'FAQ', id },
      ],
    }),

    deleteFAQ: build.mutation<ApiResponse<{ message: string }>, string>({
      query: id => ({
        url: `/faq/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['FAQ'],
    }),

    reorderFAQs: build.mutation<
      ApiResponse<{ message: string }>,
      Array<{ id: string; order: number }>
    >({
      query: items => ({
        url: '/faq/reorder',
        method: 'POST',
        body: { items },
      }),
      invalidatesTags: ['FAQ'],
    }),
  }),
})

export const {
  useGetAllFAQsQuery,
  useGetFAQByIdQuery,
  useCreateFAQMutation,
  useUpdateFAQMutation,
  useDeleteFAQMutation,
  useReorderFAQsMutation,
} = faqApi
