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
} from 'lucide-react'

export const HomePage = () => {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/5 via-background to-secondary/5 px-4 py-20 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-7xl">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-8">
            <div className="flex flex-col justify-center space-y-8 animate-in fade-in slide-in-from-left duration-700">
              <div className="space-y-4">
                <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl md:text-6xl">
                  Изучайте языки{' '}
                  <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                    легко и эффективно
                  </span>
                </h1>
                <p className="text-lg text-muted-foreground sm:text-xl">
                  Linglify — современная платформа для изучения иностранных
                  языков с интерактивными курсами, персональным подходом и
                  проверенной методикой.
                </p>
              </div>
              <div className="flex flex-col space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
                <Link to="/register">
                  <Button size="lg" className="w-full sm:w-auto">
                    Начать бесплатно
                  </Button>
                </Link>
                <Link to="/courses">
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full sm:w-auto"
                  >
                    Посмотреть курсы
                  </Button>
                </Link>
              </div>
              <div className="flex items-center space-x-8">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map(i => (
                    <div
                      key={i}
                      className="h-10 w-10 rounded-full border-2 border-background bg-primary/30"
                    />
                  ))}
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Более 10,000 студентов
                  </p>
                  <p className="text-sm text-muted-foreground">уже учатся с нами</p>
                </div>
              </div>
            </div>
            <div className="relative animate-in fade-in slide-in-from-right duration-700">
              <div className="aspect-square overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-primary/60 shadow-2xl transition-transform hover:scale-105">
                <div className="flex h-full items-center justify-center">
                  <BookOpen className="h-48 w-48 text-primary-foreground opacity-20" />
                </div>
              </div>
              <div className="absolute -bottom-6 -right-6 rounded-xl border border-border bg-card p-6 shadow-xl">
                <div className="flex items-center space-x-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10">
                    <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      95% успешности
                    </p>
                    <p className="text-xs text-muted-foreground">наших студентов</p>
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
              Почему выбирают Linglify?
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              Мы создали платформу, которая делает изучение языков доступным,
              интересным и результативным.
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: Globe,
                title: 'Множество языков',
                description:
                  'Изучайте английский, испанский, французский, немецкий и многие другие языки.',
              },
              {
                icon: Zap,
                title: 'Быстрый прогресс',
                description:
                  'Современная методика обучения позволяет достигать результатов в кратчайшие сроки.',
              },
              {
                icon: Users,
                title: 'Живое общение',
                description:
                  'Практикуйте язык с носителями и другими студентами в реальном времени.',
              },
              {
                icon: Award,
                title: 'Сертификаты',
                description:
                  'Получайте официальные сертификаты после завершения курсов.',
              },
              {
                icon: TrendingUp,
                title: 'Отслеживание прогресса',
                description:
                  'Следите за своими достижениями и улучшайте слабые стороны.',
              },
              {
                icon: BookOpen,
                title: 'Интерактивные уроки',
                description:
                  'Увлекательные задания, видео, аудио и игры для эффективного обучения.',
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
              Популярные курсы
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              Начните свое обучение с одного из наших популярных курсов
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: 'Английский для начинающих',
                level: 'Beginner',
                students: '2,500+',
                lessons: '120',
                color: 'from-blue-500 to-indigo-600',
              },
              {
                title: 'Испанский разговорный',
                level: 'Intermediate',
                students: '1,800+',
                lessons: '90',
                color: 'from-orange-500 to-red-600',
              },
              {
                title: 'Бизнес-английский',
                level: 'Advanced',
                students: '1,200+',
                lessons: '75',
                color: 'from-purple-500 to-pink-600',
              },
            ].map((course, index) => (
              <div
                key={index}
                className="overflow-hidden rounded-2xl border border-border bg-card shadow-md transition-all hover:shadow-xl hover:-translate-y-1"
              >
                <div
                  className={`flex h-48 items-center justify-center bg-gradient-to-br ${course.color}`}
                >
                  <BookOpen className="h-24 w-24 text-white opacity-50" />
                </div>
                <div className="p-6">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                      {course.level}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {course.students} студентов
                    </span>
                  </div>
                  <h3 className="mb-3 text-xl font-semibold text-foreground">
                    {course.title}
                  </h3>
                  <p className="mb-4 text-sm text-muted-foreground">
                    {course.lessons} интерактивных уроков
                  </p>
                  <Button variant="outline" className="w-full">
                    Узнать больше
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link to="/courses">
              <Button size="lg">Посмотреть все курсы</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-primary to-primary/80 px-4 py-20 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="mb-4 text-3xl font-bold text-primary-foreground sm:text-4xl">
            Готовы начать свое языковое путешествие?
          </h2>
          <p className="mb-8 text-lg text-primary-foreground/80">
            Присоединяйтесь к тысячам студентов, которые уже достигли своих
            целей с Linglify
          </p>
          <Link to="/register">
            <Button
              size="lg"
              className="bg-background text-primary hover:bg-background/90 shadow-lg hover:shadow-xl transition-all hover:scale-105"
            >
              Начать бесплатно
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}
