import { Category } from '@/types/api'
import { apiRequest } from '@/lib/axios'

interface CreateCategoryPayload {
  name: string
  color?: string
  icon?: string
  isDefault?: boolean
}

export const categoryService = {
  list: async (): Promise<Category[]> => {
    return apiRequest<Category[]>({
      method: 'GET',
      url: '/categories',
    })
  },
  
  getById: async (id: number): Promise<Category> => {
    return apiRequest<Category>({
      method: 'GET',
      url: `/categories/${id}`,
    })
  },
  
  create: async (data: CreateCategoryPayload): Promise<Category> => {
    return apiRequest<Category>({
      method: 'POST',
      url: '/categories',
      data,
    })
  },
  
  update: async (id: number, data: Partial<CreateCategoryPayload>): Promise<Category> => {
    return apiRequest<Category>({
      method: 'PUT',
      url: `/categories/${id}`,
      data,
    })
  },
  
  delete: async (id: number): Promise<void> => {
    return apiRequest<void>({
      method: 'DELETE',
      url: `/categories/${id}`,
    })
  },
}