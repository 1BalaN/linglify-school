import { FileText, AlertCircle, CheckCircle, XCircle, Scale } from 'lucide-react'
import { useTranslation } from 'react-i18next'

const termsContent = {
  ru: {
    title: 'Условия использования',
    updatedAt: 'Последнее обновление: 15 февраля 2026',
    sections: {
      s1Title: '1. Принятие условий',
      s1Text:
        'Настоящие Условия использования (далее — «Условия») регулируют ваш доступ и использование образовательной платформы Linglify (далее — «Платформа», «Сервис»). Регистрируясь на Платформе или используя её, вы соглашаетесь соблюдать эти Условия. Если вы не согласны с какими-либо положениями, пожалуйста, не используйте Платформу.',
      s2Title: '2. Создание учётной записи',
      s2ReqTitle: '2.1. Требования к регистрации',
      s2ReqItems: [
        'Вы должны быть не моложе 14 лет',
        'Предоставленная информация должна быть достоверной и актуальной',
        'Вы несёте ответственность за сохранность пароля',
        'Запрещено создавать несколько аккаунтов для одного лица',
        'Запрещено передавать доступ к аккаунту третьим лицам',
      ],
      s2OauthTitle: '2.2. Аутентификация через Google',
      s2OauthText:
        'При использовании OAuth авторизации через Google вы соглашаетесь с передачей базовой информации профиля (имя, email, фото) в соответствии с нашей Политикой конфиденциальности.',
      s3Title: '3. Использование Платформы',
      s3LicenseTitle: '3.1. Лицензия',
      s3LicenseText:
        'Мы предоставляем вам ограниченную, неисключительную, непередаваемую лицензию на доступ и использование Платформы в личных некоммерческих целях для изучения языков.',
      s3ForbiddenTitle: '3.2. Запрещённые действия',
      s3ForbiddenIntro: 'При использовании Платформы вы НЕ имеете права:',
      s3ForbiddenItems: [
        'Копировать, распространять или модифицировать контент курсов',
        'Использовать автоматизированные средства для сбора данных (парсинг, скрейпинг)',
        'Загружать вредоносный код или вирусы',
        'Взламывать или пытаться получить несанкционированный доступ',
        'Использовать Платформу для незаконных целей',
        'Продавать или перепродавать доступ к курсам',
        'Размещать оскорбительный, дискриминационный контент',
        'Выдавать себя за другое лицо или организацию',
      ],
      s4Title: '4. Подписка и платежи',
      s4TariffTitle: '4.1. Тарифы',
      s4TariffText:
        'Платформа предлагает бесплатный базовый доступ и Premium подписку с расширенными возможностями. Актуальные цены указаны на странице тарифов.',
      s4RenewTitle: '4.2. Автоматическое продление',
      s4RenewText:
        'Premium подписка автоматически продлевается в конце каждого периода, если не отменена заранее. Вы можете отменить подписку в любой момент в настройках профиля.',
      s4RefundTitle: '4.3. Возврат средств',
      s4RefundText:
        'Возврат возможен в течение 14 дней с момента оплаты, если вы не использовали Premium функции. Для запроса возврата свяжитесь с поддержкой.',
      s4PriceTitle: '4.4. Изменение цен',
      s4PriceText:
        'Мы оставляем за собой право изменять цены на подписку. Действующие подписчики будут уведомлены за 30 дней до изменения стоимости.',
      s5Title: '5. Интеллектуальная собственность',
      s5Text:
        'Все материалы на Платформе (тексты, видео, аудио, изображения, программный код, дизайн) защищены законами об авторском праве и являются собственностью Linglify или наших партнёров.',
      s5UserTitle: 'Пользовательский контент',
      s5UserText:
        'Загружая контент на Платформу (например, фото профиля), вы предоставляете нам неисключительную лицензию на использование этого контента для работы Сервиса.',
      s6Title: '6. Отказ от гарантий',
      s6Intro: 'Платформа предоставляется «как есть» без каких-либо гарантий. Мы не гарантируем:',
      s6Items: [
        'Непрерывную и бесперебойную работу Сервиса',
        'Отсутствие ошибок или уязвимостей',
        'Достижение конкретных образовательных результатов',
        'Совместимость со всеми устройствами и браузерами',
      ],
      s6Note:
        'Мы прилагаем все усилия для обеспечения качества и безопасности Платформы, но не можем гарантировать отсутствие технических сбоев.',
      s7Title: '7. Ограничение ответственности',
      s7Text:
        'Linglify не несёт ответственности за любые прямые, косвенные, случайные или специальные убытки, возникшие в результате использования или невозможности использования Платформы, включая (но не ограничиваясь) потерю данных, упущенную выгоду или прерывание деятельности.',
      s8Title: '8. Приостановка и удаление аккаунта',
      s8Intro:
        'Мы оставляем за собой право приостановить или удалить ваш аккаунт без предварительного уведомления в случае:',
      s8Items: [
        'Нарушения настоящих Условий',
        'Неоплаты подписки',
        'Неактивности в течение 2 лет',
        'Подозрения в мошеннических действиях',
        'По требованию правоохранительных органов',
      ],
      s8Note:
        'Вы можете самостоятельно удалить аккаунт в любое время через настройки профиля.',
      s9Title: '9. Изменение Условий',
      s9Text:
        'Мы можем изменять эти Условия использования. О существенных изменениях мы уведомим вас по электронной почте за 14 дней. Продолжение использования Платформы после вступления изменений в силу означает ваше согласие с новыми условиями.',
      s10Title: '10. Применимое право и разрешение споров',
      s10Text:
        'Настоящие Условия регулируются законодательством Республики Беларусь. Все споры, возникающие из использования Платформы, подлежат разрешению в судебном порядке по месту нахождения Linglify.',
      s10Note:
        'Перед обращением в суд стороны обязуются провести переговоры для мирного урегулирования спора.',
      s11Title: '11. Контактная информация',
      s11Intro:
        'По всем вопросам, связанным с настоящими Условиями, вы можете связаться с нами:',
      emailLabel: 'Email:',
      telegramLabel: 'Telegram:',
      final:
        'Используя Платформу Linglify, вы подтверждаете, что прочитали, поняли и согласны соблюдать настоящие Условия использования.',
    },
  },
  en: {
    title: 'Terms of Use',
    updatedAt: 'Last updated: February 15, 2026',
    sections: {
      s1Title: '1. Acceptance of terms',
      s1Text:
        'These Terms of Use (the "Terms") govern your access to and use of the Linglify educational platform (the "Platform", the "Service"). By registering or using the Platform, you agree to comply with these Terms. If you do not agree with any provision, please do not use the Platform.',
      s2Title: '2. Account creation',
      s2ReqTitle: '2.1. Registration requirements',
      s2ReqItems: [
        'You must be at least 14 years old',
        'Provided information must be accurate and up to date',
        'You are responsible for keeping your password secure',
        'Creating multiple accounts for one person is prohibited',
        'Sharing account access with third parties is prohibited',
      ],
      s2OauthTitle: '2.2. Google authentication',
      s2OauthText:
        'When using Google OAuth, you agree to transfer basic profile information (name, email, photo) according to our Privacy Policy.',
      s3Title: '3. Use of the Platform',
      s3LicenseTitle: '3.1. License',
      s3LicenseText:
        'We grant you a limited, non-exclusive, non-transferable license to access and use the Platform for personal non-commercial language learning purposes.',
      s3ForbiddenTitle: '3.2. Prohibited actions',
      s3ForbiddenIntro: 'When using the Platform, you may NOT:',
      s3ForbiddenItems: [
        'Copy, distribute, or modify course content',
        'Use automated tools for data collection (parsing, scraping)',
        'Upload malicious code or viruses',
        'Hack or attempt unauthorized access',
        'Use the Platform for illegal purposes',
        'Sell or resell course access',
        'Post abusive or discriminatory content',
        'Impersonate another person or organization',
      ],
      s4Title: '4. Subscription and payments',
      s4TariffTitle: '4.1. Plans',
      s4TariffText:
        'The Platform provides free basic access and a Premium subscription with advanced features. Current pricing is available on the plans page.',
      s4RenewTitle: '4.2. Automatic renewal',
      s4RenewText:
        'Premium subscription renews automatically at the end of each billing period unless canceled in advance. You can cancel at any time in profile settings.',
      s4RefundTitle: '4.3. Refunds',
      s4RefundText:
        'Refunds are available within 14 days of payment if Premium features were not used. Contact support to request a refund.',
      s4PriceTitle: '4.4. Price changes',
      s4PriceText:
        'We reserve the right to change subscription prices. Active subscribers will be notified 30 days before price changes.',
      s5Title: '5. Intellectual property',
      s5Text:
        'All platform materials (texts, videos, audio, images, software code, design) are protected by copyright laws and owned by Linglify or our partners.',
      s5UserTitle: 'User content',
      s5UserText:
        'By uploading content to the Platform (for example, profile photos), you grant us a non-exclusive license to use such content for service operation.',
      s6Title: '6. Disclaimer of warranties',
      s6Intro:
        'The Platform is provided "as is" without warranties of any kind. We do not guarantee:',
      s6Items: [
        'Continuous and uninterrupted service operation',
        'Absence of errors or vulnerabilities',
        'Achievement of specific learning outcomes',
        'Compatibility with all devices and browsers',
      ],
      s6Note:
        'We make every effort to ensure platform quality and security, but cannot guarantee absence of technical failures.',
      s7Title: '7. Limitation of liability',
      s7Text:
        'Linglify is not liable for any direct, indirect, incidental, or special damages resulting from use or inability to use the Platform, including but not limited to data loss, lost profits, or business interruption.',
      s8Title: '8. Account suspension and deletion',
      s8Intro:
        'We reserve the right to suspend or delete your account without prior notice in case of:',
      s8Items: [
        'Violation of these Terms',
        'Non-payment of subscription',
        'Inactivity for 2 years',
        'Suspected fraudulent activity',
        'Requests from law enforcement authorities',
      ],
      s8Note: 'You may delete your account at any time in profile settings.',
      s9Title: '9. Changes to Terms',
      s9Text:
        'We may update these Terms of Use. We will notify you of significant changes by email 14 days in advance. Continued use of the Platform after changes take effect means acceptance of the updated Terms.',
      s10Title: '10. Governing law and dispute resolution',
      s10Text:
        'These Terms are governed by the laws of the Republic of Belarus. All disputes arising from platform usage are subject to judicial resolution at Linglify location jurisdiction.',
      s10Note:
        'Before filing a lawsuit, parties agree to attempt amicable settlement through negotiations.',
      s11Title: '11. Contact information',
      s11Intro:
        'For any questions regarding these Terms, you can contact us:',
      emailLabel: 'Email:',
      telegramLabel: 'Telegram:',
      final:
        'By using the Linglify Platform, you confirm that you have read, understood, and agree to comply with these Terms of Use.',
    },
  },
} as const

