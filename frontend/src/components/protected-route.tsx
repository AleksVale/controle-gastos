import { Navigate, Outlet } from 'react-router-dom'
import { useAuthContext } from '@/providers/auth-provider'

export function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuthContext()

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center">Carregando...</div>
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/auth/login" replace />
}

export function PublicRoute() {
  const { isAuthenticated, isLoading } = useAuthContext()

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center">Carregando...</div>
  }

  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <Outlet />
}