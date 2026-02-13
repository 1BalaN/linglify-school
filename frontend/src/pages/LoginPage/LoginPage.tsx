import { LoginForm } from '@/features/auth'

export const LoginPage = () => {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5 px-4 py-12">
      <LoginForm />
    </div>
  )
}
