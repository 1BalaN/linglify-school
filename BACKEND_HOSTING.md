# 🚀 Хостинг Backend на Railway

## ✅ Что уже настроено

- ✅ Neon (PostgreSQL)
- ✅ Redis
- ✅ Resend (Email)
- ✅ Twilio (SMS)
- ✅ Stripe (Test Mode)
- ✅ Frontend (Vercel)

## 🎯 Что нужно сделать для хостинга backend

### 1. Railway - регистрация и деплой

#### Шаг 1: Регистрация

1. Перейдите: https://railway.app
2. Войдите через GitHub
3. Подтвердите email

#### Шаг 2: Создание проекта

1. **New Project** → **Deploy from GitHub repo**
2. Выберите репозиторий `Linglify`
3. **Root Directory:** оставьте пустым (Railway автоматически найдет backend)

#### Шаг 3: Настройка окружения

Railway автоматически определит Node.js проект.

**Проверьте настройки:**
- **Build Command:** `yarn build`
- **Start Command:** `yarn start`
- **Root Directory:** оставьте пустым или укажите `backend`

#### Шаг 4: Environment Variables

Settings → Variables → **Raw Editor** → вставьте:

```env
# ОБЯЗАТЕЛЬНЫЕ
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://ваш-frontend.vercel.app

# Database (Neon)
DATABASE_URL=postgresql://...ваш_neon_url

# JWT Secrets (те же что в .env)
JWT_ACCESS_SECRET=ваш_секрет_из_локального_env
JWT_REFRESH_SECRET=другой_секрет_из_локального_env
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Email (Resend)
RESEND_API_KEY=re_ваш_ключ
RESEND_FROM_EMAIL=onboarding@resend.dev
RESEND_FROM_NAME=Linglify

# SMS (Twilio)
TWILIO_ACCOUNT_SID=ACваш_sid
TWILIO_AUTH_TOKEN=ваш_token
TWILIO_PHONE_NUMBER=+15005550006

# Redis (если используете)
REDIS_URL=rediss://ваш_upstash_url

# Stripe (Test Mode)
STRIPE_SECRET_KEY=sk_test_ваш_ключ
STRIPE_PUBLISHABLE_KEY=pk_test_ваш_ключ
STRIPE_WEBHOOK_SECRET=whsec_ваш_секрет

# Google OAuth (опционально)
GOOGLE_CLIENT_ID=ваш_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-ваш_секрет
GOOGLE_REDIRECT_URI=https://ваш-backend.railway.app/api/auth/google/callback

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_AUTH_MAX=5
```

**Сохраните** → Railway автоматически задеплоит.

---

### 2. Применение миграций БД

После деплоя нужно применить миграции к production БД:

#### Вариант 1: Через Railway CLI (рекомендуется)

```bash
# Установите Railway CLI
npm i -g @railway/cli

# Войдите
railway login

# Подключитесь к проекту
railway link

# Примените миграции
railway run yarn prisma:migrate:deploy
```

#### Вариант 2: Локально с production БД

```bash
# В backend/.env временно замените DATABASE_URL на Neon
DATABASE_URL="ваш_neon_url" yarn prisma:migrate:deploy
```

#### Вариант 3: Через Railway Dashboard

1. Railway → ваш проект → **Shell**
2. Выполните:
   ```bash
   yarn prisma:migrate:deploy
   ```

---

### 3. Получение URL backend

После деплоя:

1. Railway → Settings → **Networking**
2. **Generate Domain**
3. Скопируйте URL: `https://ваш-проект.railway.app`

---

### 4. Обновление Frontend URL

Обновите переменные в Vercel:

1. Vercel Dashboard → ваш проект → Settings → Environment Variables
2. Обновите:
   ```env
   VITE_API_URL=https://ваш-backend.railway.app/api
   ```
3. Redeploy frontend

---

### 5. Настройка Google OAuth Redirect (если используется)

1. Google Cloud Console → ваш проект
2. **Credentials** → OAuth 2.0 Client IDs
3. **Authorized redirect URIs** → Add:
   ```
   https://ваш-backend.railway.app/api/auth/google/callback
   ```

---

### 6. Настройка Stripe Webhook (если будете использовать)

1. Stripe Dashboard → **Developers** → **Webhooks**
2. **Add endpoint:**
   - URL: `https://ваш-backend.railway.app/api/webhooks/stripe`
   - Events: `checkout.session.completed`, `payment_intent.payment_failed`
3. Скопируйте **Signing secret** (whsec_...)
4. Добавьте в Railway Environment Variables:
   ```env
   STRIPE_WEBHOOK_SECRET=whsec_xxx
   ```

---

