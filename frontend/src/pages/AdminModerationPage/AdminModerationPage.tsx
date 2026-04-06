import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import type { RootState } from '@/app/store'
import { AlertCircle, Shield } from 'lucide-react'
import { Button, ConfirmModal } from '@/shared/ui'
import { CoursesFilters, CoursesList, useAdminModeration } from '@/features/admin/moderation'

export const AdminModerationPage = () => {
  const { t } = useTranslation('platform', { keyPrefix: 'admin.moderation' })
  const navigate = useNavigate()
  const user = useSelector((s: RootState) => s.auth.user)

  const {
    courses,
    stats,
    isLoading,
    selectedStatus,
    setSelectedStatus,
    changeStatus,
    removeCourse,
    actionLoading,
    message,
  } = useAdminModeration()

  const [deleteCourseId, setDeleteCourseId] = useState<string | null>(null)

  if (!user || user.role !== 'ADMIN') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="glass-card p-8 text-center">
          <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-500" />
          <h2 className="mb-2 text-xl font-bold">{t('accessDenied')}</h2>
          <Button onClick={() => navigate('/')}>{t('home')}</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 py-8">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-pink-600">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gradient">
            {t('pageTitle')}
          </h1>
        </div>

        {message ? (
          <div className="mb-6 text-sm">{t(message.messageKey)}</div>
        ) : null}

        <CoursesFilters
          value={selectedStatus}
          stats={stats}
          onChange={setSelectedStatus}
        />

        <CoursesList
          courses={courses}
          isLoading={isLoading}
          actionLoading={actionLoading}
          onStatusChange={changeStatus}
          onDelete={id => setDeleteCourseId(id)}
        />
      </div>

      <ConfirmModal
        isOpen={!!deleteCourseId}
        onClose={() => setDeleteCourseId(null)}
        onConfirm={async () => {
          if (!deleteCourseId) return
          await removeCourse(deleteCourseId)
          setDeleteCourseId(null)
        }}
        title={t('deleteCourseTitle')}
        message={t('deleteCourseMsg')}
        confirmText={t('deleteCourseConfirm')}
        cancelText={t('cancel')}
        variant="danger"
      />
    </div>
  )
}