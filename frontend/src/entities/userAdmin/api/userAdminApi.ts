import { api } from '@/app/store/api'
import type { AdminUserListResponse, AdminUserOverview } from '@/shared/types/userAdmin'

export const userAdminApi = api.injectEndpoints({
  endpoints: builder => ({
    getUsersAdmin: builder.query<AdminUserListResponse, Record<string, unknown> | void>({
      query: params => ({
        url: '/users',
        method: 'GET',
        params: params ?? undefined,
      }),
      providesTags: ['User'],
    }),

    getUserOverview: builder.query<{ data: AdminUserOverview }, string>({
      query: id => ({
        url: `/users/${id}/overview`,
        method: 'GET',
      }),
      providesTags: ['User'],
    }),

    updateUserRole: builder.mutation<
      { data: { id: string } },
      { id: string; role: 'STUDENT' | 'TEACHER' | 'ADMIN' }
    >({
      query: ({ id, role }) => ({
        url: `/users/${id}/role`,
        method: 'PATCH',
        body: { role },
      }),
      invalidatesTags: ['User'],
    }),

    updateUserStatus: builder.mutation<
      { data: { id: string } },
      { id: string; isActive: boolean; reason?: string | null }
    >({
      query: ({ id, isActive, reason }) => ({
        url: `/users/${id}/status`,
        method: 'PATCH',
        body: { isActive, ...(reason !== undefined ? { reason } : {}) },
      }),
      invalidatesTags: ['User'],
    }),

    deleteUser: builder.mutation<{ message: string }, string>({
      query: id => ({
        url: `/users/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['User'],
    }),

    getUserStats: builder.query<
      { data: { students: number; teachers: number; admins: number; inactive: number; total: number } },
      void
    >({
      query: () => ({ url: '/users/stats', method: 'GET' }),
      providesTags: ['User'],
    }),
  }),
})

export const {
  useGetUsersAdminQuery,
  useGetUserOverviewQuery,
  useUpdateUserRoleMutation,
  useUpdateUserStatusMutation,
  useDeleteUserMutation,
  useGetUserStatsQuery,
} = userAdminApi

