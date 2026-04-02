import { Link } from 'react-router-dom'
import { Button } from '@/shared/ui'
import { BookOpen, Users, Layers, CheckCircle, Sparkles } from 'lucide-react'
import LinglifyBanner from '@/assets/images/LinglifyBanner.webp'
import { useTranslation } from 'react-i18next'

export const AboutPage = () => {
  const { t, i18n } = useTranslation('about')
  const isEn = i18n.language.startsWith('en')

  const content = isEn
    ? {
        heroDescription:
          'Linglify is an educational platform for learning foreign languages through structured courses, interactive lessons, and transparent progress tracking. We help students move confidently from first steps to fluent communication.',
        chips: ['Video, tests, and interactive practice', 'Progress and reviews'],
        bannerAlt: 'Online learning on Linglify platform',
        learningTitle: 'How learning works',
        learningSteps: [
          'Student registers in the system.',
          'Can take a placement test to determine language level.',
          'Chooses a course in the catalog and gets access.',
          'Completes three lesson types: video, tests, and interactive.',
          'System calculates lesson and course progress.',
          'Student leaves reviews, teacher gets feedback.',
        ],
        audience: [
          {
            icon: Users,
            title: 'For students',
            description:
              'Course catalog, “My learning” section, a unified lesson interface, and transparent progress for each course.',
          },
          {
            icon: BookOpen,
            title: 'For teachers',
            description:
              'Convenient dashboard for creating courses and lessons: video format, tests with options, and fill-in interactive tasks.',
          },
          {
            icon: Layers,
            title: 'For administrators',
            description:
              'Course moderation, publication status management, review handling, and core platform pages.',
          },
        ],
        lessonsTitle: 'Lessons designed for daily learning',
        lessonsDescription:
          'Courses include three activity formats: video, tests, and interactive exercises. Teachers use clear forms to create content, and students get a unified, easy flow.',
        formats: [
          {
            title: 'Video lessons',
            text1:
              'Short videos with explanations and live speech, supplemented by notes, useful links, and clarifications.',
            text2:
              'Student side uses a single player that supports both direct files and embedded links.',
          },
          {
            title: 'Tests',
            text1:
              'Questions with answer options, support for multiple correct answers, and pass threshold in percent.',
            text2:
              'Students see the result without exposing correct answers to preserve learning effect.',
          },
          {
            title: 'Interactive',
            text1:
              'Fill-in-the-blank exercises (e.g. “I ___ to school every day”), where a student enters their answer.',
            text2:
              'Answer checking without showing correct variants, with ability to retry.',
          },
        ],
        ctaTitle: 'Ready to try the platform from inside?',
        ctaDescription:
          'Sign up as a student and complete your first lessons. Core course logic is already live — we keep improving design and content.',
      }
    : {
        heroDescription:
          'Linglify — это образовательная платформа для изучения иностранных языков через структурированные курсы, интерактивные уроки и прозрачный прогресс. Мы помогаем студентам уверенно двигаться от первых шагов до свободного общения.',
        chips: ['Видео, тесты и интерактив', 'Прогресс и отзывы'],
        bannerAlt: 'Онлайн-обучение на платформе Linglify',
        learningTitle: 'Как устроено обучение',
        learningSteps: [
          'Студент регистрируется в системе.',
          'Может пройти тест на определение уровня языка.',
          'Выбирает курс в каталоге и оформляет доступ.',
          'Проходит уроки трёх типов: видео, тесты и интерактив.',
          'Система считает прогресс по урокам и курсу.',
          'Студент оставляет отзывы, преподаватель видит обратную связь.',
        ],
        audience: [
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
        ],
        lessonsTitle: 'Уроки, с которыми удобно заниматься каждый день',
        lessonsDescription:
          'Внутри курсов доступны три формата занятий: видео, тесты и интерактивные упражнения. Преподаватель заполняет понятные формы, а студенты видят единый и удобный интерфейс прохождения.',
        formats: [
          {
            title: 'Видео-уроки',
            text1:
              'Короткие видео с объяснениями и живой речью, дополненные конспектом, полезными ссылками и пояснениями к уроку.',
            text2:
              'На стороне студента используется единый видеоплеер, поддерживающий как файлы, так и встраиваемые ссылки.',
          },
          {
            title: 'Тесты',
            text1:
              'Вопросы с вариантами ответов, поддержка нескольких правильных вариантов и порог прохождения в процентах.',
            text2:
              'Студент видит результат без подсказки правильных ответов, чтобы сохранить учебный эффект.',
          },
          {
            title: 'Интерактив',
            text1:
              'Упражнения с пропусками в предложениях (формат «I ___ to school every day»), куда студент вписывает ответ.',
            text2:
              'Проверка ответов без показа правильных вариантов, с возможностью повторить попытку.',
          },
        ],
        ctaTitle: 'Готовы протестировать платформу изнутри?',
        ctaDescription:
          'Зарегистрируйтесь как студент и попробуйте пройти первые уроки. Вся логика курсов уже работает — мы продолжаем развивать дизайн и контент.',
      }
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-primary/5 via-background to-secondary/5 py-12">
      <div className="container mx-auto max-w-6xl px-4 space-y-16">
        {/* Hero */}
        <section className="grid items-center gap-10 md:grid-cols-[1.6fr,1.2fr]">
          <div className="space-y-6">
            <h1 className="text-4xl font-bold text-foreground sm:text-5xl">
              {t('title')} <span className="text-primary">Linglify</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              {content.heroDescription}
            </p>
            <div className="flex flex-wrap gap-3">
              <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                <CheckCircle className="h-4 w-4" />
                {content.chips[0]}
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                <CheckCircle className="h-4 w-4" />
                {content.chips[1]}
              </span>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-2xl shadow-primary/20">
            <div className="relative h-40">
              <img
                src={LinglifyBanner}
                alt={content.bannerAlt}
                className="h-full w-full object-cover"
                loading="lazy"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-black/35 via-transparent to-transparent" />
            </div>
            <div className="p-6">
              <h2 className="mb-2 text-lg font-semibold text-foreground">
                {content.learningTitle}
              </h2>
              <ol className="mb-4 list-decimal space-y-2 pl-5 text-sm text-muted-foreground">
                {content.learningSteps.map(step => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
              <Link to="/courses">
                <Button className="w-full">{t('catalogCta')}</Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Для кого платформа */}
        <section className="grid gap-8 md:grid-cols-3">
          {content.audience.map((item, index) => (
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
                {content.lessonsTitle}
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {content.lessonsDescription}
              </p>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {content.formats.map(format => (
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
            {content.ctaTitle}
          </h2>
          <p className="mb-6 text-sm sm:text-base text-primary-foreground/80">
            {content.ctaDescription}
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

