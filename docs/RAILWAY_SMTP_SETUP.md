# Настройка Gmail SMTP на Railway

Это пошаговое руководство для настройки отправки email через Gmail на Railway.

---

## Почему обычный пароль не работает

Google с мая 2022 года **запретил вход через обычный пароль** для сторонних приложений (опция "Less secure apps" удалена).  
На Railway необходимо использовать **App Password** — специальный 16-значный пароль, который Google генерирует для конкретного приложения.

---

## Шаг 1: Включить двухфакторную аутентификацию (2FA)

App Password доступен **только при включённой 2FA**.

1. Откройте [https://myaccount.google.com/security](https://myaccount.google.com/security)
2. В разделе "How you sign in to Google" нажмите **2-Step Verification**
3. Следуйте инструкциям и включите 2FA (SMS, Google Authenticator или ключ)

---

## Шаг 2: Создать App Password

1. Перейдите на [https://myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
   - Если ссылка не работает: Аккаунт Google → Безопасность → 2-Step Verification → прокрутите вниз → **App passwords**
2. В поле **Select app** выберите **Mail**
3. В поле **Select device** выберите **Other (Custom name)**
4. Введите название: `Linglify Railway`
5. Нажмите **Generate**
6. Скопируйте 16-значный пароль вида `xxxx xxxx xxxx xxxx`

> Этот пароль показывается только один раз. Сохраните его сразу.

---

## Шаг 3: Настроить переменные на Railway

Откройте [Railway Dashboard](https://railway.app) → ваш проект → сервис backend → вкладка **Variables**.

Добавьте или обновите следующие переменные:

| Переменная | Значение | Примечание |
|---|---|---|
| `SMTP_HOST` | `smtp.gmail.com` | Хост Gmail |
| `SMTP_PORT` | `465` | Рекомендуется 465 (SSL) |
| `SMTP_SECURE` | `true` | `true` для порта 465 |
| `SMTP_USER` | `your@gmail.com` | Ваш Gmail-адрес |
| `SMTP_PASSWORD` | `xxxxxxxxxxxxxxxx` | App Password **без пробелов** |
| `SMTP_FROM_EMAIL` | `your@gmail.com` | Адрес отправителя |
| `SMTP_FROM_NAME` | `Linglify` | Имя отправителя |

> **Важно**: В `SMTP_PASSWORD` вставляйте пароль **без пробелов** (Google показывает его как `xxxx xxxx xxxx xxxx`, но вводить надо `xxxxxxxxxxxxxxxx`).

---

## Шаг 4: Альтернатива — порт 587 (STARTTLS)

Если порт 465 не работает, попробуйте:

| Переменная | Значение |
|---|---|
| `SMTP_PORT` | `587` |
| `SMTP_SECURE` | `false` |

---

## Шаг 5: Проверить в логах Railway

После деплоя откройте логи Railway. При успешной конфигурации увидите:

```
📧 Email service: SMTP configured (smtp.gmail.com:465, secure=true)
✅ Email SMTP connection verified successfully
```

При ошибке:
```
❌ Email SMTP verify failed: Invalid login
```

Это означает, что App Password введён неверно или 2FA не включена.

---

## Частые ошибки

### `Invalid login` / `535-5.7.8 Username and Password not accepted`
- Вы используете обычный пароль Google, а не App Password
- App Password введён с пробелами — уберите пробелы
- 2FA не включена на аккаунте

### `Connection timeout` / `ETIMEDOUT`
- Railway временно недоступен на SMTP-порту — попробуйте перезапустить деплой
- Попробуйте переключиться с порта 465 на 587 или наоборот

### `ECONNREFUSED`
- Неправильный хост: убедитесь, что `SMTP_HOST=smtp.gmail.com`

### Письма уходят, но попадают в спам
- Добавьте в Google Account настройки SPF/DKIM если используете кастомный домен
- Убедитесь, что `SMTP_FROM_EMAIL` совпадает с `SMTP_USER`

---

## Проверка вручную через Node.js

Если нужно проверить до деплоя, выполните локально:

```js
const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: 'your@gmail.com',
    pass: 'xxxxxxxxxxxxxxxx', // App Password без пробелов
  },
  tls: { rejectUnauthorized: false },
})

transporter.verify((err, success) => {
  if (err) console.error('❌', err.message)
  else console.log('✅ SMTP OK')
})
```

---

## Лимиты Gmail SMTP (бесплатный аккаунт)

| Лимит | Значение |
|---|---|
| Писем в день | 500 |
| Получателей в письме | до 500 |
| Писем в час | ~100 (мягкий лимит) |

Для дипломного проекта этого более чем достаточно.  
Если потребуется больше — Google Workspace даёт 2000 писем/день.
