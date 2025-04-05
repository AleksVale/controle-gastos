import { api } from '@/lib/axios'

export const ReportService = {
  async fetchExpenses() {
    const response = await api.get('/expenses')
    return response.data
  },

  async fetchCategories() {
    const response = await api.get('/categories')
    return response.data
  },

  async fetchSummary() {
    const response = await api.get('/expenses/summary')
    return response.data
  },
}
