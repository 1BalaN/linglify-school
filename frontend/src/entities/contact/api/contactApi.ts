import { api } from '@/app/store/api'
import type { ApiResponse } from '@/shared/types/api'
import type {
  SendContactMessageDto,
  ContactMessage,
} from '@/shared/types/contact'

export const contactApi = api.injectEndpoints({
  endpoints: build => ({
    sendContactMessage: build.mutation<
      ApiResponse<{ message: string; id: string }>,
      SendContactMessageDto
    >({
      query: data => ({
        url: '/contact',
        method: 'POST',
        body: data,
      }),
    }),

    getAllContactMessages: build.query<
      ApiResponse<{ messages: ContactMessage[] }>,
      { includeRead?: boolean } | void
    >({
      query: params => ({
        url: '/contact',
        params: params || {},
      }),
      providesTags: ['Contact'],
    }),

    markMessageAsRead: build.mutation<ApiResponse<ContactMessage>, string>({
      query: id => ({
        url: `/contact/${id}/read`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Contact'],
    }),

    markMessageAsReplied: build.mutation<
      ApiResponse<ContactMessage>,
      { id: string; adminNote?: string }
    >({
      query: ({ id, adminNote }) => ({
        url: `/contact/${id}/replied`,
        method: 'PATCH',
        body: { adminNote },
      }),
      invalidatesTags: ['Contact'],
    }),

    updateAdminNote: build.mutation<
      ApiResponse<ContactMessage>,
      { id: string; adminNote: string }
    >({
      query: ({ id, adminNote }) => ({
        url: `/contact/${id}/note`,
        method: 'PATCH',
        body: { adminNote },
      }),
      invalidatesTags: ['Contact'],
    }),

    deleteContactMessage: build.mutation<
      ApiResponse<{ message: string }>,
      string
    >({
      query: id => ({
        url: `/contact/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Contact'],
    }),
  }),
})

export const {
  useSendContactMessageMutation,
  useGetAllContactMessagesQuery,
  useMarkMessageAsReadMutation,
  useMarkMessageAsRepliedMutation,
  useUpdateAdminNoteMutation,
  useDeleteContactMessageMutation,
} = contactApi
