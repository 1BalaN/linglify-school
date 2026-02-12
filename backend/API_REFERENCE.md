# 📚 Linglify Auth API Reference

## 🌐 Base URL
```
http://localhost:5000/api
```

---

## 🔓 Public Endpoints

### 1. Регистрация

```http
POST /auth/register
```

**Body:**
```json
{
  "email": "user@example.com",
  "password": "Test123456",
  "firstName": "John",      // optional
  "lastName": "Doe"         // optional
}
```

**Response (201):**
```json
{
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "STUDENT",
      "isEmailVerified": false,
      "isPhoneVerified": false,
      "createdAt": "2026-02-10T..."
    },
    "accessToken": "eyJhbGc..."
  }
}
```

**Cookies:** `refreshToken` (httpOnly, 7 days)

**Rate Limit:** 5 requests / 15 min

---

### 2. Вход

```http
POST /auth/login
```

**Body:**
```json
{
  "email": "user@example.com",
  "password": "Test123456"
}
```

**Response (200):**
```json
{
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "STUDENT",
      "isEmailVerified": true,
      "isPhoneVerified": false,
      "phone": null,
      "avatar": null,
      "createdAt": "2026-02-10T..."
    },
    "accessToken": "eyJhbGc..."
  }
}
```

**Cookies:** `refreshToken` (httpOnly, 7 days)

**Rate Limit:** 5 requests / 15 min

---

### 3. Подтверждение Email

```http
POST /auth/verify-email
```

**Body:**
```json
{
  "token": "verification_token_from_email"
}
```

**Response (200):**
```json
{
  "data": {
    "message": "Email verified successfully"
  }
}
```

**Note:** После верификации отправляется приветственное письмо

---

### 4. Повторная отправка письма подтверждения

```http
POST /auth/resend-verification
```

**Body:**
```json
{
  "email": "user@example.com"
}
```

**Response (200):**
```json
{
  "data": {
    "message": "Verification email sent"
  }
}
```

**Rate Limit:** 5 requests / 15 min

---

### 5. Запрос восстановления пароля

```http
POST /auth/forgot-password
```

**Body:**
```json
{
  "email": "user@example.com"
}
```

**Response (200):**
```json
{
  "data": {
    "message": "If the email exists, a reset link has been sent"
  }
}
```

**Note:** Всегда возвращает успех (security by obscurity)

**Rate Limit:** 5 requests / 15 min

---

### 6. Сброс пароля

```http
POST /auth/reset-password
```

**Body:**
```json
{
  "token": "reset_token_from_email",
  "password": "NewPassword123"
}
```

**Response (200):**
```json
{
  "data": {
    "message": "Password reset successfully"
  }
}
```

**Password Requirements:**
- Минимум 8 символов
- Хотя бы одна заглавная буква
- Хотя бы одна строчная буква
- Хотя бы одна цифра

**Rate Limit:** 5 requests / 15 min

---

### 7. Обновление Access Token

```http
POST /auth/refresh
```

**Body (or Cookie):**
```json
{
  "refreshToken": "refresh_token"
}
```

**Response (200):**
```json
{
  "data": {
    "accessToken": "new_eyJhbGc..."
  }
}
```

**Cookies:** Новый `refreshToken` (httpOnly, 7 days)

---

### 8. Выход

```http
POST /auth/logout
```

**Response (200):**
```json
{
  "data": {
    "message": "Logged out successfully"
  }
}
```

**Note:** Удаляет `refreshToken` cookie

---

## 🔒 Protected Endpoints

**All protected endpoints require:**
```http
Authorization: Bearer {accessToken}
```

### 9. Получить текущего пользователя

```http
GET /auth/me
```

**Response (200):**
```json
{
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+375291234567",
    "avatar": null,
    "role": "STUDENT",
    "isEmailVerified": true,
    "isPhoneVerified": true,
    "oauthProvider": null,
    "createdAt": "2026-02-10T...",
    "updatedAt": "2026-02-10T..."
  }
}
```

---

### 10. Обновить профиль

```http
PATCH /auth/profile
```

**Body:**
```json
{
  "firstName": "Ivan",      // optional
  "lastName": "Petrov",     // optional
  "phone": "+375291234567"  // optional
}
```

**Response (200):**
```json
{
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "Ivan",
    "lastName": "Petrov",
    "phone": "+375291234567",
    "avatar": null,
    "role": "STUDENT",
    "isEmailVerified": true,
    "isPhoneVerified": false
  }
}
```

