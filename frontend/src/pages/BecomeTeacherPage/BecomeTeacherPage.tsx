import { Link } from 'react-router-dom'
import { Button } from '@/shared/ui'

export const BecomeTeacherPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="container mx-auto max-w-5xl px-4 py-16">
        <div className="mb-10 text-center">
          <h1 className="mb-4 text-3xl font-bold text-foreground sm:text-4xl">
            Станьте преподавателем на Linglify
          </h1>
          <p className="mx-auto max-w-2xl text-sm text-muted-foreground">
            Наша платформа помогает преподавателям создавать современные онлайн‑курсы, автоматизировать
            рутину и получать прозрачную аналитику по ученикам.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-border bg-card p-5">
            <h2 className="mb-2 text-base font-semibold text-foreground">1. Подайте заявку</h2>
            <p className="text-sm text-muted-foreground">
              Расскажите о своём опыте преподавания, целевых языках и формате курсов, которые вы
              хотите запустить. Укажите ваше имя, email и номер телефона, привязанный к телеграмму.
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-5">
            <h2 className="mb-2 text-base font-semibold text-foreground">2. Настройте курс</h2>
            <p className="text-sm text-muted-foreground">
              Вместе с куратором вы подберёте структуру, уровень, placement‑логики и типы уроков
              (видео, тесты, интерактивы, диалоги).
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-5">
            <h2 className="mb-2 text-base font-semibold text-foreground">3. Запустите обучение</h2>
            <p className="text-sm text-muted-foreground">
              После модерации курс будет опубликован, а вы сможете отслеживать прогресс и аналитику
              по ученикам в реальном времени.
            </p>
          </div>
        </div>

        <div className="mt-10 rounded-2xl border border-border bg-card p-6">
          <h2 className="mb-3 text-lg font-semibold text-foreground">Что даёт платформа преподавателю</h2>
          <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
            <li>Готовые типы уроков: видео, тесты, интерактивные тренажёры, диалоги.</li>
            <li>Аналитика по курсам и ученикам: вовлечённость, прогресс, проблемные темы.</li>
            <li>Автоматизированные сертификаты и placement‑тесты для подбора уровня.</li>
          </ul>
        </div>

        <div className="mt-10 flex flex-col items-center gap-4 text-center">
          <p className="max-w-xl text-sm text-muted-foreground mb-2">
            Хотите стать преподавателем на Linglify ? Напишите нам через форму обратной связи, и мы
            свяжемся с вами, чтобы обсудить детали запуска курса.
          </p>
          <Link to="/contact">
            <Button size="lg">Связаться с нами</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default BecomeTeacherPage

