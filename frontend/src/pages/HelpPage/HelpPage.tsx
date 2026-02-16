import { Link } from 'react-router-dom'
import { BookOpen, Video, FileText, Users, Award, Settings } from 'lucide-react'

export const HelpPage = () => {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-primary/5 via-background to-secondary/5 py-12">
      <div className="container mx-auto max-w-5xl px-4">
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold text-gradient">
            Центр помощи
          </h1>
          <p className="text-lg text-muted-foreground">
            Всё, что нужно знать для эффективного использования платформы
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-2xl glass-card p-6 backdrop-blur-xl transition-all duration-300 hover:shadow-xl hover:shadow-primary/10">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/30">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
            <h3 className="mb-2 text-xl font-bold text-foreground">
              Начало работы
            </h3>
            <p className="mb-4 text-sm text-muted-foreground">
              Узнайте, как создать аккаунт, выбрать курс и начать обучение
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Регистрация и вход в систему</li>
              <li>• Настройка профиля</li>
              <li>• Выбор языка для изучения</li>
              <li>• Первый урок</li>
            </ul>
          </div>

          <div className="rounded-2xl glass-card p-6 backdrop-blur-xl transition-all duration-300 hover:shadow-xl hover:shadow-primary/10">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-cyan-600 shadow-lg shadow-blue-500/30">
              <Video className="h-6 w-6 text-white" />
            </div>
            <h3 className="mb-2 text-xl font-bold text-foreground">
              Интерактивные уроки
            </h3>
            <p className="mb-4 text-sm text-muted-foreground">
              Как работать с видео, аудио и текстовыми материалами
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Просмотр видеоуроков</li>
              <li>• Выполнение заданий</li>
              <li>• Проверка произношения</li>
              <li>• Отслеживание прогресса</li>
            </ul>
          </div>

          <div className="rounded-2xl glass-card p-6 backdrop-blur-xl transition-all duration-300 hover:shadow-xl hover:shadow-primary/10">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-green-600 to-emerald-600 shadow-lg shadow-green-500/30">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <h3 className="mb-2 text-xl font-bold text-foreground">
              Упражнения и тесты
            </h3>
            <p className="mb-4 text-sm text-muted-foreground">
              Практикуйтесь и проверяйте свои знания
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Типы упражнений</li>
              <li>• Прохождение тестов</li>
              <li>• Система оценок</li>
              <li>• Работа над ошибками</li>
            </ul>
          </div>

          <div className="rounded-2xl glass-card p-6 backdrop-blur-xl transition-all duration-300 hover:shadow-xl hover:shadow-primary/10">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-orange-600 to-red-600 shadow-lg shadow-orange-500/30">
              <Users className="h-6 w-6 text-white" />
            </div>
            <h3 className="mb-2 text-xl font-bold text-foreground">
              Сообщество
            </h3>
            <p className="mb-4 text-sm text-muted-foreground">
              Общайтесь с другими студентами и преподавателями
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Форумы и обсуждения</li>
              <li>• Поиск языкового партнёра</li>
              <li>• Групповые занятия</li>
              <li>• Обратная связь</li>
            </ul>
          </div>

          <div className="rounded-2xl glass-card p-6 backdrop-blur-xl transition-all duration-300 hover:shadow-xl hover:shadow-primary/10">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/30">
              <Award className="h-6 w-6 text-white" />
            </div>
            <h3 className="mb-2 text-xl font-bold text-foreground">
              Достижения
            </h3>
            <p className="mb-4 text-sm text-muted-foreground">
              Отслеживайте свой прогресс и получайте награды
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Система уровней</li>
              <li>• Бейджи и награды</li>
              <li>• Статистика обучения</li>
              <li>• Сертификаты</li>
            </ul>
          </div>

          <div className="rounded-2xl glass-card p-6 backdrop-blur-xl transition-all duration-300 hover:shadow-xl hover:shadow-primary/10">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-slate-600 to-gray-600 shadow-lg shadow-slate-500/30">
              <Settings className="h-6 w-6 text-white" />
            </div>
            <h3 className="mb-2 text-xl font-bold text-foreground">
              Настройки аккаунта
            </h3>
            <p className="mb-4 text-sm text-muted-foreground">
              Управляйте своим профилем и предпочтениями
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Изменение данных профиля</li>
              <li>• Безопасность и пароли</li>
              <li>• Уведомления</li>
              <li>• Подписка и оплата</li>
            </ul>
          </div>
        </div>
        <div className="mt-8 text-center">
          <Link
            to="/contact"
            className="inline-flex items-center rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-3 font-semibold text-white shadow-lg shadow-cyan-500/30 transition-all hover:shadow-xl hover:shadow-cyan-500/40"
          >
            Связаться с поддержкой
          </Link>
        </div>
      </div>
    </div>
  )
}
