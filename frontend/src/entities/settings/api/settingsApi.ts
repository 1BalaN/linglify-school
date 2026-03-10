import { api } from '@/app/store/api'
import type { PlatformSettings } from '@/shared/types/settings'

export const settingsApi = api.injectEndpoints({
  endpoints: builder => ({
    getPlatformSettings: builder.query<{ data: PlatformSettings }, void>({
      query: () => ({
        url: '/settings/platform',
        method: 'GET',
      }),
      providesTags: ['PlatformSettings'],
    }),

    updatePlatformSettings: builder.mutation<
      { data: PlatformSettings },
      Partial<PlatformSettings>
    >({
      query: body => ({
        url: '/settings/platform',
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['PlatformSettings', 'AdminAnalytics'],
    }),
  }),
})

export const { useGetPlatformSettingsQuery, useUpdatePlatformSettingsMutation } = settingsApi

