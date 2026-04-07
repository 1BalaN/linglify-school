import { Link } from 'react-router-dom'
import { Button } from '@/shared/ui'
import {
  BookOpen,
  Globe,
  Zap,
  Users,
  Award,
  TrendingUp,
  CheckCircle,
  User,
} from 'lucide-react'
import MainBanner from '@/assets/images/MainBanner.webp'
import { useGetCoursesQuery } from '@/entities/course'
import { useTranslation } from 'react-i18next'

export const HomePage = () => {
  const { t } = useTranslation('home')
  const { data: popularCoursesResponse, isLoading: isLoadingPopular } = useGetCoursesQuery({
    isPublished: true,
    sortBy: 'enrolledCount',
    order: 'desc',
    limit: 3,
    page: 1,
  })

  const popularCourses = popularCoursesResponse?.data ?? []

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/5 via-background to-secondary/5 px-4 py-20 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-7xl">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-8">
            <div className="flex flex-col justify-center space-y-8 animate-in fade-in slide-in-from-left duration-700">
              <div className="space-y-4">
                <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl md:text-6xl">
                  {t('hero.titleStart')}{' '}
                  <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                    {t('hero.titleAccent')}
                  </span>
                </h1>
                <p className="text-lg text-muted-foreground sm:text-xl">
                  {t('hero.description')}
                </p>
              </div>
              <div className="flex flex-col space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
                <Link to="/register">
                  <Button size="lg" className="w-full sm:w-auto">
                    {t('hero.ctaPrimary')}
                  </Button>
                </Link>
                <Link to="/courses">
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full sm:w-auto"
                  >
                    {t('hero.ctaSecondary')}
                  </Button>
                </Link>
              </div>
              <div className="flex items-center space-x-8">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map(i => (
                    <div
                      key={i}
                      className="flex items-center justify-center h-10 w-10 rounded-full border-2 border-background bg-primary/30"
                    >
                      <User className="h-5 w-5 text-primary-foreground/80" />
                    </div>
                  ))}
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {t('hero.studentsCount')}
                  </p>
                  <p className="text-sm text-muted-foreground">{t('hero.studentsSubtitle')}</p>
                </div>
              </div>
            </div>
            <div className="relative rounded-2xl animate-float border border-border bg-card shadow-2xl shadow-primary/20">
              <div className="relative aspect-square overflow-hidden rounded-2xl shadow-2xl">
                <img
                  src={MainBanner}
                  alt={t('hero.bannerAlt')}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-black/25 via-transparent to-transparent" />
              </div>
              <div className="absolute -bottom-6 -right-6 rounded-xl border border-border/80 bg-card/95 p-6 shadow-2xl shadow-primary/20 backdrop-blur-md">
                <div className="flex items-center space-x-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10">
                    <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {t('hero.successRate')}
                    </p>
                    <p className="text-xs text-muted-foreground">{t('hero.successRateSubtitle')}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-7xl">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold text-foreground sm:text-4xl">
              {t('features.title')}
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              {t('features.description')}
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: Globe,
                title: t('features.items.manyLanguages.title'),
                description: t('features.items.manyLanguages.description'),
              },
              {
                icon: Zap,
                title: t('features.items.fastProgress.title'),
                description: t('features.items.fastProgress.description'),
              },
              {
                icon: Users,
                title: t('features.items.liveCommunication.title'),
                description: t('features.items.liveCommunication.description'),
              },
              {
                icon: Award,
                title: t('features.items.certificates.title'),
                description: t('features.items.certificates.description'),
              },
              {
                icon: TrendingUp,
                title: t('features.items.progressTracking.title'),
                description: t('features.items.progressTracking.description'),
              },
              {
                icon: BookOpen,
                title: t('features.items.interactiveLessons.title'),
                description: t('features.items.interactiveLessons.description'),
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="group rounded-2xl border border-border bg-card p-8 transition-all hover:border-primary/50 hover:shadow-lg hover:-translate-y-1"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 transition-all group-hover:bg-primary group-hover:scale-110">
                  <feature.icon className="h-6 w-6 text-primary transition-colors group-hover:text-primary-foreground" />
                </div>
                <h3 className="mb-3 text-xl font-semibold text-foreground">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Courses Preview Section */}
      <section className="bg-accent/20 px-4 py-20 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-7xl">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold text-foreground sm:text-4xl">
              {t('popularCourses.title')}
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              {t('popularCourses.description')}
            </p>
          </div>

          {isLoadingPopular ? (
            <div className="flex justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : popularCourses.length === 0 ? (
            <p className="text-center text-muted-foreground">
              {t('popularCourses.empty')}
            </p>
          ) : (
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {popularCourses.map(course => (
                <div
                  key={course.id}
                  className="overflow-hidden rounded-2xl border border-border bg-card shadow-md transition-all hover:shadow-xl hover:-translate-y-1 flex flex-col"
                >
                  <div className="flex h-48 items-center justify-center bg-gradient-to-br from-primary/60 to-primary">
                    { course.coverImage ? 
                      <img src={course.coverImage} alt={course.title} className="h-full w-full object-cover" loading="lazy"/> 
                      : <div className="flex h-full items-center justify-center">
                          <BookOpen className="h-14 w-14 text-primary/30" aria-hidden="true" />
                        </div>
                    }
                  </div>
                  <div className="flex flex-1 flex-col p-6">
                    <div className="mb-3 flex items-center justify-between">
                      <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                        {course.level}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {t('popularCourses.studentsLabel', { count: course.enrolledCount })}
                      </span>
                    </div>
                    <h3 className="mb-2 line-clamp-2 text-xl font-semibold text-foreground">
                      {course.title}
                    </h3>
                    <p className="mb-4 line-clamp-2 text-sm text-muted-foreground">
                      {course.shortDescription || course.description}
                    </p>
                    <div className="mt-auto pt-2">
                      <Link to={`/courses/${course.id}`}>
                        <Button variant="outline" className="w-full">
                          {t('popularCourses.goToCourse')}
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-12 text-center">
            <Link to="/courses">
              <Button size="lg">{t('popularCourses.viewAll')}</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-primary to-primary/80 px-4 py-20 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="mb-4 text-3xl font-bold text-primary-foreground sm:text-4xl">
            {t('cta.title')}
          </h2>
          <p className="mb-8 text-lg text-primary-foreground/80">
            {t('cta.description')}
          </p>
          <Link to="/register">
            <Button
              size="lg"
              className="bg-background hover:bg-background/90 shadow-lg hover:shadow-xl transition-all hover:scale-105"
            >
              {t('cta.button')}
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}
