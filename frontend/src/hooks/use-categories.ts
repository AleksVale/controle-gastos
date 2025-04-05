import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { categoryService } from '@/services/category-service'

interface CreateCategoryPayload {
  name: string
  color?: string
  icon?: string
  isDefault?: boolean
}

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryService.list(),
  })
}

export function useCategoryById(id: number | undefined) {
  return useQuery({
    queryKey: ['category', id],
    queryFn: () => (id ? categoryService.getById(id) : Promise.reject('No ID provided')),
    enabled: !!id,
  })
}

export function useCreateCategory() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: CreateCategoryPayload) => categoryService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
    },
  })
}

export function useUpdateCategory(id: number) {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: Partial<CreateCategoryPayload>) => categoryService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      queryClient.invalidateQueries({ queryKey: ['category', id] })
    },
  })
}

export function useDeleteCategory() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: number) => categoryService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
    },
  })
}