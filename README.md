# Linglify — платформа онлайн-обучения иностранным языкам

Дипломный проект. Fullstack образовательная платформа с полным циклом: от placement-теста до выдачи PDF-сертификата.

---

## Технологический стек

### Backend
- **Runtime:** Node.js 20 + TypeScript (strict)
- **Framework:** Express.js (модульная архитектура)
- **База данных:** PostgreSQL — Neon (production) / локальный PG (dev)
- **ORM:** Prisma
- **Кэш:** Redis — Upstash (production)
- **Auth:** JWT (access 15min / refresh 7d) + Google OAuth 2.0
- **Real-time:** Socket.io (WebSocket, JWT-аутентификация на подключении)
- **Валидация:** Zod
- **Email:** Nodemailer (Gmail SMTP)
- **SMS:** Twilio
- **Файлы:** Multer + Cloudinary
- **Платежи:** Stripe (test mode)

### Frontend
- **Framework:** React 18 + TypeScript (strict)
- **Сборка:** Vite
- **Архитектура:** Feature-Sliced Design (FSD)
- **State:** Redux Toolkit + RTK Query
- **Routing:** React Router v6
- **UI/Стили:** Tailwind CSS + ShadcnUI
- **Чарты:** Recharts
- **Формы:** React Hook Form + Zod
- **WebSocket:** socket.io-client
- **Аудио:** react-h5-audio-player

### Инфраструктура
- **Frontend:** Vercel
- **Backend:** Railway
- **БД:** Neon (PostgreSQL)
- **Кэш:** Upstash Redis
- **Файлы:** Cloudinary
- **CI/CD:** GitHub Actions

---

## Быстрый старт

### Требования
- Node.js 20+
- PostgreSQL 14+
- Redis (опционально для локальной разработки)
- Yarn

### Установка

```bash
# 1. Клонировать репозиторий
git clone <repository-url>
cd Linglify

# 2. Установить зависимости
yarn install

# 3. Настроить переменные окружения
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# 4. Применить миграции Prisma
cd backend
yarn prisma:generate
yarn prisma:migrate

# 5. Запустить оба сервиса
cd ..
yarn dev
```

- Frontend: http://localhost:3000
- Backend: http://localhost:5000

---

## Переменные окружения (backend)

