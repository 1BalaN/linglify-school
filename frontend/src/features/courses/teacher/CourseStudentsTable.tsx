import type { CourseStudent } from '@/shared/types/course'

interface CourseStudentsTableProps {
  students: CourseStudent[]
  isLoading: boolean
}

export const CourseStudentsTable = ({ students, isLoading }: CourseStudentsTableProps) => {
  if (isLoading) {
    return (
      <div className="mt-4 rounded-xl border border-border bg-background/60 p-4 text-sm text-muted-foreground">
        Загрузка списка учеников...
      </div>
    )
  }

  if (!students.length) {
    return (
      <div className="mt-4 rounded-xl border border-border bg-background/60 p-4 text-sm text-muted-foreground">
        Пока нет ни одного ученика, записанного на этот курс.
      </div>
    )
  }

  return (
    <div className="mt-4 rounded-xl border border-border bg-background/60 p-4">
      <div className="mb-2 flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-foreground">Ученики курса</h3>
        <span className="text-xs text-foreground">Всего: {students.length}</span>
      </div>

      <div className="scroll-soft max-h-72 overflow-y-auto">
        <table className="min-w-full text-left text-xs">
          <thead className="sticky top-0 bg-background/90 backdrop-blur border-b border-border/60">
            <tr>
              <th className="px-3 py-2 font-medium text-muted-foreground">Ученик</th>
              <th className="px-3 py-2 font-medium text-muted-foreground">Email</th>
              <th className="px-3 py-2 font-medium text-muted-foreground">Прогресс</th>
              <th className="px-3 py-2 font-medium text-muted-foreground">Дата записи</th>
              <th className="px-3 py-2 font-medium text-muted-foreground">Завершён</th>
            </tr>
          </thead>
          <tbody>
            {students.map(enrollment => {
              const user = enrollment.user
              const fullName = user
                ? [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email
                : enrollment.userId

              const enrolledAt = new Date(enrollment.enrolledAt).toLocaleDateString('ru-RU')
              const completedAt = enrollment.completedAt
                ? new Date(enrollment.completedAt).toLocaleDateString('ru-RU')
                : null

              return (
                <tr key={enrollment.id} className="border-b border-border/40 last:border-0">
                  <td className="px-3 py-2 align-middle text-foreground">
                    <div className="flex flex-col">
                      <span className="font-medium">{fullName}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2 align-middle text-foreground">
                    {user?.email ?? '—'}
                  </td>
                  <td className="px-3 py-2 align-middle text-foreground">
                    {Math.round(enrollment.progress)}%
                  </td>
                  <td className="px-3 py-2 align-middle text-foreground">{enrolledAt}</td>
                  <td className="px-3 py-2 align-middle text-foreground">
                    {completedAt ?? '—'}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

