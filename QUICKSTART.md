# 🚀 Быстрый старт Linglify

## ⚡ За 5 минут

### 1. Установка зависимостей

```bash
# Установить все зависимости (frontend + backend)
yarn install
```

### 2. Настройка Backend

```bash
# Создать .env файл
cd backend
cp .env.example .env
```

**Минимальная конфигурация для старта:**

```env
# backend/.env
DATABASE_URL=postgresql://user:password@localhost:5432/linglify
JWT_ACCESS_SECRET=change-this-to-random-32-char-string
JWT_REFRESH_SECRET=change-this-to-different-random-string
```

**Генерация секретов в PowerShell:**
```powershell
# Запустите дважды для двух разных секретов
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})
```

### 3. Настройка Frontend

```bash
cd frontend
cp .env.example .env
```

Файл `.env` уже содержит правильные значения для локальной разработки.

### 4. База данных

**Вариант А: Локальный PostgreSQL**
```bash
# Создайте БД
createdb linglify

# Или через psql
psql -U postgres
CREATE DATABASE linglify;
\q
```

**Вариант Б: Neon (проще)**
1. Зарегистрируйтесь на [neon.tech](https://neon.tech)
2. Создайте проект
3. Скопируйте connection string
4. Вставьте в `backend/.env` → `DATABASE_URL`

### 5. Применить миграции

```bash
cd backend
yarn prisma:generate
yarn prisma:migrate
```

### 6. Запуск

```bash
# Из корневой директории
yarn dev
```

**Готово!** 🎉

- Frontend: http://localhost:3000
- Backend: http://localhost:5000
- Health: http://localhost:5000/health

## 📋 Проверка установки

```bash
# Должно открыться приложение
curl http://localhost:3000

# Должно вернуть {"status":"ok",...}
curl http://localhost:5000/health

# Должно вернуть {"message":"Linglify API v1.0"}
curl http://localhost:5000/api
```

## 🛠️ Полезные команды

```bash
# Запуск dev серверов
yarn dev

# Только frontend
cd frontend && yarn dev

# Только backend
cd backend && yarn dev

# Проверка кода
yarn lint
yarn typecheck
yarn format

# Prisma Studio (GUI для БД)
cd backend && yarn prisma:studio
```

## 📖 Следующие шаги

1. ✅ Проект запущен
2. 📚 Читайте [README.md](./README.md) - обзор проекта
3. 📋 Изучите [SETUP.md](./SETUP.md) - детальная настройка
4. 🏗️ Смотрите [docs/architecture.md](./docs/architecture.md) - архитектура
5. 🎯 Следуйте [docs/tech-spec.md](./docs/tech-spec.md) - техзадание
6. 💻 Придерживайтесь [CONTRIBUTING.md](./CONTRIBUTING.md) - правила разработки

## 🆘 Проблемы?

### Ошибка "Cannot find module '@/...'"
→ Перезапустите TypeScript сервер в VSCode (Ctrl+Shift+P → "TypeScript: Restart TS Server")

### Ошибка подключения к БД
→ Проверьте `DATABASE_URL` в `backend/.env`

### Порт занят
→ Измените порты:
- Frontend: `frontend/vite.config.ts` → `server.port`
- Backend: `backend/.env` → `PORT`

### Prisma Client не найден
→ `cd backend && yarn prisma:generate`

---

**Happy coding! 🚀**