| Переменная | Описание |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `REDIS_URL` | Redis/Upstash URL |
| `JWT_ACCESS_SECRET` | Секрет для access-токена |
| `JWT_REFRESH_SECRET` | Секрет для refresh-токена |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Google OAuth |
| `CLOUDINARY_CLOUD_NAME` / `API_KEY` / `API_SECRET` | Cloudinary |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` | Email |
| `TWILIO_ACCOUNT_SID` / `TWILIO_AUTH_TOKEN` / `TWILIO_PHONE` | SMS |
| `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` | Платежи |
| `CLIENT_URL` | URL фронтенда (CORS, OAuth redirect) |

---

## Структура проекта

```
Linglify/
├── frontend/                    # React-приложение (FSD)
│   └── src/
│       ├── app/                 # Провайдеры, роутер, store
│       ├── pages/               # Страницы (38 шт.)
│       ├── widgets/             # Header, Footer
│       ├── features/            # Фичи по доменам
│       ├── entities/            # RTK Query API-слои
│       └── shared/              # UI, хелперы, типы
├── backend/                     # Express API
│   ├── src/
│   │   ├── modules/             # 14 бизнес-модулей
│   │   │   ├── auth/
│   │   │   ├── user/
│   │   │   ├── course/
│   │   │   ├── lesson/
│   │   │   ├── placement/
│   │   │   ├── certificate/
│   │   │   ├── chat/
│   │   │   ├── analytics/
│   │   │   ├── settings/
│   │   │   ├── payment/
│   │   │   ├── upload/
│   │   │   ├── question/
│   │   │   ├── faq/
│   │   │   └── contact/
│   │   └── shared/              # AppError, middlewares, socket
│   └── prisma/                  # Схема и миграции
└── docs/                        # Документация
```

---

## Команды

### Root
```bash
yarn dev          # Frontend + Backend одновременно
yarn build        # Сборка обоих проектов
yarn lint         # ESLint
yarn format       # Prettier
yarn typecheck    # TypeScript проверка
```

### Backend
```bash
cd backend
yarn dev              # Dev-сервер с hot-reload
yarn build            # Компиляция TypeScript
yarn start            # Production-сервер
yarn prisma:generate  # Генерация Prisma Client
yarn prisma:migrate   # Применение миграций
yarn prisma:studio    # Prisma Studio GUI
```

### Frontend
```bash
cd frontend
yarn dev          # Vite dev-сервер
yarn build        # Production-сборка
yarn preview      # Предпросмотр production
yarn lint         # ESLint
yarn typecheck    # TypeScript проверка
```

---

## Реализованный функционал

### Аутентификация и профиль
- Email + пароль, JWT access/refresh токены
- Google OAuth 2.0
- Email-подтверждение аккаунта (Nodemailer)
- SMS-подтверждение телефона (Twilio)
- Восстановление пароля (email-ссылка)
- Rate limiting, bcrypt (12 rounds), OWASP-защита
- Управление профилем: аватар, биография, контакты
- Поле `preferredLanguage` — автовыбор языка в placement-тесте
- Поле `targetLanguages` — автопополнение при записи на курс

### Каталог и курсы
- Каталог с фильтрацией (язык, уровень, категория, цена, рейтинг) и сортировкой
- Поиск по названию/описанию курса
- Пагинация (12 курсов/страница)
- Детальная страница курса: программа, преподаватель, отзывы, демо-урок
- Отзывы с рейтингом (только для студентов; рейтинги admin/teacher не учитываются в среднем)
- Запись на курс, Stripe-оплата (test mode)

### Система уроков (5 типов)
- **Видеоуроки** — YouTube/Vimeo embed + прямые MP4, прикреплённые методички (PDF/DOC)
- **Тесты** — multiple choice, объяснения к ответам, повтор только неверных вопросов
- **Интерактивы** — fill-in-the-blank с разметкой `[слово]`, подсказки, повтор ошибок
- **Лексические тренажёры** — карточки соответствий (drag/click), перемешанные столбцы, повтор
- **Диалоговые уроки** — пошаговый сценарий реплик с разбором ответов

### Прогресс и сертификаты
- Отслеживание прогресса по урокам и курсу в процентах
- Последовательный доступ к урокам
- Результаты тестов/диалогов сохраняются — повторный просмотр без переигрывания
- PDF-сертификат с QR-кодом и уникальным кодом верификации
- Политика выдачи управляется через настройки платформы (`requireFinalTestForCertificate`, `minProgressForCertificate`)

### Placement-тест
- Банк вопросов с типами: Multiple Choice, Fill in the Blank, Listening (аудиофайл)
- 25 вопросов, рандомная выборка из банка
- Определение уровня CEFR (A1–C2) по результату
- Рекомендации курсов по уровню (маппинг настраивается в платформе)
- Сохранение результата — при возврате показывается итоговый экран без повтора
- Управление банком вопросов — страница `/admin/placement`
- Параметры теста настраиваются через `/admin/settings` (кол-во вопросов, языки, маппинг уровней)

### Создание и модерация курсов
- Учитель создаёт курс с баннером (URL или загрузка файла), описанием, уровнем, категорией
- Модульная структура: модули → уроки, drag-and-drop сортировка
- Workflow статусов: DRAFT → PENDING_REVIEW → PUBLISHED / REJECTED → ARCHIVED → PUBLISHED
- Модератор (admin) оставляет комментарии к отклонению прямо в интерфейсе
- Архивирование опубликованных курсов и восстановление из архива
- Пагинация "Мои курсы" (10 курсов/страница, только курсы текущего преподавателя)

### Аналитика
- **Для администратора** (`/admin/analytics`): общая статистика пользователей (Student/Teacher/Admin), активность по дням, топ курсов по вовлечённости и рейтингу (все курсы, сортировка best→worst), курсы с низким рейтингом (порог настраивается), топ языков по зачислениям, новые пользователи
- **Для преподавателя** (`/courses/:id/analytics`): зачисления по времени, активность студентов за 30 дней, распределение прогресса, список зачисленных студентов с деталями
- Фильтр периода (7/30/90 дней) с синхронизацией в URL через `useSearchParams`
- Тема-зависимые подписи осей (белые в тёмной теме, чёрные в светлой)
- Кастомные Tooltip с фиксированными цветами

### Настройки платформы (`/admin/settings`)
- **Политика сертификатов**: требовать финальный тест, минимальный прогресс
- **Пороги аналитики**: порог низкого рейтинга, минимум зачислений для рейтинга
- **Параметры placement-теста**: количество вопросов, разрешённые языки, маппинг уровней CEFR
- Уведомления об успехе/ошибке сохранения

### Управление пользователями (`/admin/users`)
- Таблица с фильтрами: роль, статус (активен/заморожен), поиск по email/ФИО
- Сегменты: Новые / Активные / Рисковые / Выпускники
- Бейджи ролей (Admin/Teacher/Student), индикатор `>30 дн.` неактивности
- Модальная карточка пользователя: мини-аналитика курсов, прогресс, результат placement-теста, сертификаты
- Действия: смена роли (Student ↔ Teacher), заморозка с причиной, активация, удаление
- При удалении учителя — его курсы переназначаются первому доступному admin
- Причина заморозки видна и пользователю (при логине), и администратору (в карточке)
- CSV-экспорт текущего сегмента (UTF-8 BOM, разделитель `;`, корректная кириллица)
- Клиентская пагинация (15 записей/страница)

### Чат (WebSocket, Socket.io)
- **COURSE_DM**: диалог студент ↔ преподаватель по каждому курсу
- **SUPPORT**: личный тикет пользователь ↔ поддержка (администратор)
- Сообщения типов USER и SYSTEM
- Системные авто-сообщения: при зачислении на курс, при архивировании курса, при выдаче сертификата
- Вложения: файлы (PDF, DOC, DOCX, TXT) и изображения (JPEG, PNG, WebP), вставка из буфера Ctrl+V
- Прокси для скачивания с сохранением оригинального имени файла
- Флаги непрочитанных сообщений + зелёный бейдж в Header
- Мини-аватарки участников в списке диалогов (реальное фото или инициалы)
- Real-time через Socket.io (JWT-аутентификация, комнаты `user:<id>` и `thread:<id>`)
- Скролл списка диалогов и окна сообщений кастомизирован под платформу

### UX и UI
- Тёмная/светлая тема без мерцания (Tailwind + CSS переменные)
- Адаптивная вёрстка (desktop + mobile)
- AppErrorBoundary с fallback-экраном
- Custom scroll (`scroll-soft`) по всему приложению
- Кастомные стрелки в `<select>` элементах
- Фиксированная высота заголовков карточек курсов (нет прыжков кнопок)
- Страница `/pricing` заменена на `/become-teacher` — лендинг для потенциальных преподавателей

---

## Архитектура

### Frontend — Feature-Sliced Design (FSD)
```
shared   → ui-компоненты, хелперы, типы, хуки
entities → RTK Query API-слои (course, user, chat, placement, ...)
features → бизнес-логика по доменам (auth, courses/teacher, chat, admin/...)
widgets  → Header, Footer
pages    → страницы, оркестрируют features и entities
app      → store, router, провайдеры (ThemeProvider, SocketProvider)
```

### Backend — модульная архитектура
```
module/
  *.controller.ts  — обработчики HTTP-запросов
  *.service.ts     — бизнес-логика
  *.router.ts      — Express-маршруты
  *.schema.ts      — Zod-схемы валидации
