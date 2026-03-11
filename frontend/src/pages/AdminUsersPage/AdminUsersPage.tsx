import { useState } from 'react'
import { useGetUsersAdminQuery, useGetUserOverviewQuery } from '@/entities/userAdmin/api/userAdminApi'
import { AdminUsersTable, AdminUserDetails } from '@/features/admin/users'
import { Modal, Button } from '@/shared/ui'
import type { AdminUserListItem } from '@/shared/types/userAdmin'

export const AdminUsersPage = () => {
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

  const users = data?.data.data ?? []
  const pagination = data?.data.pagination

  const totalUsers = pagination?.total ?? users.length
  const studentsCount = users.filter(u => u.role === 'STUDENT').length
  const teachersCount = users.filter(u => u.role === 'TEACHER').length
  const inactiveCount = users.filter(u => !u.isActive).length

  const handlePageChange = (nextPage: number) => {
    if (!pagination) return
    if (nextPage < 1 || nextPage > pagination.totalPages) return
    setPage(nextPage)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="border-b border-border bg-background/60 backdrop-blur">
        <div className="container mx-auto max-w-7xl px-4 py-6">
          <h1 className="text-2xl font-bold text-foreground">Пользователи платформы</h1>
          <p className="text-sm text-muted-foreground">
            Управление ролями, статусами и мониторинг вовлечённости студентов и преподавателей.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 grid gap-4 md:grid-cols-4">
          <div className="rounded-2xl border border-border bg-card p-4">
            <p className="text-xs text-muted-foreground">Всего пользователей</p>
            <p className="mt-1 text-2xl font-semibold text-foreground">{totalUsers}</p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-4">
            <p className="text-xs text-muted-foreground">Студенты</p>
            <p className="mt-1 text-2xl font-semibold text-foreground">{studentsCount}</p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-4">
            <p className="text-xs text-muted-foreground">Преподаватели</p>
            <p className="mt-1 text-2xl font-semibold text-foreground">{teachersCount}</p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-4">
            <p className="text-xs text-muted-foreground">Заморожены</p>
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
                  'enrollments',
                  'certificates',
                  'segment',
                  'lastActivity',
                ]
                const rows = users.map(u => [
                  u.id,
                  u.email,
                  u.firstName ?? '',
                  u.lastName ?? '',
                  u.role,
                  u.isActive ? 'true' : 'false',
                  String(u._count.enrollments),
                  String(u._count.certificates),
                  u.segment ?? '',
                  u.lastActivity ?? '',
                ])
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
                  Страница {pagination.page} из {pagination.totalPages} (всего {pagination.total.toLocaleString('ru-RU')}{' '}
                  пользователей)
                </span>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={pagination.page <= 1}
                      onClick={() => handlePageChange(pagination.page - 1)}
                    >
                      Назад
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
                      Вперёд
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
        title="Детали пользователя"
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

