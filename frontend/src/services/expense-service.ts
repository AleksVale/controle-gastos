import { Expense, PaginatedResponse } from '@/types/api'
import { apiRequest } from '@/lib/axios'

interface ExpenseFilters {
  page?: number
  perPage?: number
  startDate?: string
  endDate?: string
  categoryId?: number
}

interface CreateExpensePayload {
  amount: number
  description?: string
  date?: string
  categoryId?: number
  tagIds?: number[]
}

export const expenseService = {
  list: async (filters: ExpenseFilters = {}): Promise<PaginatedResponse<Expense>> => {
    return apiRequest<PaginatedResponse<Expense>>({
      method: 'GET',
      url: '/expenses',
      params: filters,
    })
  },
  
  getById: async (id: number): Promise<Expense> => {
    return apiRequest<Expense>({
      method: 'GET',
      url: `/expenses/${id}`,
    })
  },
  
  create: async (data: CreateExpensePayload): Promise<Expense> => {
    return apiRequest<Expense>({
      method: 'POST',
      url: '/expenses',
      data,
    })
  },
  
  update: async (id: number, data: Partial<CreateExpensePayload>): Promise<Expense> => {
    return apiRequest<Expense>({
      method: 'PUT',
      url: `/expenses/${id}`,
      data,
    })
  },
  
  delete: async (id: number): Promise<void> => {
    return apiRequest<void>({
      method: 'DELETE',
      url: `/expenses/${id}`,
    })
  },
}