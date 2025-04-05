import { useCallback, useEffect, useState } from 'react'
import { authService } from '@/services/auth-service'
import { User, LoginRequest, RegisterRequest } from '@/types/api'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  // Fetch user on mount if authenticated
  useEffect(() => {
    const checkAuth = async () => {
      if (authService.isAuthenticated()) {
        try {
          const userData = await authService.getProfile()
          setUser(userData)
        } catch (err) {
          setError(err as Error)
          // If profile fetch fails, user might not be authenticated
          localStorage.removeItem('auth_token')
        }
      }
      setIsLoading(false)
    }

    checkAuth()
  }, [])

  // Login function
  const login = useCallback(async (credentials: LoginRequest) => {
    setIsLoading(true)
    setError(null)
    try {
      await authService.login(credentials)
      const userData = await authService.getProfile()
      setUser(userData)
      return userData
    } catch (err) {
      setError(err as Error)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const register = useCallback(async (userData: RegisterRequest) => {
    setIsLoading(true)
    setError(null)
    try {
      await authService.register(userData)
    } catch (err) {
      setError(err as Error)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Logout function
  const logout = useCallback(() => {
    authService.logout()
    setUser(null)
  }, [])

  return {
    user,
    isLoading,
    error,
    isAuthenticated: !!user,
    login,
    register,
    logout,
  }
}
