import axios, { AxiosError, AxiosRequestConfig } from 'axios'

export const BASE_URL = 'http://localhost:3000/api'

export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Interceptor para adicionar o token de autenticação
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token')

  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

// Interceptor para tratar erros de resposta
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // Lida com erros 401 (não autorizado)
    if (error.response?.status === 401) {
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
