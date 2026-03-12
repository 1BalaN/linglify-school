import { api } from '@/app/store/api'
import type {
  ChatThreadListResponse,
  ChatMessagesResponse,
  ChatMessage,
  ChatThread,
} from '@/shared/types/chat'

export const chatApi = api.injectEndpoints({
  endpoints: builder => ({
    getMyThreads: builder.query<ChatThreadListResponse, void>({
      query: () => ({
        url: '/chats/my',
        method: 'GET',
      }),
      providesTags: ['Chat'],
    }),

    getThreadMessages: builder.query<ChatMessagesResponse, { threadId: string; cursor?: string }>({
      query: ({ threadId, cursor }) => ({
        url: `/chats/${threadId}/messages`,
        method: 'GET',
        params: cursor ? { cursor } : undefined,
      }),
      providesTags: (_res, _err, arg) => [{ type: 'Chat', id: arg.threadId }],
    }),

    sendMessage: builder.mutation<
      { data: ChatMessage },
      { threadId: string; text: string; attachments?: ChatMessage['attachments'] }
    >({
      query: ({ threadId, text, attachments }) => ({
        url: `/chats/${threadId}/messages`,
        method: 'POST',
        body: { text, attachments },
      }),
      invalidatesTags: (_res, _err, arg) => [{ type: 'Chat', id: arg.threadId }],
    }),

    markThreadAsRead: builder.mutation<{ message: string }, { threadId: string }>({
      query: ({ threadId }) => ({
        url: `/chats/${threadId}/read`,
        method: 'POST',
      }),
      invalidatesTags: (_res, _err, arg) => [{ type: 'Chat', id: arg.threadId }],
    }),

    ensureSupportThread: builder.mutation<{ data: ChatThread }, void>({
      query: () => ({
        url: '/chats/support/ensure',
        method: 'POST',
      }),
      invalidatesTags: ['Chat'],
    }),

    ensureCourseThread: builder.mutation<{ data: ChatThread }, { courseId: string }>({
      query: ({ courseId }) => ({
        url: '/chats/course/ensure',
        method: 'POST',
        body: { courseId },
      }),
      invalidatesTags: ['Chat'],
    }),
  }),
})

export const {
  useGetMyThreadsQuery,
  useGetThreadMessagesQuery,
  useSendMessageMutation,
  useMarkThreadAsReadMutation,
  useEnsureSupportThreadMutation,
  useEnsureCourseThreadMutation,
} = chatApi

