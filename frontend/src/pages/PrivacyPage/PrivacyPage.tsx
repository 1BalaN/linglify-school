import { Shield, Lock, Eye, Database, UserCheck, FileText } from 'lucide-react'
import { useTranslation } from 'react-i18next'

const privacyContent = {
  ru: {
    title: 'Политика конфиденциальности',
    updatedAt: 'Последнее обновление: 15 февраля 2026',
    introTitle: 'Введение',
    introText:
      'Образовательная платформа Linglify (далее — «Платформа», «мы», «нас») серьёзно относится к защите вашей конфиденциальности. Настоящая Политика конфиденциальности описывает, какую информацию мы собираем, как её используем и защищаем при использовании вами нашей платформы. Используя Linglify, вы соглашаетесь с условиями, описанными в данной Политике.',
    collectTitle: 'Какую информацию мы собираем',
    collectPersonalTitle: '1. Персональные данные',
    collectPersonalItems: [
      'Имя и фамилия',
      'Адрес электронной почты',
      'Номер телефона (опционально)',
      'Дата рождения (опционально)',
      'Фотография профиля (опционально)',
      'Информация из профиля Google (при OAuth авторизации)',
    ],
    collectLearningTitle: '2. Данные об обучении',
    collectLearningItems: [
      'Прогресс прохождения курсов и уроков',
      'Результаты тестов и упражнений',
      'Время, проведённое на платформе',
      'Предпочитаемые языки для изучения',
      'Записи произношения (для проверки речи)',
    ],
    collectTechnicalTitle: '3. Технические данные',
    collectTechnicalItems: [
      'IP-адрес',
      'Тип браузера и его версия',
      'Операционная система',
      'Данные cookies и локального хранилища',
      'Информация об устройстве (разрешение экрана, язык системы)',
    ],
    useTitle: 'Как мы используем информацию',
    useItems: [
      'Предоставление и улучшение образовательных услуг',
      'Персонализация обучения и рекомендации курсов',
      'Аутентификация и управление учётной записью',
      'Отправка уведомлений об обновлениях и прогрессе',
      'Обработка платежей и управление подписками',
      'Анализ использования платформы и улучшение функциональности',
      'Техническая поддержка и ответы на запросы',
      'Предотвращение мошенничества и обеспечение безопасности',
      'Соблюдение законодательства и правовых обязательств',
    ],
    protectTitle: 'Защита данных',
    protectIntro: 'Мы применяем современные технологии для защиты ваших данных:',
    protectItems: [
      'Шифрование данных при передаче (SSL/TLS)',
      'Хеширование паролей с использованием bcrypt',
      'Защищённое хранение в базе данных PostgreSQL',
      'Регулярное резервное копирование',
      'Ограничение доступа к персональным данным',
      'Двухфакторная аутентификация (опционально)',
      'Мониторинг безопасности и логирование',
    ],
    rightsTitle: 'Ваши права',
    rightsIntro: 'В соответствии с законодательством о защите данных, вы имеете право:',
    rightsItems: [
      'Доступ: запросить копию ваших данных',
      'Исправление: обновить или исправить неточную информацию',
      'Удаление: запросить удаление вашей учётной записи и данных',
      'Ограничение обработки: попросить временно прекратить обработку данных',
      'Портируемость: получить данные в структурированном формате',
      'Отзыв согласия: в любой момент отозвать согласие на обработку',
      'Возражение: возразить против определённых видов обработки',
    ],
    rightsContact: 'Для реализации этих прав свяжитесь с нами по адресу',
    cookiesTitle: 'Cookies и аналитика',
    cookiesIntro: 'Мы используем cookies для улучшения работы платформы. Cookies делятся на:',
    cookiesItems: [
      'Необходимые: для аутентификации и базовой функциональности',
      'Функциональные: для запоминания настроек и предпочтений',
      'Аналитические: для анализа использования (Google Analytics)',
    ],
    cookiesNote:
      'Вы можете управлять cookies через настройки браузера, но отключение некоторых cookies может ограничить функциональность платформы.',
    thirdPartyTitle: 'Передача данных третьим лицам',
    thirdPartyIntro: 'Мы можем передавать данные следующим третьим лицам:',
    thirdPartyItems: [
      'Сервисы хостинга: Vercel, Railway (хранение данных)',
      'Аутентификация: Google OAuth',
      'Платёжные системы: Stripe (обработка платежей)',
      'Email-сервисы: для отправки уведомлений',
      'SMS-сервисы: Twilio (подтверждение телефона)',
      'Аналитика: Google Analytics',
    ],
    thirdPartyNote:
      'Все партнёры соблюдают стандарты конфиденциальности и используют данные только для предоставления услуг Linglify.',
    retentionTitle: 'Хранение данных',
    retentionText:
      'Мы храним ваши данные в течение всего времени существования вашей учётной записи. После удаления аккаунта персональные данные удаляются в течение 30 дней, за исключением информации, которую мы обязаны хранить по законодательству (например, данные о транзакциях).',
    changesTitle: 'Изменения в Политике',
    changesText:
      'Мы можем обновлять эту Политику конфиденциальности. О существенных изменениях мы уведомим вас по электронной почте или через уведомление на платформе. Рекомендуем периодически проверять эту страницу на наличие обновлений.',
    contactsTitle: 'Контакты',
    contactsIntro:
      'Если у вас есть вопросы по Политике конфиденциальности или вы хотите реализовать свои права, свяжитесь с нами:',
    emailLabel: 'Email:',
    telegramLabel: 'Telegram:',
  },
  en: {
    title: 'Privacy Policy',
    updatedAt: 'Last updated: February 15, 2026',
    introTitle: 'Introduction',
    introText:
      'The Linglify educational platform (hereinafter referred to as the "Platform", "we", "us") takes your privacy seriously. This Privacy Policy explains what information we collect, how we use it, and how we protect it when you use our platform. By using Linglify, you agree to the terms described in this Policy.',
    collectTitle: 'What information we collect',
    collectPersonalTitle: '1. Personal data',
    collectPersonalItems: [
      'First and last name',
      'Email address',
      'Phone number (optional)',
      'Date of birth (optional)',
      'Profile picture (optional)',
      'Information from Google profile (for OAuth authorization)',
    ],
    collectLearningTitle: '2. Learning data',
    collectLearningItems: [
      'Course and lesson progress',
      'Test and exercise results',
      'Time spent on the platform',
      'Preferred learning languages',
      'Pronunciation recordings (for speech assessment)',
    ],
    collectTechnicalTitle: '3. Technical data',
    collectTechnicalItems: [
      'IP address',
      'Browser type and version',
      'Operating system',
      'Cookies and local storage data',
      'Device information (screen resolution, system language)',
    ],
    useTitle: 'How we use information',
    useItems: [
      'Provide and improve educational services',
      'Personalize learning and course recommendations',
      'Authentication and account management',
      'Send updates and progress notifications',
      'Process payments and subscriptions',
      'Analyze platform usage and improve functionality',
      'Provide technical support and respond to requests',
      'Prevent fraud and ensure security',
      'Comply with legal requirements and obligations',
    ],
    protectTitle: 'Data protection',
    protectIntro: 'We use modern technologies to protect your data:',
    protectItems: [
      'Data encryption in transit (SSL/TLS)',
      'Password hashing with bcrypt',
      'Secure storage in PostgreSQL database',
      'Regular backups',
      'Restricted access to personal data',
      'Two-factor authentication (optional)',
      'Security monitoring and logging',
    ],
    rightsTitle: 'Your rights',
    rightsIntro: 'Under data protection laws, you have the right to:',
    rightsItems: [
      'Access: request a copy of your data',
      'Rectification: update or correct inaccurate information',
      'Deletion: request deletion of your account and data',
      'Restriction: request temporary limitation of processing',
      'Portability: receive data in a structured format',
      'Withdraw consent: revoke consent at any time',
      'Objection: object to certain types of processing',
    ],
    rightsContact: 'To exercise these rights, contact us at',
    cookiesTitle: 'Cookies and analytics',
    cookiesIntro: 'We use cookies to improve the platform. Cookies are divided into:',
    cookiesItems: [
      'Essential: for authentication and core functionality',
      'Functional: to remember preferences and settings',
      'Analytics: to analyze usage (Google Analytics)',
    ],
    cookiesNote:
      'You can manage cookies in your browser settings, but disabling some cookies may limit platform functionality.',
    thirdPartyTitle: 'Data sharing with third parties',
    thirdPartyIntro: 'We may share data with the following third parties:',
    thirdPartyItems: [
      'Hosting providers: Vercel, Railway (data storage)',
      'Authentication: Google OAuth',
      'Payment systems: Stripe (payment processing)',
      'Email services: for notifications',
      'SMS services: Twilio (phone verification)',
      'Analytics: Google Analytics',
    ],
    thirdPartyNote:
      'All partners follow privacy standards and use data only to provide Linglify services.',
    retentionTitle: 'Data retention',
    retentionText:
      'We store your data for as long as your account exists. After account deletion, personal data is deleted within 30 days, except information that must be retained by law (for example, transaction data).',
    changesTitle: 'Policy changes',
    changesText:
      'We may update this Privacy Policy. We will notify you of significant changes by email or via a platform notice. We recommend checking this page periodically for updates.',
    contactsTitle: 'Contacts',
    contactsIntro:
      'If you have questions about this Privacy Policy or want to exercise your rights, contact us:',
    emailLabel: 'Email:',
    telegramLabel: 'Telegram:',
  },
} as const

