import { Routes, Route } from "react-router-dom"
import { ProtectedRoute } from "./ProtectedRoutes"
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


export const AppRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/auth/callback" element={<AuthCallbackPage />} />
      <Route path="/verify-email" element={<VerifyEmailPage />} />
      <Route
        path="/profile"
        element={(
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        )}
      />
          
      {/* Support pages */}
      <Route path="/help" element={<HelpPage />} />
      <Route path="/faq" element={<FAQPage />} />
      <Route path="/contact" element={<ContactPage />} />
          
      {/* Admin / teacher pages */}
      <Route
        path="/admin/dashboard"
        element={(
          <ProtectedRoute roles={['ADMIN']}>
            <AdminDashboardPage />
          </ProtectedRoute>
        )}
      />
      <Route
        path="/admin/faq"
        element={(
          <ProtectedRoute roles={['ADMIN']}>
            <AdminFAQPage />
          </ProtectedRoute>
        )}
      />
      <Route
        path="/admin/messages"
        element={(
          <ProtectedRoute roles={['ADMIN']}>
            <AdminMessagesPage />
          </ProtectedRoute>
        )}
      />
      <Route
        path="/admin/courses"
        element={(
          <ProtectedRoute roles={['TEACHER', 'ADMIN']}>
            <AdminCoursesPage />
          </ProtectedRoute>
        )}
      />
      <Route
        path="/admin/moderation"
        element={(
          <ProtectedRoute roles={['ADMIN']}>
            <AdminModerationPage />
          </ProtectedRoute>
        )}
      />
          
      {/* Legal pages */}
      <Route path="/privacy" element={<PrivacyPage />} />
      <Route path="/terms" element={<TermsPage />} />
          
      {/* Course routes */}
      <Route path="/courses" element={<CoursesPage />} />
      <Route path="/courses/:id" element={<CourseDetailPage />} />
      <Route
        path="/courses/:id/lessons"
        element={(
          <ProtectedRoute roles={['TEACHER', 'ADMIN']}>
            <CourseLessonsPage />
          </ProtectedRoute>
        )}
      />
      <Route
        path="/courses/:id/learn"
        element={(
          <ProtectedRoute>
            <StudentCoursePage />
          </ProtectedRoute>
        )}
      />
      <Route
        path="/my-courses"
        element={(
          <ProtectedRoute>
            <MyCoursesPage />
          </ProtectedRoute>
        )}
      />
      <Route
        path="/lessons/:lessonId"
        element={(
          <ProtectedRoute>
            <LessonPage />
          </ProtectedRoute>
        )}
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
          
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}