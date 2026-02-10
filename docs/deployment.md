# Инструкция по деплою Linglify MVP+

## 🚀 Общая архитектура деплоя

- **Frontend**: Vercel
- **Backend**: Railway
- **Database**: Neon (PostgreSQL)
- **Cache**: Upstash Redis
- **Domain**: Бесплатный поддомен или .tk/.ml

## 📦 Frontend (Vercel)

### Шаг 1: Подготовка

1. Создайте аккаунт на [Vercel](https://vercel.com)
2. Установите Vercel CLI (опционально):
```bash
npm i -g vercel
```

### Шаг 2: Конфигурация проекта

Создайте файл `vercel.json` в корне проекта:

```json
{
  "buildCommand": "cd frontend && yarn build",
  "outputDirectory": "frontend/dist",
  "installCommand": "yarn install",
  "framework": "vite",
  "regions": ["fra1"]
}
```

### Шаг 3: Настройка переменных окружения

В настройках Vercel проекта добавьте:
- `VITE_API_URL` - URL вашего backend API (Railway)
- `VITE_SOCKET_URL` - URL WebSocket сервера
- `VITE_GOOGLE_ANALYTICS_ID` - ID Google Analytics (опционально)

### Шаг 4: Деплой

**Через Vercel Dashboard:**
1. Импортируйте репозиторий
2. Выберите root directory
3. Настройте build команды
4. Deploy

**Через CLI:**
```bash
cd frontend
vercel --prod
```

## 🖥️ Backend (Railway)

### Шаг 1: Подготовка

1. Создайте аккаунт на [Railway](https://railway.app)
2. Установите Railway CLI:
```bash
npm i -g @railway/cli
```

### Шаг 2: Создание проекта

```bash
railway login
railway init
```

### Шаг 3: Конфигурация

Создайте файл `railway.json` в директории `backend`:

```json
{
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "yarn build"
  },
  "deploy": {
    "startCommand": "yarn start",
    "healthcheckPath": "/health",
    "healthcheckTimeout": 300,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

### Шаг 4: Настройка переменных окружения

В Railway Dashboard добавьте:

```env
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://your-app.vercel.app
DATABASE_URL=postgresql://... (из Neon)
REDIS_URL=redis://... (из Upstash)
JWT_ACCESS_SECRET=...
JWT_REFRESH_SECRET=...
# Другие переменные из .env.example
```

### Шаг 5: Деплой

```bash
cd backend
railway up
```

## 🗄️ Database (Neon)

### Шаг 1: Создание проекта

1. Зарегистрируйтесь на [Neon](https://neon.tech)
2. Создайте новый проект
3. Выберите регион (ближайший к Railway)

### Шаг 2: Получение connection string

1. Скопируйте connection string из Dashboard
2. Добавьте в Railway переменные окружения как `DATABASE_URL`

### Шаг 3: Миграции

После первого деплоя на Railway выполните миграции:

```bash
railway run yarn prisma:migrate deploy
```

## 📮 Cache (Upstash Redis)

### Шаг 1: Создание базы

1. Зарегистрируйтесь на [Upstash](https://upstash.com)
2. Создайте Redis базу
3. Выберите регион (ближайший к Railway)

### Шаг 2: Настройка

1. Скопируйте Redis URL
2. Добавьте в Railway как `REDIS_URL`

## 🌐 Домен

### Вариант А: Vercel subdomain (бесплатно)

По умолчанию: `your-app.vercel.app`

### Вариант Б: Бесплатный домен

1. Зарегистрируйте домен на Freenom (.tk, .ml, .ga, .cf, .gq)
2. В Vercel: Settings → Domains → Add domain
3. Настройте DNS записи согласно инструкциям Vercel

### Вариант В: Собственный домен

1. Купите домен (Namecheap, GoDaddy и т.д.)
2. Добавьте в Vercel
3. Настройте DNS

## 🔄 CI/CD (GitHub Actions)

CI/CD уже настроен в `.github/workflows/ci.yml`

### Автоматический деплой

**Vercel:**
- Подключите GitHub репозиторий в Vercel Dashboard
- Автодеплой на каждый push в `main`

**Railway:**
- Подключите GitHub в Railway Dashboard
- Настройте auto-deploy из `main` ветки

## ✅ Проверка деплоя

### Frontend
```bash
curl https://your-app.vercel.app
```

### Backend
```bash
curl https://your-backend.railway.app/health
# Ожидается: {"status":"ok","timestamp":"..."}
```

### База данных
```bash
# Через Prisma Studio на Railway
railway run yarn prisma:studio
```

## 🔒 Безопасность

### Обязательные настройки:

1. **Environment Variables:**
   - Никогда не коммитьте `.env` файлы
   - Используйте сильные JWT секреты (32+ символов)
   - Регулярно ротируйте секреты

2. **CORS:**
   - Укажите точный frontend URL в `FRONTEND_URL`
   - Не используйте `*` в production

3. **Rate Limiting:**
   - Настроен в Express middleware
   - Проверьте лимиты в `backend/src/middleware/rateLimit.ts`

4. **HTTPS:**
   - Vercel и Railway используют HTTPS по умолчанию
   - Убедитесь, что `secure: true` в cookie settings

## 📊 Мониторинг

### Vercel Analytics
- Включите в Vercel Dashboard → Analytics
- Бесплатно для hobby проектов

### Railway Logs
```bash
railway logs
```

### Sentry (опционально)
1. Создайте проект на [Sentry](https://sentry.io)
2. Добавьте DSN в переменные окружения
3. Интегрируйте в код

## 🔄 Обновление production

### Frontend
```bash
git push origin main
# Vercel автоматически задеплоит
```

### Backend
```bash
git push origin main
# Railway автоматически задеплоит
```

### Миграции БД
```bash
# При изменении схемы Prisma
railway run yarn prisma:migrate deploy
```

## 🆘 Откат версии

### Vercel
1. Dashboard → Deployments
2. Найдите предыдущую версию
3. Promote to Production

### Railway
1. Dashboard → Deployments
2. Rollback to previous version

## 📝 Чеклист перед production

- [ ] Все environment variables настроены
- [ ] JWT секреты сгенерированы и безопасны
- [ ] CORS настроен корректно
- [ ] Database миграции применены
- [ ] Redis подключен
- [ ] Health check работает
- [ ] HTTPS включен
- [ ] Rate limiting активен
- [ ] Error tracking настроен (Sentry)
- [ ] Analytics подключена
- [ ] Backup стратегия определена
- [ ] Мониторинг настроен

## 🔗 Полезные ссылки

- [Vercel Docs](https://vercel.com/docs)
- [Railway Docs](https://docs.railway.app)
- [Neon Docs](https://neon.tech/docs)
- [Upstash Docs](https://docs.upstash.com)

---

**Примечание:** Это MVP версия. Для production следует добавить:
- CDN для статики
- Backup стратегию
- Monitoring и alerting
- Scaling стратегию
