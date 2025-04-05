import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, DollarSign, Calendar } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useExpenseById, useUpdateExpense } from '@/hooks/use-expenses'
import { useQuery } from '@tanstack/react-query'
import { CategoryService } from '@/services/category-service'

const editExpenseSchema = z.object({
  amount: z.number().positive({ message: 'O valor deve ser maior que zero' }),
  description: z.string().optional(),
  date: z.string().nonempty({ message: 'A data é obrigatória' }),
  categoryId: z.string().nonempty({ message: 'A categoria é obrigatória' }),
})

type EditExpenseFormValues = z.infer<typeof editExpenseSchema>

export default function EditExpense() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: expense, isLoading: isLoadingExpense } = useExpenseById(Number(id))
  const { mutate: updateExpense, isPending: isUpdating } = useUpdateExpense(Number(id))
  const [error, setError] = useState<string | null>(null)

  const { data: categories, isLoading: isLoadingCategories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const categories = await CategoryService.list()
      return categories
    },
  })

  const form = useForm<EditExpenseFormValues>({
    resolver: zodResolver(editExpenseSchema),
    defaultValues: {
      amount: 0,
      description: '',
      date: '',
      categoryId: '',
    },
  })

  useEffect(() => {
    if (expense) {
      form.reset({
        amount: expense.amount,
        description: expense.description || '',
        date: expense.date.split('T')[0], // Format date to YYYY-MM-DD
        categoryId: expense.categoryId?.toString() || '',
      })
    }
  }, [expense, form])

  const onSubmit = (data: EditExpenseFormValues) => {
    setError(null)
    const correctedData = {
      ...data,
      date: new Date(data.date).toISOString(),
      amount: parseFloat(data.amount.toString()),
      categoryId: Number(data.categoryId),
    }

    updateExpense(correctedData, {
      onSuccess: () => {
        navigate('/expenses')
      },
      onError: (err) => {
        toast.error('Não foi possível atualizar a despesa. Tente novamente.')
        console.error(err)
      },
    })
  }

  if (isLoadingExpense) {
    return <p>Carregando despesa...</p>
  }

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold">Editar Despesa</CardTitle>
        </CardHeader>
        <CardContent>
          {error && <p className="mb-4 text-sm text-red-500">{error}</p>}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type="number"
                          placeholder="Ex: 100.00"
                          {...field}
                          className="pl-10"
                        />
                        <DollarSign className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Ex: Almoço no restaurante" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} className="pl-10" />
                    </FormControl>
                    <Calendar className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoria</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={isLoadingCategories}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Selecione uma categoria" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories?.map((category) => (
                            <SelectItem key={category.id} value={category.id.toString()}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={isUpdating}>
                {isUpdating ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  'Salvar'
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
