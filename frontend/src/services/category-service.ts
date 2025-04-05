import { api } from '@/lib/axios'
import { Category } from '@/types/api'

interface CreateCategoryPayload {
  name: string
  color?: string
  icon?: string
  isDefault?: boolean
}

export const CategoryService = {
  // Lista todas as categorias
  list: async (): Promise<Category[]> => {
    const response = await api.get<Category[]>('/categories')
    return response.data // Backend returns an array directly
  },

  // Busca uma categoria pelo ID
  getById: async (id: number): Promise<Category> => {
    const response = await api.get<Category>(`/categories/${id}`)
    return response.data // Backend returns the category object directly
  },

  // Cria uma nova categoria
  create: async (data: CreateCategoryPayload): Promise<Category> => {
    const response = await api.post<Category>('/categories', data)
    return response.data // Backend returns the created category object
  },

  // Atualiza uma categoria existente
  update: async (id: number, data: Partial<CreateCategoryPayload>): Promise<Category> => {
    const response = await api.put<Category>(`/categories/${id}`, data)
    return response.data // Backend returns the updated category object
  },

  // Deleta uma categoria pelo ID
  delete: async (id: number): Promise<void> => {
    await api.delete(`/categories/${id}`)
    // Backend returns a 204 status with no content
  },
}
