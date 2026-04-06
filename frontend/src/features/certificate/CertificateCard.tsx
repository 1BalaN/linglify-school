import { Award, Calendar, GraduationCap, BookOpen, User as UserIcon } from 'lucide-react'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import type { Certificate, CourseLevel } from '@/shared/types/course'

interface CertificateCardProps {
  certificate: Certificate
}

export const CertificateCard = ({ certificate }: CertificateCardProps) => {
  const { t, i18n } = useTranslation('platform', { keyPrefix: 'certificateUi' })
  const course = certificate.course

  const locale = i18n.language?.startsWith('ru') ? 'ru-RU' : 'en-US'

  const issuedDate = useMemo(
    () =>
      new Date(certificate.issuedAt).toLocaleDateString(locale, {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      }),
    [certificate.issuedAt, locale],
  )
  if (!course) return null
  const levelKeys = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const
  const level =
    levelKeys.includes(course.level as (typeof levelKeys)[number])
      ? t(`levels.${course.level as CourseLevel}`)
      : course.level

  const fullName =
    [certificate.user?.firstName, certificate.user?.lastName].filter(Boolean).join(' ').trim() ||
    t('studentOf')

  const finalScoreText =
    typeof certificate.finalScore === 'number' ? `${Math.round(certificate.finalScore)}%` : '—'

  return (
    <div className="relative overflow-hidden rounded-3xl border border-primary/10 bg-gradient-to-br from-slate-50 via-white to-indigo-50 p-6 shadow-lg shadow-primary/10 dark:from-slate-900 dark:via-slate-950 dark:to-indigo-950/40">
      <div className="pointer-events-none absolute inset-0 opacity-60 [background-image:radial-gradient(circle_at_0_0,rgba(56,189,248,0.35),transparent_55%),radial-gradient(circle_at_100%_0,rgba(129,140,248,0.35),transparent_55%)]" />

      <div className="relative flex flex-col gap-5 sm:flex-row sm:items-stretch">
        <div className="flex-1 space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            <Award className="h-3.5 w-3.5" />
            {t('title')}
          </div>

          <h3 className="text-xl font-semibold tracking-tight text-foreground">{course.title}</h3>

          <div className="mt-2 flex items-center gap-3 rounded-2xl bg-white/60 px-3 py-2 text-sm shadow-sm shadow-primary/10 dark:bg-slate-900/60">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md shadow-primary/40">
              <UserIcon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{t('ownerLabel')}</p>
              <p className="text-sm font-semibold text-foreground">{fullName}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1 rounded-full bg-background/80 px-2.5 py-1">
              <GraduationCap className="h-3.5 w-3.5" />
              {level}
            </span>
            {course.category ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-background/80 px-2.5 py-1">
                <BookOpen className="h-3.5 w-3.5" />
                {course.category}
              </span>
            ) : null}
            <span className="inline-flex items-center gap-1 rounded-full bg-background/80 px-2.5 py-1">
              <Calendar className="h-3.5 w-3.5" />
              {t('issued', { date: issuedDate })}
            </span>
          </div>

          <div className="mt-3 space-y-1 text-sm text-foreground">
            <p>{t('confirms', { name: fullName, courseTitle: course.title })}</p>
            <p className="text-muted-foreground">
              {t('levelLine', { level })}
              {course.category ? t('categoryLine', { cat: course.category }) : null}
            </p>
            <p className="text-muted-foreground">
              {t('finalTest')}{' '}
              <span className="font-semibold text-primary">{finalScoreText}</span>
            </p>
          </div>
        </div>

        <div className="mt-4 w-full max-w-xs rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 via-indigo-50 to-cyan-50 p-4 text-center shadow-inner shadow-primary/30 dark:from-primary/20 dark:via-slate-900 dark:to-indigo-900/60 sm:mt-0 sm:w-72">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/50">
            <GraduationCap className="h-7 w-7" />
          </div>
          <p className="text-xs uppercase tracking-[0.16em] text-primary">Linglify Certificate</p>
          <p className="mt-1 text-sm font-semibold text-foreground">{t('footerTitle')}</p>
          <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">{t('footerBody')}</p>
          <p className="mt-3 text-[10px] font-mono text-muted-foreground">
            {t('verification')} <span className="font-semibold">{certificate.certificateCode}</span>
          </p>
        </div>
      </div>
    </div>
  )
}
