# 🔌 Настройка сторонних сервисов

## 📋 Обзор

Для работы Linglify нужны следующие сервисы:

| Сервис | Цель | FREE Plan | Статус |
|--------|------|-----------|--------|
| **Neon** | PostgreSQL БД | ✅ 500 MB | ✅ Настроен |
| **Resend** | Email рассылка | ✅ 3,000/месяц | ✅ Настроен |
| **Twilio** | SMS верификация | ✅ $15.50 trial | ✅ Настроен |
| **Stripe** | Платежи (test) | ✅ Test mode | ⚠️ Нужна настройка |
| **Google OAuth** | Вход через Google | ✅ Бесплатно | ⚠️ После деплоя |
| **Upstash Redis** | Кэширование | ✅ 10k/день | ✅ Настроен |

---

## 1️⃣ Neon PostgreSQL (ОБЯЗАТЕЛЬНО)

### Зачем?
Production база данных для Railway/Vercel деплоя

### Регистрация

1. Перейдите на https://neon.tech
2. Войдите через GitHub
3. Создайте новый проект:
   - **Name:** linglify-production
   - **Region:** Europe (Frankfurt) - ближайший к Беларуси
   - **PostgreSQL Version:** 15

### Получение Connection String

1. В проекте откройте **Dashboard**
2. Скопируйте **Connection String**
3. Добавьте в `.env`:

```env
# Production
DATABASE_URL=postgresql://username:password@ep-xxx.eu-central-1.aws.neon.tech/linglify?sslmode=require
```

### ✅ Проверка

```bash
# Локально проверьте подключение
cd backend
DATABASE_URL="ваш_connection_string" yarn prisma:migrate deploy
```

---

## 2️⃣ Resend Email Service (ОБЯЗАТЕЛЬНО)

### Зачем?
Отправка email:
- Подтверждение регистрации
- Восстановление пароля
- Приветственные письма

### Регистрация

1. Перейдите на https://resend.com
2. Войдите через GitHub
3. Подтвердите email

### Получение API Key

1. В Dashboard → **API Keys**
2. Нажмите **Create API Key**
   - **Name:** linglify-production
   - **Permission:** Full access
3. Скопируйте ключ (показывается только один раз!)

### Настройка в .env

```env
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxx
RESEND_FROM_EMAIL=onboarding@resend.dev
RESEND_FROM_NAME=Linglify
```

### ⚠️ FREE Plan ограничения

- **3,000 emails/месяц**
- Только с домена `onboarding@resend.dev`
- Для своего домена нужна верификация DNS

### Настройка своего домена (опционально)

1. В Resend → **Domains** → **Add Domain**
2. Введите домен: `linglify.com`
3. Добавьте DNS записи в свой регистратор:

```
Type: TXT
Name: resend._domainkey
Value: (копируется из Resend)

Type: MX
Name: @
Value: feedback-smtp.eu-west-1.amazonses.com
Priority: 10
```

4. После верификации используйте:

```env
RESEND_FROM_EMAIL=noreply@linglify.com
```

### ✅ Тестирование

```bash
# В development режиме письма логируются
# В production отправляются через Resend
NODE_ENV=production node -e "
  require('dotenv').config();
  const { emailService } = require('./dist/shared/lib/email');
  emailService.sendEmail({
    to: 'your@email.com',
    subject: 'Test',
    html: '<h1>Test email</h1>'
  });
"
```

---

## 3️⃣ Twilio SMS (ЖЕЛАТЕЛЬНО)

### Зачем?
SMS верификация телефона при регистрации

### Регистрация

1. Перейдите на https://www.twilio.com/try-twilio
2. Зарегистрируйтесь (потребуется телефон)
3. Подтвердите email и телефон

### Получение Credentials

1. В Console → **Account Info**:
   - **Account SID:** ACxxxxxxxxxxxxxxx
   - **Auth Token:** (показать/скопировать)

2. **Получите номер телефона:**
   - Console → **Phone Numbers** → **Buy a number**
   - Выберите страну (для Беларуси возьмите US номер)
   - Купите номер (бесплатно из trial баланса $15.50)

### Настройка в .env

```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=ваш_auth_token
TWILIO_PHONE_NUMBER=+15005550006
```

### ⚠️ Trial ограничения

- **$15.50 кредитов**
- SMS только на **верифицированные номера**
- Все SMS содержат префикс "Sent from a Twilio trial account"

### Верификация номеров для trial

