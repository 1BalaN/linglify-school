import { Routes, Route } from 'react-router-dom'
import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { Header, Footer } from '@/widgets'
import { HomePage, LoginPage, RegisterPage, ProfilePage, AuthCallbackPage, VerifyEmailPage, NotFoundPage } from '@/pages'
import { useGetCurrentUserQuery } from '@/entities/user'
import { setUser, logout } from '@/entities/user'
import { EmailVerificationBanner } from '@/features/auth'

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
          <p className="text-muted-foreground">Загрузка...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-background transition-colors duration-300">
      <Header />
      <EmailVerificationBanner />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/auth/callback" element={<AuthCallbackPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          
          {/* Placeholder routes */}
          <Route
            path="/courses"
            element={
              <div className="container mx-auto px-4 py-12 text-center">
                <h1 className="text-3xl font-bold text-gray-900">
                  Курсы (в разработке)
                </h1>
              </div>
            }
          />
          <Route
            path="/about"
            element={
              <div className="container mx-auto px-4 py-12 text-center">
                <h1 className="text-3xl font-bold text-gray-900">
                  О платформе (в разработке)
                </h1>
              </div>
            }
          />
          <Route
            path="/pricing"
            element={
              <div className="container mx-auto px-4 py-12 text-center">
                <h1 className="text-3xl font-bold text-gray-900">
                  Тарифы (в разработке)
                </h1>
              </div>
            }
          />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

export default App
