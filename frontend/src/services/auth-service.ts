import { LoginRequest, LoginResponse, RegisterRequest, User } from '@/types/api'
import { apiRequest } from '@/lib/axios'

export const authService = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await apiRequest<LoginResponse>({
      method: 'POST',
      url: '/sessions',
      data: credentials,
    })

    if (response.token) {
      localStorage.setItem('auth_token', response.token)
    }

    return response
  },

  register: async (userData: RegisterRequest): Promise<User> => {
    return apiRequest<User>({
      method: 'POST',
      url: '/users',
      data: userData,
    })
  },

  getProfile: async (): Promise<User> => {
    return apiRequest<User>({
      method: 'GET',
      url: '/profile',
    })
  },

  logout: (): void => {
    localStorage.removeItem('auth_token')

    window.location.href = '/auth/login'
  },

  isAuthenticated: (): boolean => {
    return localStorage.getItem('auth_token') !== null
  },
}
