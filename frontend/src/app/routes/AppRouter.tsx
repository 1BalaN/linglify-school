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
  AdminAnalyticsPage,
  AdminFAQPage,
  AdminMessagesPage,
  AdminUsersPage,
  AdminCoursesPage,
  AdminModerationPage,
  AdminPlacementPage,
  AdminSettingsPage,
  CoursesPage,
  CourseDetailPage,
  CourseAnalyticsPage,
  CourseLessonsPage,
  StudentCoursePage,
  LessonPage,
  MyCoursesPage,
  AboutPage,
  CertificateViewPage,
  PaymentSuccessPage,
  PaymentCancelPage,
  PlacementTestPage,
  BecomeTeacherPage,
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
          
      {/* Support / static pages */}
      <Route path="/help" element={<HelpPage />} />
      <Route path="/faq" element={<FAQPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/about" element={<AboutPage />} />
          
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
        path="/admin/analytics"
        element={(
          <ProtectedRoute roles={['ADMIN']}>
            <AdminAnalyticsPage />
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
        path="/admin/users"
        element={(
          <ProtectedRoute roles={['ADMIN']}>
            <AdminUsersPage />
          </ProtectedRoute>
        )}
      />
      <Route
        path="/admin/placement"
        element={(
          <ProtectedRoute roles={['ADMIN']}>
            <AdminPlacementPage />
          </ProtectedRoute>
        )}
      />
      <Route
        path="/admin/settings"
        element={(
          <ProtectedRoute roles={['ADMIN']}>
            <AdminSettingsPage />
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
        path="/courses/:id/analytics"
        element={(
          <ProtectedRoute roles={['TEACHER', 'ADMIN']}>
            <CourseAnalyticsPage />
          </ProtectedRoute>
        )}
      />
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
      <Route path="/certificates/:code" element={<CertificateViewPage />} />
      <Route path="/become-teacher" element={<BecomeTeacherPage />} />
      <Route path="/payment/success" element={<PaymentSuccessPage />} />
      <Route path="/payment/cancel" element={<PaymentCancelPage />} />
      <Route path="/placement-test" element={<PlacementTestPage />} />
          
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}