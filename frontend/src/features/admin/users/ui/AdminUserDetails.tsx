import { useTranslation } from 'react-i18next'
import type { AdminUserOverview } from '@/shared/types/userAdmin'
import { Button, ConfirmModal } from '@/shared/ui'
import { useState } from 'react'
import {
  useUpdateUserRoleMutation,
  useUpdateUserStatusMutation,
  useDeleteUserMutation,
} from '@/entities/userAdmin/api/userAdminApi'

interface AdminUserDetailsProps {
  overview: AdminUserOverview | null
  onClose?: () => void
}

export const AdminUserDetails = ({ overview }: AdminUserDetailsProps) => {
  const { t } = useTranslation('platform', { keyPrefix: 'admin.userDetails' })
  const { i18n } = useTranslation('platform')
  const locale = i18n.language.startsWith('ru') ? 'ru-RU' : 'en-US'
  const [confirmStatusOpen, setConfirmStatusOpen] = useState(false)
  const [confirmRoleOpen, setConfirmRoleOpen] = useState(false)
  const [updateUserStatus] = useUpdateUserStatusMutation()
  const [updateUserRole] = useUpdateUserRoleMutation()
  const [deleteUser] = useDeleteUserMutation()
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false)
  const [statusReason, setStatusReason] = useState('')

  if (!overview) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
        {t('pickUser')}
      </div>
    )
  }

  const { user, courses, stats, placement } = overview

  const fullName =
    user.firstName || user.lastName
      ? `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim()
      : user.email

  const isAdmin = user.role === 'ADMIN'
  const canToggleRole = user.role === 'STUDENT' || user.role === 'TEACHER'

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-foreground">{fullName}</h2>
          <p className="text-xs text-muted-foreground">{user.email}</p>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px]">
            <span className="rounded-full bg-muted px-2 py-0.5 font-medium text-foreground">
              {t('role', { role: user.role })}
            </span>
            <span
              className={`rounded-full px-2 py-0.5 font-medium ${
                user.isActive
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                  : 'bg-red-500/10 text-red-600 dark:text-red-400'
              }`}
            >
              {user.isActive ? t('active') : t('frozen')}
            </span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          {isAdmin ? (
            <p className="max-w-[220px] text-right text-[11px] text-muted-foreground">
              {t('adminNote')}
            </p>
          ) : (
            <>
              <Button
                size="sm"
                variant={user.isActive ? 'outline' : 'primary'}
                onClick={() => setConfirmStatusOpen(true)}
              >
                {user.isActive ? t('freeze') : t('unfreeze')}
              </Button>
              {canToggleRole && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setConfirmRoleOpen(true)}
                >
                  {user.role === 'STUDENT' ? t('makeTeacher') : t('makeStudent')}
                </Button>
              )}
              <Button
                size="sm"
                variant="danger"
                onClick={() => setConfirmDeleteOpen(true)}
              >
                {t('delete')}
              </Button>
            </>
          )}
        </div>
      </div>

      {user.isActive && !isAdmin && (
        <div className="rounded-xl border border-border/60 bg-background/60 p-3 text-xs shadow-sm">
          <p className="mb-1 font-semibold text-foreground">{t('reasonTitle')}</p>
          <p className="mb-2 text-[11px] text-muted-foreground">{t('reasonHelp')}</p>
          <textarea
            className="min-h-[72px] w-full resize-none rounded-md border border-border bg-background px-2 py-1 text-xs outline-none focus:ring-1 focus:ring-primary scroll-soft"
            placeholder={t('reasonPh')}
            value={statusReason}
            onChange={e => setStatusReason(e.target.value)}
          />
        </div>
      )}

      {!user.isActive && user.deactivationReason && (
        <div className="rounded-xl border border-amber-500/40 bg-amber-500/5 p-3 text-xs shadow-sm">
          <p className="mb-1 font-semibold text-foreground">{t('reasonShown')}</p>
          <p className="whitespace-pre-wrap text-[11px] text-amber-800 dark:text-amber-300">
            {user.deactivationReason}
          </p>
        </div>
      )}
      <div className="grid grid-cols-2 gap-3 text-xs">
        <div className="rounded-xl bg-muted/60 p-3 shadow-sm">
          <p className="text-muted-foreground">{t('statCourses')}</p>
          <p className="text-lg font-semibold text-foreground">{stats.totalCourses}</p>
        </div>
        <div className="rounded-xl bg-muted/60 p-3 shadow-sm">
          <p className="text-muted-foreground">{t('statCompleted')}</p>
          <p className="text-lg font-semibold text-foreground">{stats.completedCourses}</p>
        </div>
        <div className="rounded-xl bg-muted/60 p-3 shadow-sm">
          <p className="text-muted-foreground">{t('statLessons')}</p>
          <p className="text-lg font-semibold text-foreground">
            {stats.completedLessons}/{stats.totalLessons}
          </p>
        </div>
        <div className="rounded-xl bg-muted/60 p-3 shadow-sm">
          <p className="text-muted-foreground">{t('statCerts')}</p>
          <p className="text-lg font-semibold text-foreground">{stats.certificatesCount}</p>
        </div>
      </div>

      {placement && (
        <div className="rounded-xl border border-border/60 bg-background/60 p-3 shadow-sm">
          <p className="mb-1 text-xs font-semibold text-foreground">{t('placement')}</p>
          <p className="text-xs text-muted-foreground">
            {t('language')}{' '}
            <span className="font-medium text-foreground">{placement.language}</span>
          </p>
          {placement.estimatedLevel && (
            <p className="text-xs text-muted-foreground">
              {t('level')}{' '}
              <span className="font-medium text-foreground">{placement.estimatedLevel}</span>
            </p>
          )}
          {placement.finishedAt && (
            <p className="text-xs text-muted-foreground">
              {t('date')}{' '}
              <span className="font-medium text-foreground">
                {new Date(placement.finishedAt).toLocaleDateString(locale)}
              </span>
            </p>
          )}
        </div>
      )}

      <div className="mt-2 flex-1 overflow-y-auto rounded-xl border border-border/60 bg-background/40 p-3 scroll-soft">
        <p className="mb-2 text-xs font-semibold text-foreground">{t('userCourses')}</p>
        {courses.length === 0 ? (
          <p className="text-xs text-muted-foreground">{t('noCourses')}</p>
        ) : (
          <ul className="space-y-2">
            {courses.map(course => (
              <li
                key={course.id}
                className="rounded-lg border border-border/60 bg-card/40 p-2 text-xs"
              >
                <p className="font-medium text-foreground line-clamp-1">{course.title}</p>
                <div className="mt-0.5 flex items-center justify-between text-[11px] text-muted-foreground">
                  <span>{t('courseLevel', { level: course.level })}</span>
                  <span>
                    {course.status === 'COMPLETED'
                      ? t('statusCompleted')
                      : course.status === 'IN_PROGRESS'
                        ? t('statusProgress')
                        : t('statusNotStarted')}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <ConfirmModal
        isOpen={confirmStatusOpen}
        onClose={() => setConfirmStatusOpen(false)}
        onConfirm={async () => {
          await updateUserStatus({
            id: user.id,
            isActive: !user.isActive,
            // When freezing an active user, send reason; clearing on unfreeze.
            reason: user.isActive ? statusReason.trim() || null : null,
          }).unwrap()
          setConfirmStatusOpen(false)
          setStatusReason('')
        }}
        title={user.isActive ? t('confirmFreezeTitle') : t('confirmUnfreezeTitle')}
        message={user.isActive ? t('confirmFreezeMsg') : t('confirmUnfreezeMsg')}
        confirmText={user.isActive ? t('confirmFreezeAction') : t('confirmUnfreezeAction')}
        cancelText={t('cancel')}
        variant="primary"
      />

      {canToggleRole && (
        <ConfirmModal
          isOpen={confirmRoleOpen}
          onClose={() => setConfirmRoleOpen(false)}
          onConfirm={async () => {
            const nextRole = user.role === 'STUDENT' ? 'TEACHER' : 'STUDENT'
            await updateUserRole({ id: user.id, role: nextRole }).unwrap()
            setConfirmRoleOpen(false)
          }}
          title={t('roleModalTitle')}
          message={user.role === 'STUDENT' ? t('roleToTeacher') : t('roleToStudent')}
          confirmText={t('roleConfirm')}
          cancelText={t('cancel')}
          variant="primary"
        />
      )}

      <ConfirmModal
        isOpen={confirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
        onConfirm={async () => {
          await deleteUser(user.id).unwrap()
          setConfirmDeleteOpen(false)
        }}
        title={t('deleteTitle')}
        message={t('deleteMsg')}
        confirmText={t('deleteConfirm')}
        cancelText={t('cancel')}
        variant="danger"
      />
    </div>
  )
}