```

---

## Документация

| Файл | Описание |
|---|---|
| `docs/tech-spec.md` | Техническое задание |
| `docs/THIRD_PARTY_SERVICES.md` | Настройка сторонних сервисов |
| `docs/RAILWAY_SMTP_SETUP.md` | SMTP на Railway |
| `docs/OAUTH_QUICK_FIX.md` | Решение проблем с Google OAuth |
| `docs/VERCEL_SPA_SETUP.md` | SPA-роутинг на Vercel |
| `backend/API_REFERENCE.md` | Справка по REST API |
| `backend/MIGRATION_GUIDE.md` | Гайд по миграциям БД |
| `.cursor/rules/AGENTS.md` | Правила кодирования |

---

## Code Style

- Строгий TypeScript (`strict: true`), запрет `any`
- ESLint + Prettier (single quotes, no semicolons, 2 spaces, trailing commas ES5)
- Path aliases (`@/...`) вместо относительных импортов
- Все формы валидируются через Zod (фронт + бэк)
- FSD-слои не импортируют "вниз" по иерархии

## Git Workflow

- `main` — production
- `develop` — основная разработка
- `feature/<name>` — feature branches
- `hotfix/<name>` — срочные фиксы

---

**Статус:** В активной разработке  
**Период:** 10.02.2026 — 15.05.2026
