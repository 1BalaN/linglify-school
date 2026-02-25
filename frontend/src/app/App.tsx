import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { Header, Footer } from '@/widgets'
import { useGetCurrentUserQuery } from '@/entities/user'
import { setUser, logout } from '@/entities/user'
import { EmailVerificationBanner } from '@/features/auth'
import { AppRouter } from '@/app/routes/AppRouter'

function App() {
  const dispatch = useDispatch()
  const { data, error, isLoading } = useGetCurrentUserQuery(undefined, {
    skip: !localStorage.getItem('accessToken'),
  })

  useEffect(() => {
    if (data?.data) {
      dispatch(setUser(data.data))
    } else if (error) {
      dispatch(logout())
    }
  }, [data, error, dispatch])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-background transition-colors duration-300">
      <Header />
      <EmailVerificationBanner />
      <main className="flex-1">
        <AppRouter />
      </main>
      <Footer />
    </div>
  )
}

export default App
