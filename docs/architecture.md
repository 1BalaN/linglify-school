# Архитектура проекта Linglify MVP+

## 📐 Общая архитектура

```
┌─────────────────┐
│   Пользователь  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐      WebSocket
│   Frontend      │◄─────────────┐
│   (Vercel)      │              │
└────────┬────────┘              │
         │ HTTP/REST             │
         ▼                       │
┌─────────────────┐      ┌──────┴──────┐
│   Backend       │      │  Socket.io  │
│   (Railway)     │      │   Server    │
└────────┬────────┘      └─────────────┘
         │
    ┌────┴────┐
    ▼         ▼
┌────────┐ ┌────────┐
│  Neon  │ │Upstash │
│  (DB)  │ │ Redis  │
└────────┘ └────────┘
```

## 🎨 Frontend Architecture

### Feature-Sliced Design

```
frontend/src/
├── app/                    # Инициализация приложения
│   ├── store/             # Redux store
│   │   ├── index.ts       # Store конфигурация
│   │   └── api.ts         # RTK Query базовый API
│   ├── styles/            # Глобальные стили
│   └── App.tsx            # Корневой компонент
│
├── pages/                 # Страницы приложения
│   ├── home/
│   ├── course/
│   ├── placement-test/
│   └── profile/
│
├── widgets/               # Композиции фич
│   ├── header/
│   ├── footer/
│   └── chat/
│
├── features/              # Бизнес-логика
│   ├── auth/
│   │   ├── ui/           # UI компоненты
│   │   ├── model/        # State, actions
│   │   └── api/          # API queries
│   ├── course-catalog/
│   └── lesson-player/
│
├── entities/              # Бизнес-сущности
│   ├── user/
│   ├── course/
│   └── lesson/
│
└── shared/               # Переиспользуемый код
    ├── ui/               # UI компоненты
    ├── lib/              # Утилиты
    ├── api/              # API клиенты
    └── types/            # Общие типы
```

### State Management

**Redux Toolkit + RTK Query:**

```typescript
// Slices
- auth: аутентификация
- user: профиль пользователя
- courses: каталог курсов
- placementTest: тест на уровень
- chat: чат поддержки
- notifications: уведомления
- ui: UI состояние (модалки, сайдбары)

// RTK Query APIs
- authApi: регистрация, логин, OAuth
- courseApi: курсы, уроки
- userApi: профиль, прогресс
- chatApi: сообщения
```

### Routing

```
/                           # Главная
/placement-test             # Тест на уровень
/courses                    # Каталог курсов
/courses/:id                # Страница курса
/courses/:id/lessons/:lid   # Урок
/profile                    # Профиль
/profile/courses            # Мои курсы
/profile/progress           # Прогресс
/profile/certificates       # Сертификаты
/auth/login                 # Вход
/auth/register              # Регистрация
/chat                       # Чат поддержки
```

## 🔧 Backend Architecture

### Модульная структура

```
backend/src/
├── modules/               # Бизнес-модули
│   ├── auth/
│   │   ├── auth.router.ts
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── auth.schema.ts
│   │   └── auth.middleware.ts
│   ├── user/
│   ├── course/
│   ├── lesson/
│   ├── placement/
│   ├── payment/
│   ├── chat/
│   ├── notification/
│   └── analytics/
│
├── shared/               # Общий код
│   ├── middleware/       # Express middleware
│   ├── lib/             # Утилиты
│   ├── types/           # Общие типы
│   └── constants/       # Константы
│
└── config/              # Конфигурация
    ├── env.ts           # Env переменные
    ├── database.ts      # DB конфигурация
    └── redis.ts         # Redis конфигурация
```

### Request Flow

```
HTTP Request
    ↓
Express Router
    ↓
Middleware Chain:
  1. CORS
  2. Helmet (Security)
  3. Body Parser
  4. Cookie Parser
  5. Rate Limiter
  6. Auth (JWT)
  7. Validation (Zod)
    ↓
Controller
    ↓
Service (Business Logic)
    ↓
Prisma (Database)
    ↓
Response
```

### WebSocket Events

```typescript
// Server → Client
- message:new
- chat:typing
- notification:new
- course:updated
- lesson:progress

// Client → Server
- message:send
- chat:join
- chat:leave
- typing:start
- typing:stop
```

## 🗄️ Database Schema

### Основные модели

```prisma
User
  - id, email, password, role
  - isVerified, phoneVerified
  - createdAt, updatedAt
  → Profile (1:1)
  → EnrolledCourses (1:N)
  → Progress (1:N)
  → Messages (1:N)

Course
  - id, title, description
  - level, price, published
  - teacherId
  → Lessons (1:N)
  → Enrollments (1:N)
  → Reviews (1:N)

Lesson
  - id, courseId, title
  - content, order, duration
  → LessonProgress (1:N)
  → Tests (1:N)

Progress
  - userId, lessonId, courseId
  - completed, score
  - startedAt, completedAt

Certificate
  - userId, courseId
  - issuedAt, verificationCode
```

