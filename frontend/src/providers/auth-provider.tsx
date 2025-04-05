import { createContext, useContext, ReactNode } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { User, LoginRequest, RegisterRequest } from '@/types/api'

interface AuthContextType {
  user: User | null
  isLoading: boolean
  error: Error | null
  isAuthenticated: boolean
  login: (credentials: LoginRequest) => Promise<User>
  register: (userData: RegisterRequest) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const auth = useAuth()

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>
}

export function useAuthContext() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider')
  }
  return context
}
