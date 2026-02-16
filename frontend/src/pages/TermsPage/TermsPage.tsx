import { FileText, AlertCircle, CheckCircle, XCircle, Scale } from 'lucide-react'

export const TermsPage = () => {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-primary/5 via-background to-secondary/5 py-12">
      <div className="container mx-auto max-w-4xl px-4">
        <div className="mb-12 text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/30">
            <Scale className="h-8 w-8 text-white" />
          </div>
          <h1 className="mb-4 text-4xl font-bold text-gradient">
            Условия использования
          </h1>
          <p className="text-muted-foreground">
            Последнее обновление: 15 февраля 2026
          </p>
        </div>

        <div className="space-y-8">
          <div className="rounded-2xl glass-card p-8 backdrop-blur-xl">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">
                1. Принятие условий
              </h2>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              Настоящие Условия использования (далее — «Условия») регулируют ваш доступ и использование 
              образовательной платформы Linglify (далее — «Платформа», «Сервис»). Регистрируясь на Платформе 
              или используя её, вы соглашаетесь соблюдать эти Условия. Если вы не согласны с какими-либо 
              положениями, пожалуйста, не используйте Платформу.
            </p>
          </div>

          <div className="rounded-2xl glass-card p-8 backdrop-blur-xl">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <CheckCircle className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">
                2. Создание учётной записи
              </h2>
            </div>
            <div className="space-y-3 text-muted-foreground">
              <p><strong className="text-foreground">2.1. Требования к регистрации</strong></p>
              <ul className="ml-6 list-disc space-y-1">
                <li>Вы должны быть не моложе 14 лет</li>
                <li>Предоставленная информация должна быть достоверной и актуальной</li>
                <li>Вы несёте ответственность за сохранность пароля</li>
                <li>Запрещено создавать несколько аккаунтов для одного лица</li>
                <li>Запрещено передавать доступ к аккаунту третьим лицам</li>
              </ul>
              <p className="mt-4"><strong className="text-foreground">2.2. Аутентификация через Google</strong></p>
              <p>
                При использовании OAuth авторизации через Google вы соглашаетесь с передачей базовой 
                информации профиля (имя, email, фото) в соответствии с нашей Политикой конфиденциальности.
              </p>
            </div>
          </div>

          <div className="rounded-2xl glass-card p-8 backdrop-blur-xl">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">
                3. Использование Платформы
              </h2>
            </div>
            <div className="space-y-3 text-muted-foreground">
              <p><strong className="text-foreground">3.1. Лицензия</strong></p>
              <p>
                Мы предоставляем вам ограниченную, неисключительную, непередаваемую лицензию на доступ 
                и использование Платформы в личных некоммерческих целях для изучения языков.
              </p>
              <p className="mt-4"><strong className="text-foreground">3.2. Запрещённые действия</strong></p>
              <p>При использовании Платформы вы НЕ имеете права:</p>
              <ul className="ml-6 list-disc space-y-1">
                <li>Копировать, распространять или модифицировать контент курсов</li>
                <li>Использовать автоматизированные средства для сбора данных (парсинг, скрейпинг)</li>
                <li>Загружать вредоносный код или вирусы</li>
                <li>Взламывать или пытаться получить несанкционированный доступ</li>
                <li>Использовать Платформу для незаконных целей</li>
                <li>Продавать или перепродавать доступ к курсам</li>
                <li>Размещать оскорбительный, дискриминационный контент</li>
                <li>Выдавать себя за другое лицо или организацию</li>
              </ul>
            </div>
          </div>

          <div className="rounded-2xl glass-card p-8 backdrop-blur-xl">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <AlertCircle className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">
                4. Подписка и платежи
              </h2>
            </div>
            <div className="space-y-3 text-muted-foreground">
              <p><strong className="text-foreground">4.1. Тарифы</strong></p>
              <p>
                Платформа предлагает бесплатный базовый доступ и Premium подписку с расширенными возможностями. 
                Актуальные цены указаны на странице тарифов.
              </p>
              <p className="mt-4"><strong className="text-foreground">4.2. Автоматическое продление</strong></p>
              <p>
                Premium подписка автоматически продлевается в конце каждого периода, если не отменена заранее. 
                Вы можете отменить подписку в любой момент в настройках профиля.
              </p>
              <p className="mt-4"><strong className="text-foreground">4.3. Возврат средств</strong></p>
              <p>
                Возврат возможен в течение 14 дней с момента оплаты, если вы не использовали Premium функции. 
                Для запроса возврата свяжитесь с поддержкой.
              </p>
              <p className="mt-4"><strong className="text-foreground">4.4. Изменение цен</strong></p>
              <p>
                Мы оставляем за собой право изменять цены на подписку. Действующие подписчики будут 
                уведомлены за 30 дней до изменения стоимости.
              </p>
            </div>
          </div>

          <div className="rounded-2xl glass-card p-8 backdrop-blur-xl">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">
                5. Интеллектуальная собственность
              </h2>
            </div>
            <div className="space-y-3 text-muted-foreground">
              <p>
                Все материалы на Платформе (тексты, видео, аудио, изображения, программный код, дизайн) 
                защищены законами об авторском праве и являются собственностью Linglify или наших партнёров.
              </p>
              <p className="mt-4"><strong className="text-foreground">Пользовательский контент</strong></p>
              <p>
                Загружая контент на Платформу (например, фото профиля), вы предоставляете нам 
                неисключительную лицензию на использование этого контента для работы Сервиса.
              </p>
            </div>
          </div>

          <div className="rounded-2xl glass-card p-8 backdrop-blur-xl">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <XCircle className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">
                6. Отказ от гарантий
              </h2>
            </div>
            <div className="space-y-3 text-muted-foreground">
              <p>
                Платформа предоставляется «как есть» без каких-либо гарантий. Мы не гарантируем:
              </p>
              <ul className="ml-6 list-disc space-y-1">
                <li>Непрерывную и бесперебойную работу Сервиса</li>
                <li>Отсутствие ошибок или уязвимостей</li>
                <li>Достижение конкретных образовательных результатов</li>
                <li>Совместимость со всеми устройствами и браузерами</li>
              </ul>
              <p className="mt-4">
                Мы прилагаем все усилия для обеспечения качества и безопасности Платформы, но не можем 
                гарантировать отсутствие технических сбоев.
              </p>
            </div>
          </div>

          <div className="rounded-2xl glass-card p-8 backdrop-blur-xl">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <AlertCircle className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">
                7. Ограничение ответственности
              </h2>
            </div>
            <p className="text-muted-foreground">
              Linglify не несёт ответственности за любые прямые, косвенные, случайные или специальные 
              убытки, возникшие в результате использования или невозможности использования Платформы, 
              включая (но не ограничиваясь) потерю данных, упущенную выгоду или прерывание деятельности.
            </p>
          </div>

          <div className="rounded-2xl glass-card p-8 backdrop-blur-xl">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <XCircle className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">
                8. Приостановка и удаление аккаунта
              </h2>
            </div>
            <div className="space-y-3 text-muted-foreground">
              <p>
                Мы оставляем за собой право приостановить или удалить ваш аккаунт без предварительного 
                уведомления в случае:
              </p>
              <ul className="ml-6 list-disc space-y-1">
                <li>Нарушения настоящих Условий</li>
                <li>Неоплаты подписки</li>
                <li>Неактивности в течение 2 лет</li>
                <li>Подозрения в мошеннических действиях</li>
                <li>По требованию правоохранительных органов</li>
              </ul>
              <p className="mt-4">
                Вы можете самостоятельно удалить аккаунт в любое время через настройки профиля.
              </p>
            </div>
          </div>

          <div className="rounded-2xl glass-card p-8 backdrop-blur-xl">
            <h2 className="mb-4 text-2xl font-bold text-foreground">
              9. Изменение Условий
            </h2>
            <p className="text-muted-foreground">
              Мы можем изменять эти Условия использования. О существенных изменениях мы уведомим вас 
              по электронной почте за 14 дней. Продолжение использования Платформы после вступления 
              изменений в силу означает ваше согласие с новыми условиями.
            </p>
          </div>

          <div className="rounded-2xl glass-card p-8 backdrop-blur-xl">
            <h2 className="mb-4 text-2xl font-bold text-foreground">
              10. Применимое право и разрешение споров
            </h2>
            <div className="space-y-3 text-muted-foreground">
              <p>
                Настоящие Условия регулируются законодательством Республики Беларусь. Все споры, 
                возникающие из использования Платформы, подлежат разрешению в судебном порядке по 
                месту нахождения Linglify.
              </p>
              <p className="mt-4">
                Перед обращением в суд стороны обязуются провести переговоры для мирного урегулирования спора.
              </p>
            </div>
          </div>

          <div className="rounded-2xl glass-card p-8 backdrop-blur-xl">
            <h2 className="mb-4 text-2xl font-bold text-foreground">
              11. Контактная информация
            </h2>
            <p className="mb-4 text-muted-foreground">
              По всем вопросам, связанным с настоящими Условиями, вы можете связаться с нами:
            </p>
            <div className="space-y-2 text-muted-foreground">
              <p>
                <strong className="text-foreground">Email:</strong>{' '}
                <a href="mailto:gormachdv@gmail.com" className="text-primary hover:underline">
                  gormachdv@gmail.com
                </a>
              </p>
              <p>
                <strong className="text-foreground">Telegram:</strong>{' '}
                <a href="https://t.me/iBa1aNCe" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  @iBa1aNCe
                </a>
              </p>
            </div>
          </div>

          <div className="rounded-xl glass p-6 border-2 border-primary/20">
            <p className="text-center text-sm text-muted-foreground">
              Используя Платформу Linglify, вы подтверждаете, что прочитали, поняли и согласны 
              соблюдать настоящие Условия использования.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
