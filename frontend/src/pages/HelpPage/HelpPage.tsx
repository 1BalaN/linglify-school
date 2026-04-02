import { Link } from 'react-router-dom'
import { BookOpen, Video, FileText, Users, Award, Settings } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export const HelpPage = () => {
  const { t, i18n } = useTranslation('support')
  const isEn = i18n.language.startsWith('en')

  const cards = isEn
    ? [
        {
          icon: BookOpen,
          title: 'Getting started',
          description: 'Learn how to create an account, choose a course, and start learning',
          items: [
            'Registration and sign in',
            'Profile setup',
            'Choosing a target language',
            'Your first lesson',
          ],
        },
        {
          icon: Video,
          title: 'Interactive lessons',
          description: 'How to work with video, audio, and text materials',
          items: [
            'Watching video lessons',
            'Completing exercises',
            'Pronunciation practice',
            'Progress tracking',
          ],
        },
        {
          icon: FileText,
          title: 'Exercises and tests',
          description: 'Practice and validate your knowledge',
          items: [
            'Exercise types',
            'Taking tests',
            'Grading system',
            'Working on mistakes',
          ],
        },
        {
          icon: Users,
          title: 'Community',
          description: 'Communicate with students and teachers',
          items: [
            'Forums and discussions',
            'Language partner search',
            'Group sessions',
            'Feedback',
          ],
        },
        {
          icon: Award,
          title: 'Achievements',
          description: 'Track your progress and earn rewards',
          items: [
            'Level system',
            'Badges and rewards',
            'Learning statistics',
            'Certificates',
          ],
        },
        {
          icon: Settings,
          title: 'Account settings',
          description: 'Manage your profile and preferences',
          items: [
            'Profile data updates',
            'Security and passwords',
            'Notifications',
            'Subscription and payments',
          ],
        },
      ]
    : [
        {
          icon: BookOpen,
          title: 'Начало работы',
          description: 'Узнайте, как создать аккаунт, выбрать курс и начать обучение',
          items: [
            'Регистрация и вход в систему',
            'Настройка профиля',
            'Выбор языка для изучения',
            'Первый урок',
          ],
        },
        {
          icon: Video,
          title: 'Интерактивные уроки',
          description: 'Как работать с видео, аудио и текстовыми материалами',
          items: [
            'Просмотр видеоуроков',
            'Выполнение заданий',
            'Проверка произношения',
            'Отслеживание прогресса',
          ],
        },
        {
          icon: FileText,
          title: 'Упражнения и тесты',
          description: 'Практикуйтесь и проверяйте свои знания',
          items: [
            'Типы упражнений',
            'Прохождение тестов',
            'Система оценок',
            'Работа над ошибками',
          ],
        },
        {
          icon: Users,
          title: 'Сообщество',
          description: 'Общайтесь с другими студентами и преподавателями',
          items: [
            'Форумы и обсуждения',
            'Поиск языкового партнёра',
            'Групповые занятия',
            'Обратная связь',
          ],
        },
        {
          icon: Award,
          title: 'Достижения',
          description: 'Отслеживайте свой прогресс и получайте награды',
          items: [
            'Система уровней',
            'Бейджи и награды',
            'Статистика обучения',
            'Сертификаты',
          ],
        },
        {
          icon: Settings,
          title: 'Настройки аккаунта',
          description: 'Управляйте своим профилем и предпочтениями',
          items: [
            'Изменение данных профиля',
            'Безопасность и пароли',
            'Уведомления',
            'Подписка и оплата',
          ],
        },
      ]
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-primary/5 via-background to-secondary/5 py-12">
      <div className="container mx-auto max-w-5xl px-4">
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold text-gradient">
            {t('help.title')}
          </h1>
          <p className="text-lg text-muted-foreground">
            {t('help.subtitle')}
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {cards.map(card => (
            <div
              key={card.title}
              className="rounded-2xl glass-card p-6 backdrop-blur-xl transition-all duration-300 hover:shadow-xl hover:shadow-primary/10"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/30">
                <card.icon className="h-6 w-6 text-white" />
              </div>
              <h3 className="mb-2 text-xl font-bold text-foreground">{card.title}</h3>
              <p className="mb-4 text-sm text-muted-foreground">{card.description}</p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {card.items.map(item => (
                  <li key={item}>• {item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-8 text-center">
          <Link
            to="/contact"
            className="inline-flex items-center rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-3 font-semibold text-white shadow-lg shadow-cyan-500/30 transition-all hover:shadow-xl hover:shadow-cyan-500/40"
          >
            {t('help.contactSupport')}
          </Link>
        </div>
      </div>
    </div>
  )
}