## 🧪 Проверка работы

### 1. Health Check

```bash
curl https://ваш-backend.railway.app/health
```

**Ожидается:**
```json
{
  "status": "ok",
  "timestamp": "2026-02-10T12:00:00.000Z"
}
```

### 2. Проверка регистрации

```bash
curl -X POST https://ваш-backend.railway.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123456",
    "firstName": "Test"
  }'
```

**Ожидается:** 201 Created + accessToken

### 3. Проверка email

После регистрации должен прийти реальный email на указанный адрес (через Resend).

---

## 📊 Мониторинг

### Railway Dashboard

1. **Deployments** - история деплоев
2. **Logs** - логи в реальном времени
3. **Metrics** - CPU, Memory, Network
4. **Settings** → **Environment Variables**

### Просмотр логов

```bash
# Через CLI
railway logs

# В реальном времени
railway logs --follow
```

---

## 🐛 Troubleshooting

### Backend не запускается

**Проверьте:**
1. Railway Logs - что пишет в логах?
2. Environment Variables - все ли переменные добавлены?
3. DATABASE_URL - правильный ли connection string?

**Решение:**
```bash
# Просмотрите логи
railway logs

# Частые причины:
# - DATABASE_URL не установлен
# - Prisma не сгенерирован (должен быть postinstall script)
# - Миграции не применены
```

### "Prisma Client не найден"

**Решение:**
В `package.json` должен быть:
```json
{
  "scripts": {
    "postinstall": "prisma generate"
  }
}
```

Railway автоматически запустит после установки зависимостей.

### "Module not found" ошибки

**Решение:**
Убедитесь, что используете относительные импорты (не alias пути):
```typescript
// ✅ Правильно
import { config } from './config/env'
import { prisma } from '../../shared/lib/prisma'

// ❌ Неправильно (не работает в production)
import { config } from '@/config/env'
```

### Frontend не подключается к backend

**Проверьте:**
1. CORS настроен на backend (`config.frontendUrl`)
2. `VITE_API_URL` в Vercel правильный
3. Railway backend запущен (зеленая галочка)

---

## ✅ Чек-лист хостинга

### Railway Setup
- [ ] Зарегистрироваться на Railway
- [ ] Создать проект из GitHub репозитория
- [ ] Добавить все Environment Variables
- [ ] Дождаться успешного деплоя

### Database
- [ ] Применить миграции (`prisma:migrate:deploy`)
- [ ] Проверить подключение к Neon

### Проверка
- [ ] Health check работает
- [ ] Регистрация работает
- [ ] Email приходят (Resend)
- [ ] SMS приходят (Twilio, если настроены)

### Frontend
- [ ] Обновить `VITE_API_URL` в Vercel
- [ ] Redeploy frontend
- [ ] Проверить подключение frontend → backend

### OAuth (если используется)
- [ ] Обновить Google OAuth redirect URI
- [ ] Протестировать вход через Google

### Stripe (если используется)
- [ ] Настроить webhook URL
- [ ] Добавить webhook secret в Railway
- [ ] Протестировать платеж

---

## 📚 Полезные ссылки

- **Railway Docs:** https://docs.railway.app
- **Neon Docs:** https://neon.tech/docs
- **Vercel Docs:** https://vercel.com/docs

---

## 💡 Важные моменты

### JWT Secrets

⚠️ **Критически важно:** Используйте **одинаковые** JWT секреты на локальной разработке и в production!

Иначе токены, созданные на backend, не будут работать.

### CORS

Backend должен знать URL frontend:
```typescript
// backend/src/index.ts
cors({
  origin: config.frontendUrl, // https://ваш-frontend.vercel.app
  credentials: true,
})
```

### Database Connection

Railway предоставляет переменную `DATABASE_URL` автоматически для их PostgreSQL.
Но если используете Neon - добавьте свой URL вручную.

---

## 🎯 После успешного хостинга

У вас будет:
- ✅ Backend: `https://ваш-проект.railway.app`
- ✅ Frontend: `https://ваш-frontend.vercel.app`
- ✅ Database: Neon PostgreSQL
- ✅ Email: Resend
- ✅ SMS: Twilio
- ✅ Payments: Stripe (Test Mode)

**Готово для демонстрации дипломной работы!** 🎓

---

## 🆘 Если что-то не работает

1. **Проверьте логи:** `railway logs --follow`
2. **Проверьте env:** Settings → Variables
3. **Проверьте миграции:** Railway Shell → `yarn prisma:migrate:deploy`
4. **Проверьте health:** `curl https://ваш-backend.railway.app/health`

**Если проблема остается - смотрите логи Railway, там будет точная ошибка!**
