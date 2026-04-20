import { Link } from 'react-router-dom'
import { Button } from '@/shared/ui'
import { BookOpen, Users, Layers, CheckCircle, Sparkles } from 'lucide-react'
import LinglifyBanner from '@/assets/images/LinglifyBanner.webp'
import { useTranslation } from 'react-i18next'

const AUDIENCE_ICONS = [Users, BookOpen, Layers] as const

type AboutAudience = { title: string; description: string }
type AboutFormat = { title: string; text1: string; text2: string }

export const AboutPage = () => {
  const { t } = useTranslation('about')
  const chips = t('hero.chips', { returnObjects: true }) as string[]
  const learningSteps = t('learning.steps', { returnObjects: true }) as string[]
  const audience = t('audience', { returnObjects: true }) as AboutAudience[]
  const formats = t('formats', { returnObjects: true }) as AboutFormat[]

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-primary/5 via-background to-secondary/5 py-12">
      <div className="container mx-auto max-w-6xl px-4 space-y-16">
        <section className="grid items-center gap-10 md:grid-cols-[1.6fr,1.2fr]">
          <div className="space-y-6">
            <h1 className="text-4xl font-bold text-foreground sm:text-5xl">
              {t('title')} <span className="text-primary">Linglify</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              {t('hero.description')}
            </p>
            <div className="flex flex-wrap gap-3">
              {chips.map(chip => (
                <span
                  key={chip}
                  className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary"
                >
                  <CheckCircle className="h-4 w-4" />
                  {chip}
                </span>
              ))}
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-2xl shadow-primary/20">
            <div className="relative h-40">
              <img
                src={LinglifyBanner}
                alt={t('bannerAlt')}
                className="h-full w-full object-cover"
                loading="lazy"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-black/35 via-transparent to-transparent" />
            </div>
            <div className="p-6">
              <h2 className="mb-2 text-lg font-semibold text-foreground">
                {t('learning.title')}
              </h2>
              <ol className="mb-4 list-decimal space-y-2 pl-5 text-sm text-muted-foreground">
                {learningSteps.map(step => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
              <Link to="/courses">
                <Button className="w-full">{t('catalogCta')}</Button>
              </Link>
            </div>
          </div>
        </section>

        <section className="grid gap-8 md:grid-cols-3">
          {audience.map((item, index) => {
            const Icon = AUDIENCE_ICONS[index] ?? Users
            return (
              <div
                key={item.title}
                className="group rounded-2xl border border-border bg-card p-6 transition-all hover:-translate-y-1 hover:border-primary/50 hover:shadow-lg"
              >
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 group-hover:bg-primary">
                  <Icon className="h-5 w-5 text-primary group-hover:text-primary-foreground" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-foreground">
                  {item.title}
                </h3>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
            )
          })}
        </section>

        <section className="rounded-2xl border border-border bg-card/60 p-8 shadow-sm">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-foreground">
                {t('lessons.title')}
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {t('lessons.description')}
              </p>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {formats.map(format => (
              <div key={format.title} className="rounded-xl border border-border bg-background/60 p-5">
                <h3 className="mb-2 flex items-center gap-2 text-base font-semibold text-foreground">
                  <Sparkles className="h-4 w-4 text-primary" />
                  {format.title}
                </h3>
                <p className="mb-2 text-sm text-muted-foreground">
                  {format.text1}
                </p>
                <p className="text-xs text-muted-foreground">
                  {format.text2}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl bg-gradient-to-r from-primary to-primary/80 p-10 text-center text-primary-foreground">
          <h2 className="mb-3 text-2xl font-bold sm:text-3xl">
            {t('cta.title')}
          </h2>
          <p className="mb-6 text-sm sm:text-base text-primary-foreground/80">
            {t('cta.description')}
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link to="/register">
              <Button variant="primary" size="lg">
                {t('startLearning')}
              </Button>
            </Link>
            <Link to="/courses">
              <Button variant="secondary" size="lg">
                {t('goToCourses')}
              </Button>
            </Link>
          </div>
        </section>
      </div>
    </div>
  )
}
