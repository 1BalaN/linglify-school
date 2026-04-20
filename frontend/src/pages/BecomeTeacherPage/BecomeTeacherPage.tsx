import { Link } from 'react-router-dom'
import { Button } from '@/shared/ui'
import { Check, Crown, Zap, BarChart2, MessageCircle, Award } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export const BecomeTeacherPage = () => {
  const { t } = useTranslation('teacher')
  const pricing = t('pricing', { returnObjects: true }) as {
    monthlyLabel: string
    monthlyPrice: string
    monthlySuffix: string
    annualLabel: string
    annualBadge: string
    annualPrice: string
    annualSuffix: string
    annualNote: string
    planFeatures: string[]
    ctaMonthly: string
    ctaAnnual: string
    footer: string
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="container mx-auto max-w-5xl px-4 py-16">

        {/* Hero */}
        <div className="mb-14 text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg">
            <Crown className="h-8 w-8 text-white" />
          </div>
          <h1 className="mb-4 text-4xl font-bold">{t('hero.title')}</h1>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            {t('hero.subtitle')}
          </p>
        </div>

        {/* Steps */}
        <div className="mb-14 grid gap-6 md:grid-cols-3">
          {[
            { step: '1', key: 0 },
            { step: '2', key: 1 },
            { step: '3', key: 2 },
          ].map(s => (
            <div key={s.step} className="rounded-2xl border border-border bg-card p-6">
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                {s.step}
              </div>
              <h2 className="mb-1 font-semibold">
                {t(`steps.${s.key}.title`)}
              </h2>
              <p className="text-sm text-muted-foreground">
                {t(`steps.${s.key}.description`)}
              </p>
            </div>
          ))}
        </div>

        {/* Features */}
        <div className="mb-14 grid gap-4 sm:grid-cols-2">
          {[
            {
              icon: Zap,
              title: t('features.builderTitle'),
              desc: t('features.builderDesc'),
            },
            {
              icon: BarChart2,
              title: t('features.analyticsTitle'),
              desc: t('features.analyticsDesc'),
            },
            {
              icon: MessageCircle,
              title: t('features.chatTitle'),
              desc: t('features.chatDesc'),
            },
            {
              icon: Award,
              title: t('features.certsTitle'),
              desc: t('features.certsDesc'),
            },
          ].map(f => (
            <div key={f.title} className="flex gap-4 rounded-2xl border border-border bg-card p-5">
              <f.icon className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <div>
                <p className="font-medium">{f.title}</p>
                <p className="mt-0.5 text-sm text-muted-foreground">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Pricing */}
        <div className="mb-10 grid items-stretch gap-6 md:grid-cols-2">
          {/* Monthly */}
          <div className="flex flex-col rounded-2xl border border-border bg-card p-7">
            <p className="mb-1 text-sm font-medium text-muted-foreground">
              {pricing.monthlyLabel}
            </p>
            <p className="text-3xl font-bold">
              {pricing.monthlyPrice}{' '}
              <span className="text-base font-normal text-muted-foreground">
                {pricing.monthlySuffix}
              </span>
            </p>
            {/* spacer so the list starts at the same height as the annual card */}
            <p className="mb-2 text-xs text-transparent select-none">—</p>
            <ul className="my-6 grow space-y-2.5">
              {pricing.planFeatures.map(f => (
                <li key={f} className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 shrink-0 text-emerald-500" />{f}
                </li>
              ))}
            </ul>
            <Link to="/register?role=teacher">
              <Button variant="outline" className="w-full">
                {pricing.ctaMonthly}
              </Button>
            </Link>
          </div>

          {/* Annual */}
          <div className="flex flex-col rounded-2xl border-2 border-primary/50 bg-card p-7 shadow-lg shadow-primary/5">
            <div className="mb-1 flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">
                {pricing.annualLabel}
              </p>
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400">−33%</span>
            </div>
            <p className="text-3xl font-bold">
              {pricing.annualPrice}{' '}
              <span className="text-base font-normal text-muted-foreground">
                {pricing.annualSuffix}
              </span>
            </p>
            <p className="mb-2 text-xs text-muted-foreground">
              {pricing.annualNote}
            </p>
            <ul className="my-6 grow space-y-2.5">
              {pricing.planFeatures.map(f => (
                <li key={f} className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 shrink-0 text-emerald-500" />{f}
                </li>
              ))}
            </ul>
            <Link to="/register?role=teacher">
              <Button className="w-full">
                {pricing.ctaAnnual}
              </Button>
            </Link>
          </div>
        </div>

        <p className="text-center text-sm text-muted-foreground">
          <span
            dangerouslySetInnerHTML={{ __html: pricing.footer }}
          />
        </p>
      </div>
    </div>
  )
}

export default BecomeTeacherPage
