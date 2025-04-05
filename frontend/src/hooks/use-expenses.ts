import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { expenseService } from '@/services/expense-service'

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

export function useExpenses(filters: ExpenseFilters = {}) {
  return useQuery({
    queryKey: ['expenses', filters],
    queryFn: () => expenseService.list(filters),
  })
}

export function useExpenseById(id: number | undefined) {
  return useQuery({
    queryKey: ['expense', id],
    queryFn: () => (id ? expenseService.getById(id) : Promise.reject('No ID provided')),
    enabled: !!id,
  })
}

export function useCreateExpense() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: CreateExpensePayload) => expenseService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] })
    },
  })
}

export function useUpdateExpense(id: number) {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: Partial<CreateExpensePayload>) => expenseService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] })
      queryClient.invalidateQueries({ queryKey: ['expense', id] })
    },
  })
}

export function useDeleteExpense() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: number) => expenseService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] })
    },
  })
}