# Инструкция по первоначальной настройке проекта

## ✅ Шаг 1: Установка зависимостей

```bash
# Из корневой директории проекта
yarn install
```

Эта команда установит все зависимости для frontend и backend благодаря workspace setup.

## ✅ Шаг 2: Настройка переменных окружения

### Backend

1. Создайте файл `.env` в директории `backend`:
```bash
cd backend
cp .env.example .env
```

2. Заполните обязательные переменные:
```env
# Database - используйте локальный PostgreSQL или Neon
DATABASE_URL=postgresql://user:password@localhost:5432/linglify

# JWT Secrets - сгенерируйте случайные строки
JWT_ACCESS_SECRET=your-random-32-char-secret-key-here
JWT_REFRESH_SECRET=your-different-32-char-secret-key-here
```

**Генерация секретных ключей:**
```bash
# В PowerShell
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})
```

### Frontend

1. Создайте файл `.env` в директории `frontend`:
```bash
cd frontend
cp .env.example .env
```

2. По умолчанию будет использоваться `http://localhost:5000/api` - это подходит для локальной разработки.

## ✅ Шаг 3: Настройка базы данных

### Опция А: Локальный PostgreSQL

1. Установите PostgreSQL 14+ (если еще не установлен)
2. Создайте базу данных:
```sql
CREATE DATABASE linglify;
```

3. Обновите `DATABASE_URL` в `backend/.env`

### Опция Б: Neon (рекомендуется для быстрого старта)

1. Зарегистрируйтесь на [neon.tech](https://neon.tech)
2. Создайте новый проект
3. Скопируйте connection string
4. Вставьте его в `DATABASE_URL` в `backend/.env`

### Применение миграций

```bash
cd backend
yarn prisma:generate
yarn prisma:migrate
```

## ✅ Шаг 4: Запуск проекта

### Для разработки (рекомендуется)

Из корневой директории запустите оба сервера одновременно:
```bash
yarn dev
```

Это запустит:
- Frontend на http://localhost:3000
- Backend на http://localhost:5000

### Раздельный запуск

**Frontend:**
```bash
cd frontend
yarn dev
```

**Backend:**
```bash
cd backend
yarn dev
```

## ✅ Шаг 5: Проверка работоспособности

1. Откройте http://localhost:3000 - должна отобразиться страница "Linglify MVP+"
2. Откройте http://localhost:5000/health - должен вернуться `{"status":"ok",...}`
3. Откройте http://localhost:5000/api - должно вернуться `{"message":"Linglify API v1.0"}`

## 🔧 Дополнительные команды

### Prisma Studio (GUI для базы данных)
```bash
cd backend
yarn prisma:studio
```

### Проверка типов
```bash
yarn typecheck
```

### Линтинг
```bash
yarn lint
```

### Форматирование кода
```bash
yarn format
```

## 🚨 Частые проблемы

### Ошибка "Cannot find module '@/...'"

**Решение:** Перезапустите TypeScript сервер в VSCode:
1. Откройте Command Palette (Ctrl+Shift+P)
2. Выберите "TypeScript: Restart TS Server"

### Ошибка подключения к базе данных

**Решение:** 
1. Проверьте правильность `DATABASE_URL`
2. Убедитесь, что PostgreSQL запущен
3. Проверьте права доступа пользователя БД

### Prisma Client не найден

**Решение:**
```bash
cd backend
yarn prisma:generate
```

### Порт уже используется

**Решение:** Измените порты в конфигурации:
- Frontend: `frontend/vite.config.ts` → `server.port`
- Backend: `backend/.env` → `PORT`

## 📚 Следующие шаги

1. Изучите [Техническое задание](./docs/tech-spec.md)
2. Ознакомьтесь с [Правилами разработки](./.cursor/rules/AGENTS.md)
3. Изучите структуру проекта в [README.md](./README.md)
4. Начните разработку с модуля аутентификации

## 💡 Полезные ссылки

- [Vite документация](https://vitejs.dev/)
- [React документация](https://react.dev/)
- [Redux Toolkit](https://redux-toolkit.js.org/)
- [Express.js](https://expressjs.com/)
- [Prisma](https://www.prisma.io/docs)
- [Zod](https://zod.dev/)
- [Tailwind CSS](https://tailwindcss.com/)

---

✨ **Готово!** Теперь можно начинать разработку.