**Note:** Изменение телефона сбрасывает `isPhoneVerified`

---

### 11. Изменить пароль

```http
POST /auth/change-password
```

**Body:**
```json
{
  "currentPassword": "OldPassword123",
  "newPassword": "NewPassword123"
}
```

**Response (200):**
```json
{
  "data": {
    "message": "Password changed successfully"
  }
}
```

**Errors:**
- `401 INVALID_PASSWORD` - неверный текущий пароль
- `400 NO_PASSWORD` - у пользователя нет пароля (OAuth)

---

### 12. Отправить код подтверждения телефона

```http
POST /auth/send-phone-verification
```

**Body:**
```json
{
  "phone": "+375291234567"
}
```

**Response (200):**
```json
{
  "data": {
    "message": "Verification code sent"
  }
}
```

**Note:** 
- Код действует 10 минут
- В dev mode код логируется в консоль

---

### 13. Подтвердить телефон

```http
POST /auth/verify-phone
```

**Body:**
```json
{
  "phone": "+375291234567",
  "code": "123456"
}
```

**Response (200):**
```json
{
  "data": {
    "message": "Phone verified successfully"
  }
}
```

**Errors:**
- `400 INVALID_CODE` - неверный код
- `400 CODE_EXPIRED` - код истек (>10 минут)

---

## ❌ Общие коды ошибок

### Validation Errors (400)

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "path": ["email"],
        "message": "Invalid email format"
      }
    ]
  }
}
```

### Authentication Errors (401)

```json
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "No token provided"
  }
}
```

```json
{
  "error": {
    "code": "INVALID_TOKEN",
    "message": "Invalid or expired token"
  }
}
```

```json
{
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "Invalid credentials"
  }
}
```

### Authorization Errors (403)

```json
{
  "error": {
    "code": "FORBIDDEN",
    "message": "You do not have permission to access this resource"
  }
}
```

### Not Found (404)

```json
{
  "error": {
    "code": "USER_NOT_FOUND",
    "message": "User not found"
  }
}
```

### Conflict (409)

```json
{
  "error": {
    "code": "USER_ALREADY_EXISTS",
    "message": "User already exists"
  }
}
```

### Rate Limit (429)

```json
{
  "error": {
    "code": "TOO_MANY_REQUESTS",
    "message": "Too many requests, please try again later"
  }
}
```

---

## 📊 Модели данных

### User

```typescript
{
  id: string                    // UUID
  email: string                 // Unique
  password?: string             // Хеш, может отсутствовать при OAuth
  firstName?: string
  lastName?: string
  phone?: string                // Unique
  avatar?: string               // URL
  role: 'GUEST' | 'STUDENT' | 'TEACHER' | 'ADMIN'
  isEmailVerified: boolean
  isPhoneVerified: boolean
  oauthProvider?: 'GOOGLE' | 'GITHUB'
  oauthId?: string
  createdAt: DateTime
  updatedAt: DateTime
}
```

---

## 🔐 Безопасность

### Password Requirements

- ✅ Минимум 8 символов
- ✅ Максимум 128 символов
- ✅ Хотя бы одна заглавная буква (A-Z)
- ✅ Хотя бы одна строчная буква (a-z)
- ✅ Хотя бы одна цифра (0-9)

**Regex:** `/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/`

### Token Expiration

| Token Type | TTL | Usage |
|------------|-----|-------|
| Access Token | 15 minutes | API requests |
| Refresh Token | 7 days | Token renewal |
| Email Verification | 24 hours | One-time |
| Password Reset | 1 hour | One-time |
| Phone Verification | 10 minutes | One-time |

### Rate Limits

| Endpoint | Limit |
|----------|-------|
| `/auth/register` | 5 / 15 min |
| `/auth/login` | 5 / 15 min |
| `/auth/resend-verification` | 5 / 15 min |
| `/auth/forgot-password` | 5 / 15 min |
| `/auth/reset-password` | 5 / 15 min |
| Other endpoints | 100 / 15 min |

---

## 🧪 Testing

### Postman Collection

```
backend/postman/Linglify-Auth-Full.postman_collection.json
```

### cURL Examples

#### Register
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123456","firstName":"John"}'
```

#### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123456"}' \
  -c cookies.txt
```

#### Get Profile
```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

**Version:** 1.0.0  
**Last Updated:** 2026-02-10
