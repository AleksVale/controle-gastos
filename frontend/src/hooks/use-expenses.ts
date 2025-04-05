import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ExpenseService } from '@/services/expense-service'

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

export function useExpenses(filters: ExpenseFilters = {}) {
  return useQuery({
    queryKey: ['expenses', filters],
    queryFn: () => ExpenseService.list(filters),
  })
}

export function useExpenseById(id: number | undefined) {
  return useQuery({
    queryKey: ['expense', id],
    queryFn: () => (id ? ExpenseService.getById(id) : Promise.reject('No ID provided')),
    enabled: !!id,
  })
}

export function useCreateExpense() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateExpensePayload) => ExpenseService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] })
      queryClient.invalidateQueries({ queryKey: ['summary'] })
    },
  })
}

export function useUpdateExpense(id: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: Partial<CreateExpensePayload>) => ExpenseService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] })
      queryClient.invalidateQueries({ queryKey: ['summary'] })
      queryClient.invalidateQueries({ queryKey: ['expense', id] })
    },
  })
}

export function useDeleteExpense() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => ExpenseService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] })
      queryClient.invalidateQueries({ queryKey: ['summary'] })
    },
  })
}
