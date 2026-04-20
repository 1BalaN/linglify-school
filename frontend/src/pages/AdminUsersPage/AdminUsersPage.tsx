import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  useGetUsersAdminQuery,
  useGetUserOverviewQuery,
  useGetUserStatsQuery,
} from '@/entities/userAdmin/api/userAdminApi'
import { AdminUsersTable, AdminUserDetails } from '@/features/admin/users'
import { Modal, Button } from '@/shared/ui'
import type { AdminUserListItem } from '@/shared/types/userAdmin'

export const AdminUsersPage = () => {
  const { t, i18n } = useTranslation('platform', { keyPrefix: 'admin.usersPage' })
  const locale = i18n.language.startsWith('ru') ? 'ru-RU' : 'en-US'
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<string | null>(null)
  const [segment, setSegment] = useState<string | null>(null)
  const [selectedUser, setSelectedUser] = useState<AdminUserListItem | null>(null)
  const [page, setPage] = useState(1)

  const queryParams: Record<string, unknown> = {
    page,
    ...(search && { search }),
    ...(roleFilter && { role: roleFilter }),
    ...(segment && { segment }),
  }

  const { data, isLoading } = useGetUsersAdminQuery(queryParams)
  const { data: overviewData } = useGetUserOverviewQuery(selectedUser?.id ?? '', {
    skip: !selectedUser,
  })
  // Overview stats are global (not scoped to the table filters).
  const { data: statsData } = useGetUserStatsQuery()

  const users = data?.data.data ?? []
  const pagination = data?.data.pagination

  const totalUsers = statsData?.data.total ?? pagination?.total ?? 0
  const studentsCount = statsData?.data.students ?? 0
  const teachersCount = statsData?.data.teachers ?? 0
  const inactiveCount = statsData?.data.inactive ?? 0

  const handlePageChange = (nextPage: number) => {
    if (!pagination) return
    if (nextPage < 1 || nextPage > pagination.totalPages) return
    setPage(nextPage)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="border-b border-border bg-background/60 backdrop-blur">
        <div className="container mx-auto max-w-7xl px-4 py-6">
          <h1 className="text-2xl font-bold text-foreground">{t('title')}</h1>
          <p className="text-sm text-muted-foreground">{t('subtitle')}</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 grid gap-4 md:grid-cols-4">
          <div className="rounded-2xl border border-border bg-card p-4">
            <p className="text-xs text-muted-foreground">{t('statTotal')}</p>
            <p className="mt-1 text-2xl font-semibold text-foreground">{totalUsers}</p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-4">
            <p className="text-xs text-muted-foreground">{t('statStudents')}</p>
            <p className="mt-1 text-2xl font-semibold text-foreground">{studentsCount}</p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-4">
            <p className="text-xs text-muted-foreground">{t('statTeachers')}</p>
            <p className="mt-1 text-2xl font-semibold text-foreground">{teachersCount}</p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-4">
            <p className="text-xs text-muted-foreground">{t('statFrozen')}</p>
            <p className="mt-1 text-2xl font-semibold text-foreground">{inactiveCount}</p>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card/60 p-4 shadow-sm">
          <div className="flex flex-col gap-4">
            <AdminUsersTable
              users={users}
              isLoading={isLoading}
              search={search}
              onSearchChange={value => {
                setSearch(value)
                setPage(1)
              }}
              roleFilter={roleFilter}
              onRoleFilterChange={value => {
                setRoleFilter(value)
                setPage(1)
              }}
              segment={segment}
              onSegmentChange={value => {
                setSegment(value)
                setPage(1)
              }}
              onSelectUser={user => {
                setSelectedUser(user)
              }}
              onExportCsv={() => {
                if (!users.length) return
                const header = [
                  'id',
                  'email',
                  'firstName',
                  'lastName',
                  'role',
                  'isActive',
                  'createdAt',
                  'enrollments',
                  'certificates',
                  'segment',
                  'segmentLabel',
                  'lastActivity',
                  'daysSinceLastActivity',
                ]
                const now = new Date()
                const rows = users.map(u => {
                  const segmentLabelMap: Record<string, string> = {
                    NEW: t('segmentNEW'),
                    ACTIVE: t('segmentACTIVE'),
                    RISK: t('segmentRISK'),
                    GRAD: t('segmentGRAD'),
                  }
                  const createdAt = new Date(u.createdAt)
                  const lastActivity = u.lastActivity ? new Date(u.lastActivity) : null
                  const daysSinceActivity =
                    lastActivity != null
                      ? Math.floor(
                          (now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24)
                        )
                      : ''

                  return [
                    u.id,
                    u.email,
                    u.firstName ?? '',
                    u.lastName ?? '',
                    u.role,
                    u.isActive ? 'true' : 'false',
                    createdAt.toISOString(),
                    String(u._count.enrollments),
                    String(u._count.certificates),
                    u.segment ?? '',
                    u.segment ? segmentLabelMap[u.segment] ?? '' : '',
                    u.lastActivity ?? '',
                    daysSinceActivity,
                  ]
                })
                const delimiter = ';'
                const csvBody = [header, ...rows]
                  .map(r => r.map(value => `"${String(value).replace(/"/g, '""')}"`).join(delimiter))
                  .join('\n')

                const csvWithBom = `\uFEFF${csvBody}`

                const blob = new Blob([csvWithBom], { type: 'text/csv;charset=utf-8;' })
                const url = URL.createObjectURL(blob)
                const link = document.createElement('a')
                link.href = url
                link.setAttribute('download', 'users-export.csv')
                document.body.appendChild(link)
                link.click()
                document.body.removeChild(link)
                URL.revokeObjectURL(url)
              }}
            />

            {pagination && pagination.totalPages > 1 && (
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
                <span>
                  {t('pageOf', {
                    page: pagination.page,
                    totalPages: pagination.totalPages,
                    total: pagination.total.toLocaleString(locale),
                  })}
                </span>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={pagination.page <= 1}
                      onClick={() => handlePageChange(pagination.page - 1)}
                    >
                      {t('back')}
                    </Button>
                    <span className="px-2 text-[11px] text-muted-foreground">
                      {pagination.page}/{pagination.totalPages}
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={pagination.page >= pagination.totalPages}
                      onClick={() => handlePageChange(pagination.page + 1)}
                    >
                      {t('forward')}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <Modal
        isOpen={!!selectedUser}
        onClose={() => setSelectedUser(null)}
        title={t('userDetailsTitle')}
        size="lg"
      >
        <AdminUserDetails
          overview={overviewData?.data ?? null}
          onClose={() => setSelectedUser(null)}
        />
      </Modal>
    </div>
  )
}

export default AdminUsersPage