## 🔐 Security Architecture

### Authentication Flow

```
1. User → POST /api/auth/register
   ↓
2. Backend: Hash password (bcrypt)
   ↓
3. Backend: Save to DB
   ↓
4. Backend: Send verification email
   ↓
5. User → Click link → GET /api/auth/verify/:token
   ↓
6. Backend: Verify token → Set isVerified=true
   ↓
7. User → POST /api/auth/login
   ↓
8. Backend: Verify password
   ↓
9. Backend: Generate JWT (access + refresh)
   ↓
10. Response: 
    - accessToken (httpOnly cookie, 15min)
    - refreshToken (httpOnly cookie, 7d)
```

### Authorization

```typescript
Roles:
- GUEST: публичные endpoints
- STUDENT: купленные курсы
- TEACHER: создание курсов
- ADMIN: управление платформой

Middleware:
- requireAuth: проверка JWT
- requireRole(role): проверка роли
- requireOwnership: проверка владельца ресурса
```

## 📊 Data Flow

### Пример: Прохождение урока

```
1. Frontend: useGetLessonQuery(lessonId)
   ↓
2. RTK Query → GET /api/lessons/:id
   ↓
3. Backend: lessonController.getLesson()
   ↓
4. lessonService.getLesson()
   ↓
5. Prisma: lesson.findUnique()
   ↓
6. Check: user enrolled in course?
   ↓
7. Check: previous lessons completed?
   ↓
8. Response: lesson data
   ↓
9. Frontend: render lesson
   ↓
10. User completes lesson
    ↓
11. Frontend: useCompleteLesson mutation
    ↓
12. POST /api/lessons/:id/complete
    ↓
13. Backend: progressService.markComplete()
    ↓
14. Update Progress in DB
    ↓
15. Check: course completed?
    ↓
16. If yes: generate certificate
    ↓
17. Response: { completed: true, certificate }
```

## 🚀 Performance Optimizations

### Frontend

1. **Code Splitting:**
   - Lazy loading routes
   - Dynamic imports для тяжелых компонентов

2. **State Management:**
   - RTK Query кэширование (5min TTL)
   - Optimistic updates
   - Automatic refetching

3. **Bundle Optimization:**
   - Tree shaking
   - Минификация
   - Compression (gzip/brotli)

### Backend

1. **Caching:**
   - Redis для сессий (15min)
   - Redis для frequently accessed data
   - HTTP cache headers

2. **Database:**
   - Indexes на frequently queried fields
   - Connection pooling (Prisma)
   - Pagination для списков

3. **API:**
   - Rate limiting (100 req/15min)
   - Compression middleware
   - Response caching

## 🔄 Real-time Architecture

### Socket.io Setup

```typescript
// Rooms
- user:{userId}           # Личные уведомления
- course:{courseId}       # Обновления курса
- chat:support            # Общая поддержка
- chat:teacher:{userId}   # Чат с преподавателем

// Events
On connect:
  - Authenticate user
  - Join personal room
  - Join enrolled courses rooms

On message:
  - Validate permissions
  - Save to DB
  - Broadcast to room
  - Send notification

On disconnect:
  - Leave all rooms
  - Update online status
```

## 📱 API Design

### REST Conventions

```
GET    /api/courses           # Список
GET    /api/courses/:id       # Один курс
POST   /api/courses           # Создать
PATCH  /api/courses/:id       # Обновить
DELETE /api/courses/:id       # Удалить

# Nested resources
GET    /api/courses/:id/lessons
POST   /api/courses/:id/enroll
POST   /api/lessons/:id/complete
```

### Response Format

```typescript
// Success
{
  data: T
}

// Error
{
  error: {
    code: string,
    message: string,
    details?: unknown
  }
}
```

## 🧪 Testing Strategy

```
Frontend:
- Unit: Vitest
- Integration: React Testing Library
- E2E: Playwright

Backend:
- Unit: Jest
- Integration: Supertest
- E2E: Postman/Newman
```

## 📈 Scaling Considerations

### Текущая архитектура (MVP)

- Single instance backend
- Managed PostgreSQL (Neon)
- Managed Redis (Upstash)
- Serverless frontend (Vercel)

### Будущее расширение

- Горизонтальное масштабирование backend (Railway autoscaling)
- CDN для статики и медиа
- Read replicas для БД
- Message queue для фоновых задач
- Microservices для независимых модулей

---

Эта архитектура обеспечивает:
- ✅ Масштабируемость
- ✅ Maintainability
- ✅ Security
- ✅ Performance
- ✅ Developer Experience
