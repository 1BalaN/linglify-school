# Linglify MVP+ 🌍

Платформа для онлайн-обучения иностранным языкам. Дипломный проект.

## 📋 Описание

Linglify - это образовательная платформа, которая охватывает полный цикл обучения: от определения уровня языка через placement test до получения сертификата об окончании курса.

## 🛠️ Технологический стек

### Backend
- **Runtime**: Node.js + TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL (Prisma ORM)
- **Cache**: Redis
- **Auth**: JWT + OAuth 2.0
- **Real-time**: Socket.io
- **Validation**: Zod

### Frontend
- **Framework**: React 18 + TypeScript
- **Build**: Vite
- **State**: Redux Toolkit + RTK Query
- **Routing**: React Router
- **UI**: Tailwind CSS + ShadcnUI
- **Forms**: React Hook Form + Zod
- **Charts**: Recharts

### Инфраструктура
- **Frontend**: Vercel
- **Backend**: Railway
- **Database**: Neon (PostgreSQL)
- **Cache**: Upstash Redis
- **CI/CD**: GitHub Actions

## 🚀 Быстрый старт

### Требования
- Node.js 20+
- PostgreSQL 14+
- Redis (опционально для локальной разработки)
- Yarn

### Установка

1. Клонируйте репозиторий:
```bash
git clone <repository-url>
cd Linglify
```

2. Установите зависимости:
```bash
yarn install
```

3. Настройте переменные окружения:
```bash
# Backend
cp backend/.env.example backend/.env
# Заполните необходимые переменные

# Frontend
cp frontend/.env.example frontend/.env
# Заполните необходимые переменные
```

4. Запустите базу данных и примените миграции:
```bash
cd backend
yarn prisma:generate
yarn prisma:migrate
```

5. Сгенерируйте JWT секреты и добавьте в `backend/.env`:
```bash
# Генерация (Node.js)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

6. Запустите проект:
```bash
cd ..
yarn dev
```

- Frontend: http://localhost:3000
- Backend: http://localhost:5000

### 🧪 Тестирование

Читайте: **[TESTING_GUIDE.md](./TESTING_GUIDE.md)**

Импортируйте Postman коллекцию:
```
backend/postman/Linglify-Auth-Complete.postman_collection.json
```

## 📁 Структура проекта

```
Linglify/
├── frontend/               # React приложение
│   ├── src/
│   │   ├── app/           # Конфигурация приложения
│   │   ├── pages/         # Страницы (FSD)
│   │   ├── widgets/       # Виджеты (FSD)
│   │   ├── features/      # Фичи (FSD)
│   │   ├── entities/      # Сущности (FSD)
│   │   └── shared/        # Общий код (FSD)
│   └── ...
├── backend/               # Express API
│   ├── src/
│   │   ├── modules/       # Модули (auth, course, etc.)
│   │   ├── shared/        # Общий код
│   │   └── config/        # Конфигурация
│   └── prisma/            # Database schema
└── ...
```

## 📝 Доступные команды

### Root
```bash
yarn dev          # Запуск frontend и backend
yarn build        # Сборка проектов
yarn lint         # Проверка кода
yarn format       # Форматирование кода
yarn typecheck    # Проверка типов
```

### Frontend
```bash
cd frontend
yarn dev          # Запуск dev сервера
yarn build        # Сборка production
yarn preview      # Просмотр production сборки
yarn lint         # ESLint проверка
yarn typecheck    # TypeScript проверка
```

### Backend
```bash
cd backend
yarn dev              # Запуск dev сервера с hot-reload
yarn build            # Компиляция TypeScript
yarn start            # Запуск production сервера
yarn lint             # ESLint проверка
yarn typecheck        # TypeScript проверка
yarn prisma:generate  # Генерация Prisma Client
yarn prisma:migrate   # Применение миграций
yarn prisma:studio    # Prisma Studio GUI
```

## 🔧 Конфигурация

### ESLint
- Строгая проверка TypeScript
- Правила для React Hooks
- Запрет использования `any`

### Prettier
- Single quotes
- No semicolons
- 2 spaces indentation
- Trailing commas (ES5)

### TypeScript
- Strict mode
- Path aliases (@/...)
- No unused variables/parameters

## 🏗️ Архитектура

### Frontend: Feature-Sliced Design
Используется методология FSD для организации кода:
- **app** - инициализация приложения
- **pages** - страницы приложения
- **widgets** - композиция features
- **features** - бизнес-логика
- **entities** - бизнес-сущности
- **shared** - переиспользуемый код

### Backend: Модульная архитектура
Каждый модуль содержит:
- `*.controller.ts` - обработчики запросов
- `*.service.ts` - бизнес-логика
- `*.router.ts` - маршруты
- `*.schema.ts` - Zod схемы валидации

## ✨ Реализовано

### ✅ Авторизация (100% готово)
- **15 API endpoints** (8 public + 2 OAuth + 5 protected)
- Регистрация с email/password
- JWT токены (access 15min + refresh 7days)
- Email подтверждение (Resend интеграция)
- SMS верификация (Twilio интеграция)
- Восстановление пароля
- Google OAuth 2.0
- Управление профилем
- Rate limiting & Security (bcrypt 12 rounds)

## 📖 Документация

### 🚀 Быстрый старт
- **[README.md](./README.md)** - Этот файл (обзор проекта)
- **[GIT_CHECKLIST.md](./GIT_CHECKLIST.md)** - ✅ Чеклист перед Git push
- **[BACKEND_HOSTING.md](./BACKEND_HOSTING.md)** - Хостинг backend на Railway

### 🔧 Настройка сервисов
- **[docs/THIRD_PARTY_SERVICES.md](./docs/THIRD_PARTY_SERVICES.md)** - Resend, Twilio, Google OAuth
- **[docs/STRIPE_TEST_MODE.md](./docs/STRIPE_TEST_MODE.md)** - 🎓 Stripe для дипломной (тестовый режим)

### 📚 Для разработчиков
- **[backend/API_REFERENCE.md](./backend/API_REFERENCE.md)** - Справка по API
- **[backend/MIGRATION_GUIDE.md](./backend/MIGRATION_GUIDE.md)** - Миграции БД
- **[docs/architecture.md](./docs/architecture.md)** - Архитектура приложения
- **[docs/tech-spec.md](./docs/tech-spec.md)** - Техническое задание

## 👨‍💻 Разработка

### Code Style
- Следуйте правилам в `.cursor/rules/AGENTS.md`
- Используйте path aliases вместо относительных импортов
- Все формы валидируются через Zod
- API типы должны быть общими между frontend и backend

### Git Workflow
- `main` - production
- `develop` - разработка
- Feature branches: `feature/название`
- Hotfix branches: `hotfix/название`

## 📄 Лицензия

Дипломный проект. Все права защищены.

## 👤 Автор

Студент дипломного проекта

---

**Статус проекта**: В разработке 🚧

**Дата начала**: 10.02.2026  
**Планируемая дата завершения**: 15.05.2026

---

## 🎯 Roadmap

- [x] **Phase 1**: Базовая настройка проекта
- [x] **Phase 2**: Полная система авторизации (15 endpoints)
- [ ] **Phase 3**: Курсы и уроки
- [ ] **Phase 4**: Тесты и прогресс
- [ ] **Phase 5**: Платежи и сертификаты
- [ ] **Phase 6**: Production деплой