1. Console → **Phone Numbers** → **Verified Caller IDs**
2. Добавьте свой номер телефона
3. Подтвердите по SMS коду

### Upgrade для production

Для production **добавьте биллинг** ($20 минимум):
1. Console → **Billing** → **Add Payment Method**
2. После оплаты trial ограничения снимаются

### ✅ Тестирование

```bash
# Отправка тестовой SMS
NODE_ENV=production node -e "
  require('dotenv').config();
  const { smsService } = require('./dist/shared/lib/sms');
  smsService.sendSms('+375291234567', 'Test SMS from Linglify');
"
```

---

## 4️⃣ Google OAuth 2.0 (ЖЕЛАТЕЛЬНО)

### Зачем?
Вход через Google аккаунт (упрощает регистрацию)

### Создание проекта

1. Перейдите на https://console.cloud.google.com/
2. Войдите в Google аккаунт
3. **Create Project:**
   - **Name:** linglify
   - **Organization:** (оставьте пустым)

### Настройка OAuth Consent Screen

1. **APIs & Services** → **OAuth consent screen**
2. **User Type:** External
3. **App information:**
   - **App name:** Linglify
   - **User support email:** ваш email
   - **Developer contact:** ваш email
4. **Scopes:** добавьте
   - `userinfo.email`
   - `userinfo.profile`
5. **Test users:** добавьте свой email для тестирования

### Создание Credentials

1. **APIs & Services** → **Credentials**
2. **Create Credentials** → **OAuth client ID**
3. **Application type:** Web application
4. **Name:** linglify-web
5. **Authorized JavaScript origins:**
   ```
   http://localhost:3000
   https://linglify.vercel.app
   ```
6. **Authorized redirect URIs:**
   ```
   http://localhost:5000/api/auth/google/callback
   https://your-api.railway.app/api/auth/google/callback
   ```

### Настройка в .env

```env
# Development
GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxxxxxxxxxx
GOOGLE_REDIRECT_URI=http://localhost:5000/api/auth/google/callback

# Production (добавьте в Railway/Vercel)
# GOOGLE_REDIRECT_URI=https://your-api.railway.app/api/auth/google/callback
```

### ⚠️ Важно

- **Client Secret** храните в безопасности
- Для production добавьте домены в **Authorized origins**
- При изменении redirect URI нужно обновить в Google Console

### ✅ Тестирование

OAuth тестируется через фронтенд:
1. Кнопка "Войти через Google"
2. Редирект на Google
3. Выбор аккаунта
4. Редирект обратно с токеном

---

## 5️⃣ Upstash Redis (ОПЦИОНАЛЬНО)

### Зачем?
- Кэширование запросов
- Session storage
- Rate limiting

### Регистрация

1. Перейдите на https://upstash.com
2. Войдите через GitHub
3. **Create Database:**
   - **Name:** linglify-cache
   - **Type:** Regional
   - **Region:** Europe (Frankfurt)

### Получение Connection String

1. В Dashboard → **Redis** → ваша БД
2. Скопируйте **REST URL**:

```env
REDIS_URL=rediss://default:xxx@eu1-xxx.upstash.io:6379
```

### ✅ FREE Plan

- **10,000 команд/день**
- **256 MB** данных
- Достаточно для MVP

---

## 6️⃣ Stripe Payments (ОПЦИОНАЛЬНО)

### Зачем?
Оплата курсов картой

### Регистрация

1. Перейдите на https://stripe.com
2. Создайте аккаунт
3. **Пропустите** активацию (используйте Test Mode)

### Получение API Keys

1. **Developers** → **API keys**
2. Используйте **Test keys**:
   - **Publishable key:** `pk_test_...`
   - **Secret key:** `sk_test_...` (Reveal)

### Webhook для локального тестирования

```bash
# Установите Stripe CLI
npm install -g stripe

# Логин
stripe login

# Слушайте webhooks
stripe listen --forward-to localhost:5000/api/webhooks/stripe
# Скопируйте whsec_... ключ
```

### Настройка в .env

```env
# Test Mode
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxx
```

### Production Setup

1. **Activate account** (потребуется верификация)
2. **Developers** → **Webhooks** → **Add endpoint**:
   ```
   URL: https://your-api.railway.app/api/webhooks/stripe
   Events: payment_intent.succeeded, checkout.session.completed
   ```
3. Используйте **Live keys**

---

## 📝 Итоговый .env файл

### Development

