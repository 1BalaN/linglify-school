import { CheckCircle, Award, Download } from 'lucide-react'
import { Button } from '@/shared/ui'

interface StudentCourseProgressSidebarProps {
  completedLessons: number
  totalLessons: number
  progress: number
  hasCertificate?: boolean
  onViewCertificate?: () => void
}

export const StudentCourseProgressSidebar = ({
  completedLessons,
  totalLessons,
  progress,
  hasCertificate,
  onViewCertificate,
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

      {hasCertificate && onViewCertificate && (
        <div className="mt-4 space-y-2 rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm">
          <div className="mb-1 flex items-center gap-2 text-primary">
            <Award className="h-4 w-4" />
            <span className="font-semibold">Сертификат доступен</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Вы можете открыть и скачать сертификат об окончании этого курса.
          </p>
          <Button
            type="button"
            size="sm"
            className="mt-1 w-full"
            variant="primary"
            onClick={onViewCertificate}
          >
            <Download className="mr-2 h-4 w-4" />
            Посмотреть сертификат
          </Button>
        </div>
      )}
    </div>
  )
}

