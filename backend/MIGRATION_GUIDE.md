# 🔄 Migration Guide - Auth System Upgrade

## ⚠️ Важно!

База данных была обновлена. Необходимо применить новые миграции.

## 📦 Что было добавлено:

### Новые поля в таблице `users`:
- `isEmailVerified` (вместо `isVerified`)
- `isPhoneVerified`
- `phone`
- `firstName`
- `lastName`
- `avatar`
- `oauthProvider` (GOOGLE, GITHUB)
- `oauthId`

### Новые таблицы:
- `verification_tokens` - токены подтверждения email/phone
- `password_resets` - токены восстановления пароля

## 🚀 Применение миграций

### Шаг 1: Остановите backend сервер
```bash
# Ctrl+C в терминале где запущен backend
```

### Шаг 2: Примените миграции

```bash
cd backend
yarn prisma:migrate
```

При запросе имени миграции введите:
```
upgrade_auth_system
```

### Шаг 3: Сгенерируйте Prisma Client

```bash
yarn prisma:generate
```

### Шаг 4: Перезапустите сервер

```bash
# Из корневой директории
yarn dev
```

## ✅ Проверка

После применения миграций проверьте:

```bash
cd backend
yarn prisma:studio
```

Должны появиться таблицы:
- ✅ `users` (с новыми полями)
- ✅ `verification_tokens`
- ✅ `password_resets`

## 📝 Новые API Endpoints

### Public Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Регистрация (теперь с firstName, lastName) |
| POST | `/api/auth/login` | Вход |
| POST | `/api/auth/verify-email` | Подтверждение email |
| POST | `/api/auth/resend-verification` | Повторная отправка письма |
| POST | `/api/auth/forgot-password` | Запрос восстановления пароля |
| POST | `/api/auth/reset-password` | Сброс пароля |
| POST | `/api/auth/refresh` | Обновление токена |
| POST | `/api/auth/logout` | Выход |

### Protected Endpoints (требуют Authorization header)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/auth/me` | Получить текущего пользователя |
| PATCH | `/api/auth/profile` | Обновить профиль |
| POST | `/api/auth/change-password` | Изменить пароль |
| POST | `/api/auth/send-phone-verification` | Отправить SMS код |
| POST | `/api/auth/verify-phone` | Подтвердить телефон |

## 🧪 Тестирование

### 1. Импортируйте новую Postman коллекцию

```
backend/postman/Linglify-Auth-Full.postman_collection.json
```

### 2. Тестовый сценарий

1. **Регистрация**
   - POST `/api/auth/register`
   - Проверьте консоль backend - должно быть письмо с токеном

2. **Проверка email** (dev mode)
   - Скопируйте токен из консоли
   - POST `/api/auth/verify-email` с токеном

3. **Получение профиля**
   - GET `/api/auth/me` с Authorization header

4. **Обновление профиля**
   - PATCH `/api/auth/profile`

5. **Изменение пароля**
   - POST `/api/auth/change-password`

6. **Восстановление пароля**
   - POST `/api/auth/forgot-password`
   - Скопируйте resetToken из консоли
   - POST `/api/auth/reset-password`

## 🔍 Development Mode

В режиме development:
- ✅ Emails логируются в консоль (не отправляются)
- ✅ SMS логируются в консоль (не отправляются)
- ✅ Токены видны в консоли для тестирования

## 📧 Email Templates

В консоли будут отображаться:
- Письмо подтверждения email
- Письмо восстановления пароля
- Приветственное письмо (после верификации)

## 📱 SMS Verification

В консоли будут отображаться:
- 6-значный код подтверждения
- Номер телефона

## 🔒 Безопасность

### Что реализовано:

✅ Email verification обязательно при регистрации
✅ Токены с истечением срока действия:
   - Email verification: 24 часа
   - Password reset: 1 час
   - Phone verification: 10 минут

✅ Токены одноразовые (удаляются после использования)
✅ Старые токены автоматически удаляются
✅ Rate limiting на критичных эндпоинтах
✅ Пароли хешируются bcrypt (12 rounds)

## 🚨 Troubleshooting

### Ошибка: "Column does not exist"
→ Примените миграции: `yarn prisma:migrate`

### Ошибка: "Prisma Client outdated"
→ Сгенерируйте клиент: `yarn prisma:generate`

### Не видно новых полей в БД
→ Перезапустите Prisma Studio

### Токены не логируются
→ Проверьте `NODE_ENV=development` в `.env`

## 📚 Следующие шаги

После успешной миграции можно добавить:
- [ ] Google OAuth 2.0
- [ ] GitHub OAuth
- [ ] Интеграция Resend (production emails)
- [ ] Интеграция Twilio (production SMS)
- [ ] Upload аватара пользователя

---

**Готово!** Теперь у вас полноценная система авторизации 🎉
