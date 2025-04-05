import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { CategoryService } from '@/services/category-service'

interface CreateCategoryPayload {
  name: string
  color?: string
  icon?: string
  isDefault?: boolean
}

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => CategoryService.list(),
  })
}

export function useCategoryById(id: number | undefined) {
  return useQuery({
    queryKey: ['category', id],
    queryFn: () => (id ? CategoryService.getById(id) : Promise.reject('No ID provided')),
    enabled: !!id,
  })
}

export function useCreateCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateCategoryPayload) => CategoryService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
    },
  })
}

export function useUpdateCategory(id: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: Partial<CreateCategoryPayload>) => CategoryService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      queryClient.invalidateQueries({ queryKey: ['category', id] })
    },
  })
}

export function useDeleteCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => CategoryService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
    },
  })
}
