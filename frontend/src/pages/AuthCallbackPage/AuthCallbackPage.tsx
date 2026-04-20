import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { setCredentials } from '@/entities/user'
import { useGetCurrentUserQuery } from '@/entities/user'
import { useTranslation } from 'react-i18next'

export const AuthCallbackPage = () => {
  const { t } = useTranslation('platform')
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const accessToken = searchParams.get('accessToken')
  const [tokenSet, setTokenSet] = useState(false)

  // Set token first
  useEffect(() => {
    if (accessToken && !tokenSet) {
      localStorage.setItem('accessToken', accessToken)
      setTokenSet(true)
    } else if (!accessToken) {
      navigate('/login', { replace: true })
    }
  }, [accessToken, tokenSet, navigate])

  // Fetch user only after token is stored
  const { data, error, isLoading } = useGetCurrentUserQuery(undefined, {
    skip: !tokenSet,
  })

  useEffect(() => {
    if (data?.data && accessToken) {
      dispatch(setCredentials({ user: data.data, accessToken }))
      navigate('/', { replace: true })
    }

    if (error) {
      localStorage.removeItem('accessToken')
      navigate('/login', { replace: true })
    }
  }, [data, error, accessToken, dispatch, navigate])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-muted-foreground">{t('authFlow.callback.googleWait')}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center">
        <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-muted-foreground">{t('authFlow.callback.processing')}</p>
      </div>
    </div>
  )
}
