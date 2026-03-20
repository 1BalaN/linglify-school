import { TrendingUp, User } from 'lucide-react'
import { useGetCourseStudentScoresQuery } from '@/entities/analytics'
import type { EfficiencyLevel, StudentEfficiencyScore } from '@/shared/types/analytics'

const LEVEL_CONFIG: Record<EfficiencyLevel, { label: string; color: string; bar: string }> = {
  excellent: { label: 'Отлично',      color: 'text-emerald-600 dark:text-emerald-400', bar: 'bg-emerald-500' },
  good:      { label: 'Хорошо',       color: 'text-blue-600 dark:text-blue-400',       bar: 'bg-blue-500'    },
  average:   { label: 'Средне',       color: 'text-amber-600 dark:text-amber-400',      bar: 'bg-amber-500'   },
  poor:      { label: 'Нужно больше', color: 'text-orange-600 dark:text-orange-400',   bar: 'bg-orange-500'  },
  critical:  { label: 'Критично',     color: 'text-red-600 dark:text-red-400',          bar: 'bg-red-500'     },
}

const CRITERIA_LABELS: { key: keyof StudentEfficiencyScore['breakdown']; label: string }[] = [
  { key: 'accuracy',   label: 'Точность'     },
  { key: 'regularity', label: 'Регулярность' },
  { key: 'practice',   label: 'Практика'     },
  { key: 'engagement', label: 'Активность'   },
]

function ScoreBar({ value, bar }: { value: number; bar: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
        <div className={`h-full rounded-full ${bar}`} style={{ width: `${value}%` }} />
      </div>
      <span className="w-7 text-right text-[11px] tabular-nums text-muted-foreground">{value}%</span>
    </div>
  )
}

function StudentRow({ student, rank }: { student: StudentEfficiencyScore; rank: number }) {
  const cfg = LEVEL_CONFIG[student.level]
  const name = [student.user.firstName, student.user.lastName].filter(Boolean).join(' ')
    || student.user.email

  return (
    <tr className="border-b border-border/40 last:border-0 hover:bg-muted/30 transition-colors">
      {/* Rank */}
      <td className="w-8 px-3 py-2.5 text-center text-xs font-bold text-muted-foreground">
        {rank <= 3 ? ['🥇', '🥈', '🥉'][rank - 1] : rank}
      </td>

      {/* Student */}
      <td className="px-3 py-2.5">
        <div className="flex items-center gap-2">
          {student.user.avatar ? (
            <img src={student.user.avatar} className="h-7 w-7 rounded-full object-cover" alt="" />
          ) : (
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-muted">
              <User className="h-3.5 w-3.5 text-muted-foreground" />
            </div>
          )}
          <span className="text-sm font-medium">{name}</span>
        </div>
      </td>

      {/* Criteria mini-bars */}
      <td className="hidden px-3 py-2.5 md:table-cell">
        <div className="space-y-0.5">
          {CRITERIA_LABELS.map(c => (
            <div key={c.key} className="flex items-center gap-1.5">
              <span className="w-16 text-[11px] text-muted-foreground">{c.label}</span>
              <ScoreBar value={student.breakdown[c.key]} bar={cfg.bar} />
            </div>
          ))}
        </div>
      </td>

      {/* Score */}
      <td className="px-3 py-2.5 text-right">
        <div className="flex flex-col items-end gap-0.5">
          <span className="text-base font-bold tabular-nums">{student.score.toFixed(2)}</span>
          <span className={`text-[11px] font-medium ${cfg.color}`}>{cfg.label}</span>
        </div>
      </td>
    </tr>
  )
}

interface StudentScoresTableProps {
  courseId: string
}

/**
 * Ranked list of students by their composite efficiency score.
 * Uses weighted scalarization across accuracy, regularity, practice and engagement.
 * Displayed naturally as "Рейтинг успеваемости" — no academic jargon in the UI.
 */
export const StudentScoresTable = ({ courseId }: StudentScoresTableProps) => {
  const { data, isLoading } = useGetCourseStudentScoresQuery(courseId)
  const students = data?.data ?? []

  if (isLoading) {
    return (
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="mb-3 h-4 w-40 animate-pulse rounded bg-muted" />
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="mb-2 h-12 animate-pulse rounded-lg bg-muted" />
        ))}
      </div>
    )
  }

  if (!students.length) return null

  const weights = students[0]?.weights

  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border/60 px-5 py-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4.5 w-4.5 text-primary" />
          <h3 className="text-sm font-semibold">Рейтинг успеваемости</h3>
        </div>
        {weights && (
          <div className="hidden gap-2 text-[11px] text-muted-foreground sm:flex">
            <span>Точность {weights.accuracy}%</span>
            <span>·</span>
            <span>Регулярность {weights.regularity}%</span>
            <span>·</span>
            <span>Практика {weights.practice}%</span>
            <span>·</span>
            <span>Активность {weights.engagement}%</span>
          </div>
        )}
      </div>

      <div className="scroll-soft max-h-[480px] overflow-y-auto">
        <table className="w-full">
          <thead className="sticky top-0 bg-card/95 backdrop-blur">
            <tr className="border-b border-border/40 text-[11px] text-muted-foreground">
              <th className="px-3 py-2 text-center">#</th>
              <th className="px-3 py-2 text-left">Студент</th>
              <th className="hidden px-3 py-2 text-left md:table-cell">Критерии</th>
              <th className="px-3 py-2 text-right">Балл</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s, i) => (
              <StudentRow key={s.userId} student={s} rank={i + 1} />
            ))}
          </tbody>
        </table>
      </div>

      <div className="border-t border-border/60 px-5 py-2.5 text-[11px] text-muted-foreground">
        Балл от 0 до 1 · {students.length} студентов
      </div>
    </div>
  )
}
