# Contributing to Linglify

## 📋 Правила разработки

Этот проект - дипломная работа с академическими требованиями. Следуйте этим правилам:

## 🎯 Обязательное чтение

Перед началом работы изучите:
1. [Техническое задание](./docs/tech-spec.md) - требования проекта
2. [AGENTS.md](./.cursor/rules/AGENTS.md) - стандарты кодирования
3. [Архитектура](./docs/architecture.md) - архитектурные решения

## 💻 Code Style

### TypeScript

```typescript
// ✅ Правильно
const getUserById = async (id: string): Promise<User> => {
  const user = await prisma.user.findUnique({ where: { id } })
  if (!user) {
    throw new AppError(404, 'USER_NOT_FOUND', 'User not found')
  }
  return user
}

// ❌ Неправильно
function getUserById(id: any) {
  return prisma.user.findUnique({ where: { id } })
}
```

### Imports

```typescript
// ✅ Правильно - используйте path aliases
import { Button } from '@/shared/ui/button'
import { useAuth } from '@/features/auth'

// ❌ Неправильно - относительные пути
import { Button } from '../../../shared/ui/button'
```

### Naming Conventions

```typescript
// Компоненты - PascalCase
const UserProfile = () => {}

// Функции/переменные - camelCase
const fetchUserData = () => {}
const userData = []

// Константы - UPPER_SNAKE_CASE
const MAX_FILE_SIZE = 5000000

// Types/Interfaces - PascalCase
interface User {}
type UserDto = z.infer<typeof UserSchema>
```

## 🏗️ Архитектурные правила

### Frontend (FSD)

```typescript
// ✅ Правильно - соблюдаем слои FSD
// features/auth не может импортировать из widgets
import { api } from '@/shared/api'
import { Button } from '@/shared/ui/button'

// ❌ Неправильно
import { Header } from '@/widgets/header'
```

### Backend (Модули)

```typescript
// ✅ Правильно - каждый модуль самодостаточен
modules/
  auth/
    auth.router.ts
    auth.controller.ts
    auth.service.ts
    auth.schema.ts

// ❌ Неправильно - смешивание
controllers/
  auth.controller.ts
services/
  auth.service.ts
```

## 🔒 Безопасность

### Обязательно

1. **Никогда не коммитьте секреты**
   ```bash
   # Проверяйте перед коммитом
   git diff --staged
   ```

2. **Всегда валидируйте input**
   ```typescript
   // ✅ Правильно
   const data = registerSchema.parse(req.body)
   
   // ❌ Неправильно
   const { email } = req.body
   ```

3. **Хешируйте пароли**
   ```typescript
   // ✅ Правильно
   const hash = await bcrypt.hash(password, 12)
   
   // ❌ Неправильно
   await prisma.user.create({ data: { password } })
   ```

## ✅ Validation

### Frontend

```typescript
// Используйте Zod + React Hook Form
const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
})

const { register, handleSubmit } = useForm({
  resolver: zodResolver(schema),
})
```

### Backend

```typescript
// Всегда валидируйте в controller
export const register = async (req: Request, res: Response) => {
  const data = registerSchema.parse(req.body)
  const user = await authService.register(data)
  res.json({ data: user })
}
```

## 🧪 Testing

### Unit Tests

```typescript
// Jest/Vitest
describe('authService', () => {
  it('should hash password before saving', async () => {
    const password = 'password123'
    const user = await authService.register({ 
      email: 'test@test.com', 
      password 
    })
    expect(user.password).not.toBe(password)
  })
})
```

### Integration Tests

```typescript
// Supertest для API
describe('POST /api/auth/register', () => {
  it('should register new user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'test@test.com', password: 'password123' })
      .expect(201)
    
    expect(res.body.data).toHaveProperty('id')
  })
})
```

## 📝 Commit Messages

Используйте Conventional Commits:

```bash
# Формат
<type>(<scope>): <subject>

# Примеры
feat(auth): add OAuth 2.0 support
fix(course): resolve enrollment bug
docs(readme): update setup instructions
refactor(api): improve error handling
test(auth): add unit tests for register
```

**Types:**
- `feat` - новая функциональность
- `fix` - исправление бага
- `docs` - документация
- `style` - форматирование
- `refactor` - рефакторинг
- `test` - тесты
- `chore` - настройки, зависимости

## 🌿 Git Workflow

### Branches

```bash
# Feature
git checkout -b feature/placement-test

# Hotfix
git checkout -b hotfix/login-error

# Release
git checkout -b release/v1.0.0
```

### Pull Requests

1. Создайте feature branch
2. Сделайте изменения
3. Commit следуя правилам
4. Push в remote
5. Создайте PR в `develop`
6. Дождитесь review
7. Merge после одобрения

### PR Template

```markdown
## Описание
Краткое описание изменений

## Тип изменений
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Чеклист
- [ ] Код соответствует AGENTS.md
- [ ] Добавлены тесты
- [ ] Обновлена документация
- [ ] Все тесты проходят
- [ ] Lint проходит
```

## 🔄 Development Workflow

1. **Обновите ветку**
   ```bash
   git checkout develop
   git pull origin develop
   ```

2. **Создайте feature branch**
   ```bash
   git checkout -b feature/my-feature
   ```

3. **Разработка**
   ```bash
   yarn dev
   # Делайте изменения
   ```

4. **Проверка**
   ```bash
   yarn lint          # Проверка кода
   yarn typecheck     # Проверка типов
   yarn format        # Форматирование
   ```

5. **Commit**
   ```bash
   git add .
   git commit -m "feat(scope): description"
   ```

6. **Push & PR**
   ```bash
   git push origin feature/my-feature
   # Создайте PR через GitHub
   ```

## 🚫 Что НЕ делать

### Запрещено

❌ Использовать `any` тип
❌ Коммитить `.env` файлы
❌ Игнорировать ошибки линтера
❌ Пропускать валидацию
❌ Хранить пароли в plain text
❌ Делать force push в `main`/`develop`
❌ Импортировать из верхних слоев FSD
❌ Писать business logic в controllers
❌ Использовать `var`
❌ Создавать circular dependencies

## 📚 Полезные команды

```bash
# Проверка всего
yarn lint && yarn typecheck && yarn format:check

# Автофикс
yarn format

# Prisma
yarn workspace backend prisma:studio
yarn workspace backend prisma:migrate

# Logs
yarn workspace backend dev
# или
railway logs # для production
```

## ❓ Вопросы?

1. Проверьте [AGENTS.md](./.cursor/rules/AGENTS.md)
2. Изучите [architecture.md](./docs/architecture.md)
3. Посмотрите существующий код
4. Спросите в issues

## 🎓 Академические требования

Помните:
- Это дипломный проект
- Качество кода оценивается
- Документация обязательна
- Тесты приветствуются
- Следуйте best practices

---

**Спасибо за вклад в проект! 🚀**
