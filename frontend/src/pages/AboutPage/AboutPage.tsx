import { Link } from 'react-router-dom'
import { Button } from '@/shared/ui'
import { BookOpen, Users, Layers, CheckCircle, Sparkles } from 'lucide-react'
import LinglifyBanner from '@/assets/images/LinglifyBanner.webp'

export const AboutPage = () => {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-primary/5 via-background to-secondary/5 py-12">
      <div className="container mx-auto max-w-6xl px-4 space-y-16">
        {/* Hero */}
        <section className="grid items-center gap-10 md:grid-cols-[1.6fr,1.2fr]">
          <div className="space-y-6">
            <h1 className="text-4xl font-bold text-foreground sm:text-5xl">
              О платформе <span className="text-primary">Linglify</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Linglify — это образовательная платформа для изучения иностранных языков
              через структурированные курсы, интерактивные уроки и прозрачный прогресс.
              Мы помогаем студентам уверенно двигаться от первых шагов до свободного общения.
            </p>
            <div className="flex flex-wrap gap-3">
              <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                <CheckCircle className="h-4 w-4" />
                Видео, тесты и интерактив
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                <CheckCircle className="h-4 w-4" />
                Прогресс и отзывы
              </span>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-2xl shadow-primary/20">
            <div className="relative h-40">
              <img
                src={LinglifyBanner}
                alt="Онлайн-обучение на платформе Linglify"
                className="h-full w-full object-cover"
                loading="lazy"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-black/35 via-transparent to-transparent" />
            </div>
            <div className="p-6">
              <h2 className="mb-2 text-lg font-semibold text-foreground">
                Как устроено обучение
              </h2>
              <ol className="mb-4 list-decimal space-y-2 pl-5 text-sm text-muted-foreground">
                <li>Студент регистрируется в системе.</li>
                <li>Может пройти тест на определение уровня языка.</li>
                <li>Выбирает курс в каталоге и оформляет доступ.</li>
                <li>Проходит уроки трёх типов: видео, тесты и интерактив.</li>
                <li>Система считает прогресс по урокам и курсу.</li>
                <li>Студент оставляет отзывы, преподаватель видит обратную связь.</li>
              </ol>
              <Link to="/courses">
                <Button className="w-full">Перейти к каталогу курсов</Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Для кого платформа */}
        <section className="grid gap-8 md:grid-cols-3">
          {[
            {
              icon: Users,
              title: 'Для студентов',
              description:
                'Каталог курсов, личный раздел «Моё обучение», единый интерфейс уроков и прозрачный прогресс по каждому курсу.',
            },
            {
              icon: BookOpen,
              title: 'Для преподавателей',
              description:
                'Удобный кабинет для создания курсов и уроков: видео-формат, тесты с вариантами ответов и интерактивные задания с пропусками.',
            },
            {
              icon: Layers,
              title: 'Для администраторов',
              description:
                'Модерация курсов, управление статусами публикации, работа с отзывами и базовыми страницами платформы.',
            },
          ].map((item, index) => (
            <div
              key={index}
              className="group rounded-2xl border border-border bg-card p-6 transition-all hover:-translate-y-1 hover:border-primary/50 hover:shadow-lg"
            >
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 group-hover:bg-primary">
                <item.icon className="h-5 w-5 text-primary group-hover:text-primary-foreground" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-foreground">
                {item.title}
              </h3>
              <p className="text-sm text-muted-foreground">{item.description}</p>
            </div>
          ))}
        </section>

        {/* Как работает урок */}
        <section className="rounded-2xl border border-border bg-card/60 p-8 shadow-sm">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-foreground">
                Уроки, с которыми удобно заниматься каждый день
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Внутри курсов доступны три формата занятий: видео, тесты и интерактивные
                упражнения. Преподаватель заполняет понятные формы, а студенты видят
                единый и удобный интерфейс прохождения.
              </p>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-xl border border-border bg-background/60 p-5">
              <h3 className="mb-2 flex items-center gap-2 text-base font-semibold text-foreground">
                <Sparkles className="h-4 w-4 text-primary" />
                Видео-уроки
              </h3>
              <p className="mb-2 text-sm text-muted-foreground">
                Короткие видео с объяснениями и живой речью, дополненные конспектом,
                полезными ссылками и пояснениями к уроку.
              </p>
              <p className="text-xs text-muted-foreground">
                На стороне студента используется единый видеоплеер, поддерживающий как
                файлы, так и встраиваемые ссылки.
              </p>
            </div>

            <div className="rounded-xl border border-border bg-background/60 p-5">
              <h3 className="mb-2 flex items-center gap-2 text-base font-semibold text-foreground">
                <Sparkles className="h-4 w-4 text-primary" />
                Тесты
              </h3>
              <p className="mb-2 text-sm text-muted-foreground">
                Вопросы с вариантами ответов, поддержка нескольких правильных
                вариантов и порог прохождения в процентах.
              </p>
              <p className="text-xs text-muted-foreground">
                Студент видит результат без подсказки правильных ответов, чтобы
                сохранить учебный эффект.
              </p>
            </div>

            <div className="rounded-xl border border-border bg-background/60 p-5">
              <h3 className="mb-2 flex items-center gap-2 text-base font-semibold text-foreground">
                <Sparkles className="h-4 w-4 text-primary" />
                Интерактив
              </h3>
              <p className="mb-2 text-sm text-muted-foreground">
                Упражнения с пропусками в предложениях (формат «I ___ to school
                every day»), куда студент вписывает ответ.
              </p>
              <p className="text-xs text-muted-foreground">
                Проверка ответов без показа правильных вариантов, с возможностью
                повторить попытку.
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-2xl bg-gradient-to-r from-primary to-primary/80 p-10 text-center text-primary-foreground">
          <h2 className="mb-3 text-2xl font-bold sm:text-3xl">
            Готовы протестировать платформу изнутри?
          </h2>
          <p className="mb-6 text-sm sm:text-base text-primary-foreground/80">
            Зарегистрируйтесь как студент и попробуйте пройти первые уроки. Вся
            логика курсов уже работает — мы продолжаем развивать дизайн и контент.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link to="/register">
              <Button variant="primary" size="lg">
                Начать обучение
              </Button>
            </Link>
            <Link to="/courses">
              <Button variant="secondary" size="lg">
                Перейти к курсам
              </Button>
            </Link>
          </div>
        </section>
      </div>
    </div>
  )
}

