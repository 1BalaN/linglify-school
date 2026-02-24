import { CheckCircle } from 'lucide-react'

interface StudentCourseProgressSidebarProps {
  completedLessons: number
  totalLessons: number
  progress: number
}

export const StudentCourseProgressSidebar = ({
  completedLessons,
  totalLessons,
  progress,
}: StudentCourseProgressSidebarProps) => {
  const remaining = totalLessons - completedLessons

  return (
    <div className="glass-card sticky top-4 rounded-2xl p-6">
      <h3 className="mb-4 text-lg font-semibold text-foreground">Ваш прогресс</h3>

      <div className="mb-6">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Завершено</span>
          <span className="font-medium text-foreground">
            {completedLessons} / {totalLessons}
          </span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full bg-gradient-to-r from-cyan-500 to-blue-600 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="space-y-3">
        <div className="rounded-lg border border-border bg-card/50 p-4">
          <div className="mb-1 text-2xl font-bold text-foreground">{totalLessons}</div>
          <div className="text-sm text-muted-foreground">Всего уроков</div>
        </div>

        <div className="rounded-lg border border-border bg-card/50 p-4">
          <div className="mb-1 text-2xl font-bold text-emerald-600">{completedLessons}</div>
          <div className="text-sm text-muted-foreground">Завершено</div>
        </div>

        <div className="rounded-lg border border-border bg-card/50 p-4">
          <div className="mb-1 text-2xl font-bold text-amber-600">{remaining}</div>
          <div className="text-sm text-muted-foreground">Осталось</div>
        </div>
      </div>

      {progress === 100 && (
        <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900/30 dark:bg-emerald-950/20">
          <div className="mb-2 flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
            <CheckCircle className="h-5 w-5" />
            <span className="font-semibold">Курс завершён!</span>
          </div>
          <p className="text-sm text-emerald-600 dark:text-emerald-400">
            Поздравляем! Вы прошли все уроки этого курса.
          </p>
        </div>
      )}
    </div>
  )
}

