import { useTranslation } from 'react-i18next'
import { Button, Input } from '@/shared/ui'
import type { AdminUserListItem } from '@/shared/types/userAdmin'

interface AdminUsersTableProps {
  users: AdminUserListItem[]
  isLoading: boolean
  search: string
  onSearchChange: (value: string) => void
  roleFilter: string | null
  onRoleFilterChange: (value: string | null) => void
  segment: string | null
  onSegmentChange: (value: string | null) => void
  onSelectUser: (user: AdminUserListItem) => void
  onExportCsv: () => void
}

export const AdminUsersTable = ({
  users,
  isLoading,
  search,
  onSearchChange,
  roleFilter,
  onRoleFilterChange,
  segment,
  onSegmentChange,
  onSelectUser,
  onExportCsv,
}: AdminUsersTableProps) => {
  const { t } = useTranslation('platform', { keyPrefix: 'admin.usersTable' })
  const { i18n } = useTranslation('platform')
  const locale = i18n.language.startsWith('ru') ? 'ru-RU' : 'en-US'
  const now = new Date()

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-1 items-center gap-2">
          <div className="relative w-full max-w-md">
            <Input
              value={search}
              onChange={e => onSearchChange(e.target.value)}
              placeholder={t('searchPh')}
              className="pr-9"
            />
            {search && (
              <button
                type="button"
                className="absolute inset-y-0 right-2 flex items-center text-muted-foreground hover:text-foreground"
                onClick={() => onSearchChange('')}
              >
                ✕
              </button>
            )}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <select
              value={roleFilter ?? ''}
              onChange={e => onRoleFilterChange(e.target.value || null)}
              className="h-9 appearance-none rounded-lg border border-input bg-background px-3 pr-8 text-sm"
            >
              <option value="">{t('allRoles')}</option>
              <option value="STUDENT">{t('roleStudents')}</option>
              <option value="TEACHER">{t('roleTeachers')}</option>
              <option value="ADMIN">{t('roleAdmins')}</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-muted-foreground">
              <span className="inline-block rotate-90 text-xs">›</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-1">
            {[
              { id: null, label: t('filterAll') },
              { id: 'NEW', label: t('filterNew') },
              { id: 'ACTIVE', label: t('filterActive') },
              { id: 'RISK', label: t('filterRisk') },
              { id: 'GRAD', label: t('filterGrad') },
            ].map(item => (
              <Button
                key={item.id ?? 'all'}
                size="sm"
                variant={segment === item.id ? 'primary' : 'outline'}
                onClick={() => onSegmentChange(item.id as string | null)}
              >
                {item.label}
              </Button>
            ))}
          </div>
          <Button size="sm" variant="outline" onClick={onExportCsv}>
            {t('exportCsv')}
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto max-h-[60vh] scroll-soft rounded-xl border border-border bg-card">
        <table className="min-w-full divide-y divide-border text-sm">
          <thead className="bg-muted/60">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">{t('colUser')}</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">{t('colRole')}</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">{t('colStatus')}</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">{t('colSegment')}</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">{t('colCourses')}</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">{t('colCerts')}</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">{t('colActivity')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading ? (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-muted-foreground">
                  {t('loading')}
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-muted-foreground">
                  {t('empty')}
                </td>
              </tr>
            ) : (
              users.map(user => {
                const segmentLabelMap: Record<string, string> = {
                  NEW: t('segmentNEWL'),
                  ACTIVE: t('segmentAKTIV'),
                  RISK: t('segmentRISK'),
                  GRAD: t('segmentGRAD'),
                }

                const segmentColorMap: Record<string, string> = {
                  NEW: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
                  ACTIVE: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
                  RISK: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
                  GRAD: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
                }

                const segmentClass = user.segment ? segmentColorMap[user.segment] : 'bg-muted text-muted-foreground'

                const lastActivityDate = user.lastActivity ? new Date(user.lastActivity) : null
                const daysSinceActivity =
                  lastActivityDate != null
                    ? Math.floor(
                        (now.getTime() - lastActivityDate.getTime()) / (1000 * 60 * 60 * 24)
                      )
                    : null
                const isStale = daysSinceActivity != null && daysSinceActivity > 30

                return (
                <tr
                  key={user.id}
                  className="cursor-pointer hover:bg-muted/40"
                  onClick={() => onSelectUser(user)}
                >
                  <td className="px-4 py-3">
                    <div className="flex flex-col">
                      <span className="font-medium text-foreground">
                        {user.firstName || user.lastName
                          ? `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim()
                          : user.email}
                      </span>
                      <span className="text-xs text-muted-foreground">{user.email}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                        user.role === 'ADMIN'
                          ? 'bg-red-500/15 text-red-600 dark:text-red-400'
                          : user.role === 'TEACHER'
                            ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                            : 'bg-muted text-foreground'
                      }`}
                    >
                      {user.role === 'ADMIN' && (
                        <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                      )}
                      {user.role === 'TEACHER' && (
                        <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                      )}
                      {user.role === 'STUDENT' && (
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      )}
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        user.isActive
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                          : 'bg-red-500/10 text-red-600 dark:text-red-400'
                      }`}
                    >
                      {user.isActive ? t('active') : t('frozen')}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {user.segment ? (
                      <span
                        className={`group relative rounded-full px-2 py-0.5 text-xs font-medium ${segmentClass}`}
                      >
                        {segmentLabelMap[user.segment]}
                        <span className="pointer-events-none absolute left-1/2 top-full z-10 mt-1 hidden w-56 -translate-x-1/2 rounded-md border border-border bg-popover px-2 py-1.5 text-[10px] leading-snug text-muted-foreground shadow-md group-hover:block">
                          {user.segment === 'NEW' && t('segHintNEW')}
                          {user.segment === 'ACTIVE' && t('segHintACTIVE')}
                          {user.segment === 'RISK' && t('segHintRISK')}
                          {user.segment === 'GRAD' && t('segHintGRAD')}
                        </span>
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{user._count.enrollments}</td>
                  <td className="px-4 py-3 text-muted-foreground">{user._count.certificates}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      {user.lastActivity
                        ? new Date(user.lastActivity).toLocaleDateString(locale)
                        : t('noActivityData')}
                      {isStale && (
                        <span
                          className="ml-1 inline-flex items-center rounded-full bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-medium text-amber-700 dark:text-amber-400"
                          title={t('staleTitle')}
                        >
                          {t('staleBadge')}
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              )})
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

