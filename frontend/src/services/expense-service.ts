import { api } from '@/lib/axios'
import { Expense, PaginatedResponse } from '@/types/api'

interface ExpenseFilters {
  page?: number
  perPage?: number
  startDate?: string
  endDate?: string
  categoryId?: number
  minAmount?: number
  maxAmount?: number
  description?: string
}

interface CreateExpensePayload {
  amount: number
  description?: string
  date?: string
  categoryId?: number
  tagIds?: number[]
}

type UpdateExpensePayload = Partial<CreateExpensePayload>

export const ExpenseService = {
  // Lista todas as despesas com filtros opcionais
  list: async (filters: ExpenseFilters = {}): Promise<PaginatedResponse<Expense>> => {
    const response = await api.get<PaginatedResponse<Expense>>('/expenses', { params: filters })
    return response.data
  },

  // Busca uma despesa pelo ID
  getById: async (id: number): Promise<Expense> => {
    const response = await api.get<Expense>(`/expenses/${id}`)
    return response.data
  },

  // Cria uma nova despesa
  create: async (data: CreateExpensePayload): Promise<Expense> => {
    const response = await api.post<Expense>('/expenses', data)
    return response.data
  },

  // Atualiza uma despesa existente
  update: async (id: number, data: UpdateExpensePayload): Promise<Expense> => {
    const response = await api.put<Expense>(`/expenses/${id}`, data)
    return response.data
  },

  // Deleta uma despesa pelo ID
  delete: async (id: number): Promise<void> => {
    await api.delete(`/expenses/${id}`)
  },

  // Obtém o total de despesas
  getTotalExpenses: async (): Promise<number> => {
    const response = await api.get<{ total: number }>('/expenses/total')
    return response.data.total
  },

  // Obtém despesas dentro de um intervalo de datas
  getExpensesByDateRange: async (
    startDate: Date,
    endDate: Date,
  ): Promise<PaginatedResponse<Expense>> => {
    const response = await api.get<PaginatedResponse<Expense>>('/expenses', {
      params: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        perPage: 1000, // Ajuste o limite conforme necessário
      },
    })
    return response.data
  },
}
