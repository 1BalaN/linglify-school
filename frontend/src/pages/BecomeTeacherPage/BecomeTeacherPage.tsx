import { Link } from 'react-router-dom'
import { Button } from '@/shared/ui'
import { Check, Crown, Zap, BarChart2, MessageCircle, Award } from 'lucide-react'

const FEATURES = [
  { icon: Zap, title: 'Конструктор курсов', desc: 'Видео, тесты, интерактивы, диалоги, лексические тренажёры — всё в одном месте.' },
  { icon: BarChart2, title: 'Детальная аналитика', desc: 'Отслеживайте вовлечённость, прогресс и проблемные темы для каждого студента.' },
  { icon: MessageCircle, title: 'Чат со студентами', desc: 'Отвечайте на вопросы прямо в платформе, получайте системные уведомления.' },
  { icon: Award, title: 'Автосертификаты', desc: 'Платформа сама выдаёт сертификаты с верификацией — без вашего участия.' },
]

const PLAN_FEATURES = [
  'Неограниченное число курсов',
  'Публикация и продажа курсов',
  'Приоритетная поддержка',
  'Полная аналитика',
  'Выплата 75% от продаж',
]

export const BecomeTeacherPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="container mx-auto max-w-5xl px-4 py-16">

        {/* Hero */}
        <div className="mb-14 text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg">
            <Crown className="h-8 w-8 text-white" />
          </div>
          <h1 className="mb-4 text-4xl font-bold">Станьте преподавателем на Linglify</h1>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            Создавайте языковые курсы, автоматизируйте рутину и зарабатывайте — платформа берёт всего 25% комиссии.
          </p>
        </div>

        {/* Steps */}
        <div className="mb-14 grid gap-6 md:grid-cols-3">
          {[
            { step: '1', title: 'Зарегистрируйтесь', desc: 'Выберите роль «Преподаватель» при регистрации и получите 30 дней бесплатного пробного периода.' },
            { step: '2', title: 'Создайте курс', desc: 'Добавьте уроки разных типов, загрузите материалы и отправьте курс на модерацию.' },
            { step: '3', title: 'Получайте доход', desc: 'После публикации студенты записываются и оплачивают курс. 75% суммы — ваши.' },
          ].map(s => (
            <div key={s.step} className="rounded-2xl border border-border bg-card p-6">
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">{s.step}</div>
              <h2 className="mb-1 font-semibold">{s.title}</h2>
              <p className="text-sm text-muted-foreground">{s.desc}</p>
            </div>
          ))}
        </div>

        {/* Features */}
        <div className="mb-14 grid gap-4 sm:grid-cols-2">
          {FEATURES.map(f => (
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
            <p className="mb-1 text-sm font-medium text-muted-foreground">Месячная</p>
            <p className="text-3xl font-bold">
              30 BYN <span className="text-base font-normal text-muted-foreground">/ мес</span>
            </p>
            {/* spacer so the list starts at the same height as the annual card */}
            <p className="mb-2 text-xs text-transparent select-none">—</p>
            <ul className="my-6 grow space-y-2.5">
              {PLAN_FEATURES.map(f => (
                <li key={f} className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 shrink-0 text-emerald-500" />{f}
                </li>
              ))}
            </ul>
            <Link to="/register?role=teacher">
              <Button variant="outline" className="w-full">Начать</Button>
            </Link>
          </div>

          {/* Annual */}
          <div className="flex flex-col rounded-2xl border-2 border-primary/50 bg-card p-7 shadow-lg shadow-primary/5">
            <div className="mb-1 flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">Годовая</p>
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400">−33%</span>
            </div>
            <p className="text-3xl font-bold">
              240 BYN <span className="text-base font-normal text-muted-foreground">/ год</span>
            </p>
            <p className="mb-2 text-xs text-muted-foreground">20 BYN в месяц</p>
            <ul className="my-6 grow space-y-2.5">
              {PLAN_FEATURES.map(f => (
                <li key={f} className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 shrink-0 text-emerald-500" />{f}
                </li>
              ))}
            </ul>
            <Link to="/register?role=teacher">
              <Button className="w-full">Зарегистрироваться и сэкономить</Button>
            </Link>
          </div>
        </div>

        <p className="text-center text-sm text-muted-foreground">
          Начните с <strong>30 дней бесплатно</strong> — карта не нужна. Оплата в белорусских рублях.
        </p>
      </div>
    </div>
  )
}

export default BecomeTeacherPage
