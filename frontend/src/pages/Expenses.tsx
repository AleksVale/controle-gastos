import { useState } from 'react'
import { useDeleteExpense, useExpenses } from '@/hooks/use-expenses'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { Plus, Edit, Trash } from 'lucide-react'
import { toast } from 'sonner'
import { formatCurrency } from '@/utils/format'
import { useQuery } from '@tanstack/react-query'
import { CategoryService } from '@/services/category-service'

export default function Expenses() {
  const navigate = useNavigate()
  const initialFilters = {
    startDate: '',
    endDate: '',
    categoryId: '',
    minAmount: '',
    maxAmount: '',
    description: '',
  }
  const [filters, setFilters] = useState(initialFilters)

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const categories = await CategoryService.list()
      return categories
    },
  })

  const {
    data: expenses,
    isLoading,
    isError,
  } = useExpenses({
    ...filters,
    categoryId: filters.categoryId ? Number(filters.categoryId) : undefined,
    minAmount: filters.minAmount ? Number(filters.minAmount) : undefined,
    maxAmount: filters.maxAmount ? Number(filters.maxAmount) : undefined,
    startDate: filters.startDate ? new Date(filters.startDate).toISOString() : undefined,
    endDate: filters.endDate ? new Date(filters.endDate).toISOString() : undefined,
  })
  const { mutate: deleteExpense } = useDeleteExpense()

  const handleEdit = (id: number) => {
    navigate(`/expenses/edit/${id}`)
  }

  const handleDelete = (id: number) => {
    toast.promise(
      new Promise((resolve, reject) => {
        if (confirm('Tem certeza que deseja excluir esta despesa?')) {
          deleteExpense(id, {
            onSuccess: () => resolve('Despesa excluída com sucesso!'),
            onError: () => reject('Erro ao excluir a despesa. Tente novamente.'),
          })
        } else {
          reject('Ação cancelada.')
        }
      }),
      {
        loading: 'Excluindo despesa...',
        success: (message) => message as React.ReactNode,
        error: (message) => message,
      },
    )
  }

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const handleClearFilters = () => {
    setFilters(initialFilters)
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Despesas</h1>
        <Button onClick={() => navigate('/expenses/create')}>
          <Plus className="mr-2 h-5 w-5" />
          Nova Despesa
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Input
          type="date"
          placeholder="Data Inicial"
          value={filters.startDate}
          onChange={(e) => handleFilterChange('startDate', e.target.value)}
        />
        <Input
          type="date"
          placeholder="Data Final"
          value={filters.endDate}
          onChange={(e) => handleFilterChange('endDate', e.target.value)}
        />
        <Select
          onValueChange={(value) => handleFilterChange('categoryId', value)}
          value={filters.categoryId}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent className="w-full">
            {categories?.map((category) => (
              <SelectItem key={category.id} value={category.id.toString()}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          type="number"
          placeholder="Valor Mínimo"
          value={filters.minAmount}
          onChange={(e) => handleFilterChange('minAmount', e.target.value)}
        />
        <Input
          type="number"
          placeholder="Valor Máximo"
          value={filters.maxAmount}
          onChange={(e) => handleFilterChange('maxAmount', e.target.value)}
        />
        <Input
          type="text"
          placeholder="Descrição"
          value={filters.description}
          onChange={(e) => handleFilterChange('description', e.target.value)}
        />
      </div>

      <div className="flex justify-end mb-6">
        <Button variant="outline" onClick={handleClearFilters}>
          Limpar Filtros
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, index) => (
            <Skeleton key={index} className="h-28 w-full rounded-lg" />
          ))}
        </div>
      ) : isError ? (
        <p className="text-red-500">Erro ao carregar despesas. Tente novamente mais tarde.</p>
      ) : expenses?.data.length === 0 ? (
        <p className="text-muted-foreground">Nenhuma despesa encontrada.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {expenses?.data.map((expense) => (
            <Card
              key={expense.id}
              className="flex flex-col shadow-md hover:shadow-lg transition-shadow"
            >
              <CardHeader className="pb-2 flex items-center gap-2">
                {expense.category?.color && (
                  <span
                    className="h-5 w-5 rounded-full border border-muted"
                    style={{ backgroundColor: expense.category.color }}
                  />
                )}
                <CardTitle className="text-lg font-semibold text-primary">
                  {expense.description || 'Sem descrição'}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 space-y-1">
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">Valor:</span>{' '}
                  {formatCurrency(expense.amount)}
                </p>
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">Data:</span>{' '}
                  {format(new Date(expense.date), 'dd/MM/yyyy')}
                </p>
                {expense.category && (
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">Categoria:</span>{' '}
                    {expense.category.name}
                  </p>
                )}
              </CardContent>
              <div className="flex justify-end gap-2 p-3 border-t">
                <Button variant="ghost" size="icon" onClick={() => handleEdit(expense.id)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="destructive" size="icon" onClick={() => handleDelete(expense.id)}>
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
