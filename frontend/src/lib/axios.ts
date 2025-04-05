import axios, { AxiosError, AxiosRequestConfig } from 'axios'

export const BASE_URL = 'http://localhost:3000/api'

export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Interceptor to add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token')

  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

// Interceptor to handle errors and authentication issues
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // Handle 401 Unauthorized errors
    if (error.response?.status === 401) {
      // Clear localStorage and redirect to login
      localStorage.removeItem('auth_token')
      window.location.href = '/auth/login'
    }

    return Promise.reject(error)
  },
)

// Generic request function with types
export async function apiRequest<T>(config: AxiosRequestConfig): Promise<T> {
  try {
    const response = await api(config)
    return response.data
  } catch (error) {
    return Promise.reject(error)
  }
}
