import { Shield, Lock, Eye, Database, UserCheck, FileText } from 'lucide-react'

export const PrivacyPage = () => {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-primary/5 via-background to-secondary/5 py-12">
      <div className="container mx-auto max-w-4xl px-4">
        <div className="mb-12 text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/30">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <h1 className="mb-4 text-4xl font-bold text-gradient">
            Политика конфиденциальности
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
              <h2 className="text-2xl font-bold text-foreground">Введение</h2>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              Образовательная платформа Linglify (далее — «Платформа», «мы», «нас») серьёзно относится к защите вашей конфиденциальности. 
              Настоящая Политика конфиденциальности описывает, какую информацию мы собираем, как её используем и защищаем при использовании 
              вами нашей платформы. Используя Linglify, вы соглашаетесь с условиями, описанными в данной Политике.
            </p>
          </div>

          <div className="rounded-2xl glass-card p-8 backdrop-blur-xl">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Database className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">
                Какую информацию мы собираем
              </h2>
            </div>
            <div className="space-y-4 text-muted-foreground">
              <div>
                <h3 className="mb-2 font-semibold text-foreground">
                  1. Персональные данные
                </h3>
                <ul className="ml-6 list-disc space-y-1">
                  <li>Имя и фамилия</li>
                  <li>Адрес электронной почты</li>
                  <li>Номер телефона (опционально)</li>
                  <li>Дата рождения (опционально)</li>
                  <li>Фотография профиля (опционально)</li>
                  <li>Информация из профиля Google (при OAuth авторизации)</li>
                </ul>
              </div>
              <div>
                <h3 className="mb-2 font-semibold text-foreground">
                  2. Данные об обучении
                </h3>
                <ul className="ml-6 list-disc space-y-1">
                  <li>Прогресс прохождения курсов и уроков</li>
                  <li>Результаты тестов и упражнений</li>
                  <li>Время, проведённое на платформе</li>
                  <li>Предпочитаемые языки для изучения</li>
                  <li>Записи произношения (для проверки речи)</li>
                </ul>
              </div>
              <div>
                <h3 className="mb-2 font-semibold text-foreground">
                  3. Технические данные
                </h3>
                <ul className="ml-6 list-disc space-y-1">
                  <li>IP-адрес</li>
                  <li>Тип браузера и его версия</li>
                  <li>Операционная система</li>
                  <li>Данные cookies и локального хранилища</li>
                  <li>Информация об устройстве (разрешение экрана, язык системы)</li>
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
                Как мы используем информацию
              </h2>
            </div>
            <ul className="ml-6 list-disc space-y-2 text-muted-foreground">
              <li>Предоставление и улучшение образовательных услуг</li>
              <li>Персонализация обучения и рекомендации курсов</li>
              <li>Аутентификация и управление учётной записью</li>
              <li>Отправка уведомлений об обновлениях и прогрессе</li>
              <li>Обработка платежей и управление подписками</li>
              <li>Анализ использования платформы и улучшение функциональности</li>
              <li>Техническая поддержка и ответы на запросы</li>
              <li>Предотвращение мошенничества и обеспечение безопасности</li>
              <li>Соблюдение законодательства и правовых обязательств</li>
            </ul>
          </div>

          <div className="rounded-2xl glass-card p-8 backdrop-blur-xl">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Lock className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">
                Защита данных
              </h2>
            </div>
            <div className="space-y-3 text-muted-foreground">
              <p>
                Мы применяем современные технологии для защиты ваших данных:
              </p>
              <ul className="ml-6 list-disc space-y-1">
                <li>Шифрование данных при передаче (SSL/TLS)</li>
                <li>Хеширование паролей с использованием bcrypt</li>
                <li>Защищённое хранение в базе данных PostgreSQL</li>
                <li>Регулярное резервное копирование</li>
                <li>Ограничение доступа к персональным данным</li>
                <li>Двухфакторная аутентификация (опционально)</li>
                <li>Мониторинг безопасности и логирование</li>
              </ul>
            </div>
          </div>

          <div className="rounded-2xl glass-card p-8 backdrop-blur-xl">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <UserCheck className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">
                Ваши права
              </h2>
            </div>
            <div className="space-y-3 text-muted-foreground">
              <p>В соответствии с законодательством о защите данных, вы имеете право:</p>
              <ul className="ml-6 list-disc space-y-1">
                <li><strong className="text-foreground">Доступ:</strong> запросить копию ваших данных</li>
                <li><strong className="text-foreground">Исправление:</strong> обновить или исправить неточную информацию</li>
                <li><strong className="text-foreground">Удаление:</strong> запросить удаление вашей учётной записи и данных</li>
                <li><strong className="text-foreground">Ограничение обработки:</strong> попросить временно прекратить обработку данных</li>
                <li><strong className="text-foreground">Портируемость:</strong> получить данные в структурированном формате</li>
                <li><strong className="text-foreground">Отзыв согласия:</strong> в любой момент отозвать согласие на обработку</li>
                <li><strong className="text-foreground">Возражение:</strong> возразить против определённых видов обработки</li>
              </ul>
              <p className="mt-4">
                Для реализации этих прав свяжитесь с нами по адресу{' '}
                <a href="mailto:gormachdv@gmail.com" className="text-primary hover:underline">
                  gormachdv@gmail.com
                </a>
              </p>
            </div>
          </div>

          <div className="rounded-2xl glass-card p-8 backdrop-blur-xl">
            <h2 className="mb-4 text-2xl font-bold text-foreground">
              Cookies и аналитика
            </h2>
            <div className="space-y-3 text-muted-foreground">
              <p>
                Мы используем cookies для улучшения работы платформы. Cookies делятся на:
              </p>
              <ul className="ml-6 list-disc space-y-1">
                <li><strong className="text-foreground">Необходимые:</strong> для аутентификации и базовой функциональности</li>
                <li><strong className="text-foreground">Функциональные:</strong> для запоминания настроек и предпочтений</li>
                <li><strong className="text-foreground">Аналитические:</strong> для анализа использования (Google Analytics)</li>
              </ul>
              <p className="mt-4">
                Вы можете управлять cookies через настройки браузера, но отключение некоторых cookies 
                может ограничить функциональность платформы.
              </p>
            </div>
          </div>

          <div className="rounded-2xl glass-card p-8 backdrop-blur-xl">
            <h2 className="mb-4 text-2xl font-bold text-foreground">
              Передача данных третьим лицам
            </h2>
            <div className="space-y-3 text-muted-foreground">
              <p>Мы можем передавать данные следующим третьим лицам:</p>
              <ul className="ml-6 list-disc space-y-1">
                <li><strong className="text-foreground">Сервисы хостинга:</strong> Vercel, Railway (хранение данных)</li>
                <li><strong className="text-foreground">Аутентификация:</strong> Google OAuth</li>
                <li><strong className="text-foreground">Платёжные системы:</strong> Stripe (обработка платежей)</li>
                <li><strong className="text-foreground">Email-сервисы:</strong> для отправки уведомлений</li>
                <li><strong className="text-foreground">SMS-сервисы:</strong> Twilio (подтверждение телефона)</li>
                <li><strong className="text-foreground">Аналитика:</strong> Google Analytics</li>
              </ul>
              <p className="mt-4">
                Все партнёры соблюдают стандарты конфиденциальности и используют данные только 
                для предоставления услуг Linglify.
              </p>
            </div>
          </div>

          <div className="rounded-2xl glass-card p-8 backdrop-blur-xl">
            <h2 className="mb-4 text-2xl font-bold text-foreground">
              Хранение данных
            </h2>
            <p className="text-muted-foreground">
              Мы храним ваши данные в течение всего времени существования вашей учётной записи. 
              После удаления аккаунта персональные данные удаляются в течение 30 дней, за исключением 
              информации, которую мы обязаны хранить по законодательству (например, данные о транзакциях).
            </p>
          </div>

          <div className="rounded-2xl glass-card p-8 backdrop-blur-xl">
            <h2 className="mb-4 text-2xl font-bold text-foreground">
              Изменения в Политике
            </h2>
            <p className="text-muted-foreground">
              Мы можем обновлять эту Политику конфиденциальности. О существенных изменениях мы уведомим 
              вас по электронной почте или через уведомление на платформе. Рекомендуем периодически 
              проверять эту страницу на наличие обновлений.
            </p>
          </div>

          <div className="rounded-2xl glass-card p-8 backdrop-blur-xl">
            <h2 className="mb-4 text-2xl font-bold text-foreground">
              Контакты
            </h2>
            <p className="mb-4 text-muted-foreground">
              Если у вас есть вопросы по Политике конфиденциальности или вы хотите реализовать свои права, 
              свяжитесь с нами:
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
        </div>
      </div>
    </div>
  )
}
