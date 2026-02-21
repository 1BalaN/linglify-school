import { Routes, Route } from 'react-router-dom'
import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { Header, Footer } from '@/widgets'
import {
  HomePage,
  LoginPage,
  RegisterPage,
  ProfilePage,
  AuthCallbackPage,
  VerifyEmailPage,
  NotFoundPage,
  ForgotPasswordPage,
  ResetPasswordPage,
  HelpPage,
  FAQPage,
  ContactPage,
  PrivacyPage,
  TermsPage,
  AdminDashboardPage,
  AdminFAQPage,
  AdminMessagesPage,
  AdminCoursesPage,
  AdminModerationPage,
  CoursesPage,
  CourseDetailPage,
  CourseLessonsPage,
  StudentCoursePage,
  LessonPage,
  MyCoursesPage,
} from '@/pages'
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
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/auth/callback" element={<AuthCallbackPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          
          {/* Support pages */}
          <Route path="/help" element={<HelpPage />} />
          <Route path="/faq" element={<FAQPage />} />
          <Route path="/contact" element={<ContactPage />} />
          
          {/* Admin pages */}
          <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
          <Route path="/admin/faq" element={<AdminFAQPage />} />
          <Route path="/admin/messages" element={<AdminMessagesPage />} />
          <Route path="/admin/courses" element={<AdminCoursesPage />} />
          <Route path="/admin/moderation" element={<AdminModerationPage />} />
          
          {/* Legal pages */}
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          
          {/* Course routes */}
          <Route path="/courses" element={<CoursesPage />} />
          <Route path="/courses/:id" element={<CourseDetailPage />} />
          <Route path="/courses/:id/lessons" element={<CourseLessonsPage />} />
          <Route path="/courses/:id/learn" element={<StudentCoursePage />} />
          <Route path="/my-courses" element={<MyCoursesPage />} />
          <Route path="/lessons/:lessonId" element={<LessonPage />} />
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
          
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

export default App