```env
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:3000

# PostgreSQL (локальный)
DATABASE_URL=postgresql://postgres:password@localhost:5432/linglify

# JWT (сгенерируйте случайные строки)
JWT_ACCESS_SECRET=your-random-32-char-access-secret
JWT_REFRESH_SECRET=your-random-32-char-refresh-secret

# Resend (production API для тестов)
RESEND_API_KEY=re_xxxxxxxxxxxx
RESEND_FROM_EMAIL=onboarding@resend.dev

# Twilio (опционально)
TWILIO_ACCOUNT_SID=ACxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxx
TWILIO_PHONE_NUMBER=+15005550006

# Google OAuth (опционально)
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxx
GOOGLE_REDIRECT_URI=http://localhost:5000/api/auth/google/callback
```

### Production (Railway)

```env
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://linglify.vercel.app

# Neon PostgreSQL
DATABASE_URL=postgresql://user:pass@ep-xxx.neon.tech/linglify?sslmode=require

# Upstash Redis (опционально)
REDIS_URL=rediss://default:xxx@eu1-xxx.upstash.io:6379

# JWT (те же секреты!)
JWT_ACCESS_SECRET=your-random-32-char-access-secret
JWT_REFRESH_SECRET=your-random-32-char-refresh-secret

# Resend
RESEND_API_KEY=re_xxxxxxxxxxxx
RESEND_FROM_EMAIL=noreply@linglify.com

# Twilio
TWILIO_ACCOUNT_SID=ACxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxx
TWILIO_PHONE_NUMBER=+15005550006

# Google OAuth
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxx
GOOGLE_REDIRECT_URI=https://your-api.railway.app/api/auth/google/callback
```

---

## 🔐 Безопасность

### ✅ Что делать:
- Используйте `.env` (в `.gitignore`)
- Генерируйте случайные JWT секреты
- Храните API ключи в переменных окружения
- Используйте разные ключи для dev/prod

### ❌ Что НЕ делать:
- Не коммитьте `.env` в git
- Не публикуйте API ключи
- Не используйте простые JWT секреты
- Не используйте production ключи в development

---

## 🚀 Генерация секретов

### JWT Secrets

```bash
# PowerShell
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})

# Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Linux/Mac
openssl rand -hex 32
```

---

---

## 6️⃣ Stripe (Test Mode для дипломной) 🎓

### Зачем?
Тестовая оплата курсов **без реальных денег** для демонстрации диплома

### Регистрация

1. Перейдите на https://dashboard.stripe.com/register
2. Заполните форму (email, имя, пароль)
3. Подтвердите email
4. **Готово!** Вы автоматически в Test Mode

### Получение API Keys

1. **Dashboard** → **Developers** → **API keys**
2. Скопируйте **Test keys**:
   - **Publishable key:** `pk_test_...` (для frontend)
   - **Secret key:** `sk_test_...` (для backend)

⚠️ Используйте только **Test keys** (начинаются с `_test_`)

### Настройка в .env

```env
# Stripe Test Mode (для дипломной)
STRIPE_SECRET_KEY=sk_test_51xxxxxxxxxxxxxxxx
STRIPE_PUBLISHABLE_KEY=pk_test_51xxxxxxxxxxxxxxxx
```

### ✅ Тестовые карты

| Номер карты | Результат |
|-------------|-----------|
| `4242 4242 4242 4242` | ✅ Успешная оплата |
| `4000 0000 0000 0002` | ❌ Отклонено |
| `4000 0000 0000 9995` | ❌ Недостаточно средств |

**Дата:** любая будущая (12/25)  
**CVC:** любые 3 цифры (123)

### Установка SDK

```bash
cd backend
yarn add stripe

cd ../frontend
yarn add @stripe/stripe-js
```

### 💡 Для дипломной работы

В презентации упомяните:
> "Для демонстрации используется Stripe Test Mode (без реальных денег). Для production в РБ планируется ЮKassa/Bepaid."

---

## ✅ Чеклист настройки

### Обязательные (для auth)
- [x] Neon PostgreSQL создан и подключен
- [x] Resend API ключ получен
- [x] Twilio credentials настроены
- [x] Upstash Redis подключен
- [x] JWT секреты сгенерированы
- [x] `.env` заполнен

### Опциональные (настроить при необходимости)
- [ ] Stripe Test Mode (для платежей)
- [ ] Google OAuth (после деплоя backend)

---

**Следующий шаг:** [DEPLOY_GUIDE.md](../DEPLOY_GUIDE.md) - деплой backend на Railway