export const TermsPage = () => {
  const { i18n } = useTranslation()
  const content = i18n.language.startsWith('en') ? termsContent.en : termsContent.ru

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-primary/5 via-background to-secondary/5 py-12">
      <div className="container mx-auto max-w-4xl px-4">
        <div className="mb-12 text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/30">
            <Scale className="h-8 w-8 text-white" />
          </div>
          <h1 className="mb-4 text-4xl font-bold text-gradient">
            {content.title}
          </h1>
          <p className="text-muted-foreground">
            {content.updatedAt}
          </p>
        </div>

        <div className="space-y-8">
          <div className="rounded-2xl glass-card p-8 backdrop-blur-xl">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">
                {content.sections.s1Title}
              </h2>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              {content.sections.s1Text}
            </p>
          </div>

          <div className="rounded-2xl glass-card p-8 backdrop-blur-xl">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <CheckCircle className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">
                {content.sections.s2Title}
              </h2>
            </div>
            <div className="space-y-3 text-muted-foreground">
              <p><strong className="text-foreground">{content.sections.s2ReqTitle}</strong></p>
              <ul className="ml-6 list-disc space-y-1">
                {content.sections.s2ReqItems.map(item => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <p className="mt-4"><strong className="text-foreground">{content.sections.s2OauthTitle}</strong></p>
              <p>
                {content.sections.s2OauthText}
              </p>
            </div>
          </div>

          <div className="rounded-2xl glass-card p-8 backdrop-blur-xl">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">
                {content.sections.s3Title}
              </h2>
            </div>
            <div className="space-y-3 text-muted-foreground">
              <p><strong className="text-foreground">{content.sections.s3LicenseTitle}</strong></p>
              <p>
                {content.sections.s3LicenseText}
              </p>
              <p className="mt-4"><strong className="text-foreground">{content.sections.s3ForbiddenTitle}</strong></p>
              <p>{content.sections.s3ForbiddenIntro}</p>
              <ul className="ml-6 list-disc space-y-1">
                {content.sections.s3ForbiddenItems.map(item => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="rounded-2xl glass-card p-8 backdrop-blur-xl">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <AlertCircle className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">
                {content.sections.s4Title}
              </h2>
            </div>
            <div className="space-y-3 text-muted-foreground">
              <p><strong className="text-foreground">{content.sections.s4TariffTitle}</strong></p>
              <p>{content.sections.s4TariffText}</p>
              <p className="mt-4"><strong className="text-foreground">{content.sections.s4RenewTitle}</strong></p>
              <p>{content.sections.s4RenewText}</p>
              <p className="mt-4"><strong className="text-foreground">{content.sections.s4RefundTitle}</strong></p>
              <p>{content.sections.s4RefundText}</p>
              <p className="mt-4"><strong className="text-foreground">{content.sections.s4PriceTitle}</strong></p>
              <p>{content.sections.s4PriceText}</p>
            </div>
          </div>

          <div className="rounded-2xl glass-card p-8 backdrop-blur-xl">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">
                {content.sections.s5Title}
              </h2>
            </div>
            <div className="space-y-3 text-muted-foreground">
              <p>
                {content.sections.s5Text}
              </p>
              <p className="mt-4"><strong className="text-foreground">{content.sections.s5UserTitle}</strong></p>
              <p>
                {content.sections.s5UserText}
              </p>
            </div>
          </div>

          <div className="rounded-2xl glass-card p-8 backdrop-blur-xl">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <XCircle className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">
                {content.sections.s6Title}
              </h2>
            </div>
            <div className="space-y-3 text-muted-foreground">
              <p>
                {content.sections.s6Intro}
              </p>
              <ul className="ml-6 list-disc space-y-1">
                {content.sections.s6Items.map(item => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <p className="mt-4">
                {content.sections.s6Note}
              </p>
            </div>
          </div>

          <div className="rounded-2xl glass-card p-8 backdrop-blur-xl">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <AlertCircle className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">
                {content.sections.s7Title}
              </h2>
            </div>
            <p className="text-muted-foreground">
              {content.sections.s7Text}
            </p>
          </div>

          <div className="rounded-2xl glass-card p-8 backdrop-blur-xl">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <XCircle className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">
                {content.sections.s8Title}
              </h2>
            </div>
            <div className="space-y-3 text-muted-foreground">
              <p>
                {content.sections.s8Intro}
              </p>
              <ul className="ml-6 list-disc space-y-1">
                {content.sections.s8Items.map(item => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <p className="mt-4">
                {content.sections.s8Note}
              </p>
            </div>
          </div>

          <div className="rounded-2xl glass-card p-8 backdrop-blur-xl">
            <h2 className="mb-4 text-2xl font-bold text-foreground">
              {content.sections.s9Title}
            </h2>
            <p className="text-muted-foreground">
              {content.sections.s9Text}
            </p>
          </div>

          <div className="rounded-2xl glass-card p-8 backdrop-blur-xl">
            <h2 className="mb-4 text-2xl font-bold text-foreground">
              {content.sections.s10Title}
            </h2>
            <div className="space-y-3 text-muted-foreground">
              <p>
                {content.sections.s10Text}
              </p>
              <p className="mt-4">
                {content.sections.s10Note}
              </p>
            </div>
          </div>

          <div className="rounded-2xl glass-card p-8 backdrop-blur-xl">
            <h2 className="mb-4 text-2xl font-bold text-foreground">
              {content.sections.s11Title}
            </h2>
            <p className="mb-4 text-muted-foreground">
              {content.sections.s11Intro}
            </p>
            <div className="space-y-2 text-muted-foreground">
              <p>
                <strong className="text-foreground">{content.sections.emailLabel}</strong>{' '}
                <a href="mailto:gormachdv@gmail.com" className="text-primary hover:underline">
                  gormachdv@gmail.com
                </a>
              </p>
              <p>
                <strong className="text-foreground">{content.sections.telegramLabel}</strong>{' '}
                <a href="https://t.me/iBa1aNCe" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  @iBa1aNCe
                </a>
              </p>
            </div>
          </div>

          <div className="rounded-xl glass p-6 border-2 border-primary/20">
            <p className="text-center text-sm text-muted-foreground">
              {content.sections.final}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
