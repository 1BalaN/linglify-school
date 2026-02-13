export { authSlice, setCredentials, setUser, logout } from './model/authSlice'
export {
  authApi,
  useRegisterMutation,
  useLoginMutation,
  useLogoutMutation,
  useGetCurrentUserQuery,
  useRefreshTokenMutation,
  useUpdateProfileMutation,
  useChangePasswordMutation,
  useSendPhoneVerificationMutation,
  useVerifyPhoneMutation,
  useResendVerificationMutation,
  useVerifyEmailMutation,
} from './api/authApi'