export const PrivacyPage = () => {
  const { i18n } = useTranslation()
  const content = i18n.language.startsWith('en') ? privacyContent.en : privacyContent.ru

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-primary/5 via-background to-secondary/5 py-12">
      <div className="container mx-auto max-w-4xl px-4">
        <div className="mb-12 text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/30">
            <Shield className="h-8 w-8 text-white" />
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
              <h2 className="text-2xl font-bold text-foreground">{content.introTitle}</h2>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              {content.introText}
            </p>
          </div>

          <div className="rounded-2xl glass-card p-8 backdrop-blur-xl">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Database className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">
                {content.collectTitle}
              </h2>
            </div>
            <div className="space-y-4 text-muted-foreground">
              <div>
                <h3 className="mb-2 font-semibold text-foreground">
                  {content.collectPersonalTitle}
                </h3>
                <ul className="ml-6 list-disc space-y-1">
                  {content.collectPersonalItems.map(item => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="mb-2 font-semibold text-foreground">
                  {content.collectLearningTitle}
                </h3>
                <ul className="ml-6 list-disc space-y-1">
                  {content.collectLearningItems.map(item => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="mb-2 font-semibold text-foreground">
                  {content.collectTechnicalTitle}
                </h3>
                <ul className="ml-6 list-disc space-y-1">
                  {content.collectTechnicalItems.map(item => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="rounded-2xl glass-card p-8 backdrop-blur-xl">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Eye className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">
                {content.useTitle}
              </h2>
            </div>
            <ul className="ml-6 list-disc space-y-2 text-muted-foreground">
              {content.useItems.map(item => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl glass-card p-8 backdrop-blur-xl">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Lock className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">
                {content.protectTitle}
              </h2>
            </div>
            <div className="space-y-3 text-muted-foreground">
              <p>
                {content.protectIntro}
              </p>
              <ul className="ml-6 list-disc space-y-1">
                {content.protectItems.map(item => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="rounded-2xl glass-card p-8 backdrop-blur-xl">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <UserCheck className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">
                {content.rightsTitle}
              </h2>
            </div>
            <div className="space-y-3 text-muted-foreground">
              <p>{content.rightsIntro}</p>
              <ul className="ml-6 list-disc space-y-1">
                {content.rightsItems.map(item => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <p className="mt-4">
                {content.rightsContact}{' '}
                <a href="mailto:gormachdv@gmail.com" className="text-primary hover:underline">
                  gormachdv@gmail.com
                </a>
              </p>
            </div>
          </div>

          <div className="rounded-2xl glass-card p-8 backdrop-blur-xl">
            <h2 className="mb-4 text-2xl font-bold text-foreground">
              {content.cookiesTitle}
            </h2>
            <div className="space-y-3 text-muted-foreground">
              <p>
                {content.cookiesIntro}
              </p>
              <ul className="ml-6 list-disc space-y-1">
                {content.cookiesItems.map(item => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <p className="mt-4">
                {content.cookiesNote}
              </p>
            </div>
          </div>

          <div className="rounded-2xl glass-card p-8 backdrop-blur-xl">
            <h2 className="mb-4 text-2xl font-bold text-foreground">
              {content.thirdPartyTitle}
            </h2>
            <div className="space-y-3 text-muted-foreground">
              <p>{content.thirdPartyIntro}</p>
              <ul className="ml-6 list-disc space-y-1">
                {content.thirdPartyItems.map(item => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <p className="mt-4">
                {content.thirdPartyNote}
              </p>
            </div>
          </div>

          <div className="rounded-2xl glass-card p-8 backdrop-blur-xl">
            <h2 className="mb-4 text-2xl font-bold text-foreground">
              {content.retentionTitle}
            </h2>
            <p className="text-muted-foreground">
              {content.retentionText}
            </p>
          </div>

          <div className="rounded-2xl glass-card p-8 backdrop-blur-xl">
            <h2 className="mb-4 text-2xl font-bold text-foreground">
              {content.changesTitle}
            </h2>
            <p className="text-muted-foreground">
              {content.changesText}
            </p>
          </div>

          <div className="rounded-2xl glass-card p-8 backdrop-blur-xl">
            <h2 className="mb-4 text-2xl font-bold text-foreground">
              {content.contactsTitle}
            </h2>
            <p className="mb-4 text-muted-foreground">
              {content.contactsIntro}
            </p>
            <div className="space-y-2 text-muted-foreground">
              <p>
                <strong className="text-foreground">{content.emailLabel}</strong>{' '}
                <a href="mailto:gormachdv@gmail.com" className="text-primary hover:underline">
                  gormachdv@gmail.com
                </a>
              </p>
              <p>
                <strong className="text-foreground">{content.telegramLabel}</strong>{' '}
                <a href="https://t.me/iBa1aNCe" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  @iBa1aNCe
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
