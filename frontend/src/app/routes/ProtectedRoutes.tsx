import { Navigate, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import type { RootState } from '@/app/store'
import type { UserRole } from '@/shared/types/user'
import { useGetCurrentUserQuery } from '@/entities/user'
import { Loader2 } from 'lucide-react'

interface ProtectedRouteProps {
  children: JSX.Element
  roles?: UserRole[]
}

export const ProtectedRoute = ({ children, roles }: ProtectedRouteProps) => {
  const { user, accessToken } = useSelector((state: RootState) => state.auth)
  const location = useLocation()

  // Гарантируем, что при наличии токена сначала пытаемся получить пользователя,
  // а уже потом решаем, редиректить ли на /login
  const { isLoading } = useGetCurrentUserQuery(undefined, {
    skip: !accessToken,
  })

  if(!accessToken) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (isLoading || !user) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/" replace />
  }

  return children
}

