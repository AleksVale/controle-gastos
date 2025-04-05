import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import CurrencyInput from 'react-currency-input-field'
import { Loader2, DollarSign, Calendar } from 'lucide-react'

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
import { useCreateExpense } from '@/hooks/use-expenses'
import { useQuery } from '@tanstack/react-query'
import { CategoryService } from '@/services/category-service'

const createExpenseSchema = z.object({
  amount: z.number().positive({ message: 'O valor deve ser maior que zero' }),
  description: z.string().optional(),
  date: z.string().nonempty({ message: 'A data é obrigatória' }),
  categoryId: z.string().nonempty({ message: 'A categoria é obrigatória' }),
  tags: z.array(z.string()).optional(),
})

type CreateExpenseFormValues = z.infer<typeof createExpenseSchema>

export default function CreateExpense() {
  const navigate = useNavigate()
  const { mutate: createExpense, isPending } = useCreateExpense()
  const [error, setError] = useState<string | null>(null)

  const { data: categories, isLoading: isLoadingCategories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const categories = await CategoryService.list()
      return categories
    },
  })

  const form = useForm<CreateExpenseFormValues>({
    resolver: zodResolver(createExpenseSchema),
    defaultValues: {
      amount: 0,
      description: '',
      date: new Date().toISOString().split('T')[0], // Data atual no formato YYYY-MM-DD
      categoryId: '',
      tags: [],
    },
  })

  const onSubmit = (data: CreateExpenseFormValues) => {
    setError(null)
    const correctedData = {
      ...data,
      date: new Date(data.date).toISOString(),
      amount: parseFloat(data.amount.toString()),
      categoryId: Number(data.categoryId),
    }
    createExpense(correctedData, {
      onSuccess: () => {
        navigate('/expenses')
      },
      onError: (err) => {
        setError('Não foi possível criar a despesa. Tente novamente.')
        console.error(err)
      },
    })
  }

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold">Nova Despesa</CardTitle>
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
                        <CurrencyInput
                          id="amount"
                          placeholder="Ex: R$ 100,00"
                          intlConfig={{ locale: 'pt-BR', currency: 'BRL' }}
                          decimalsLimit={2}
                          defaultValue={field.value}
                          onValueChange={(value) => {
                            field.onChange(Number(value?.replace(',', '.')))
                          }}
                          className="pl-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
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
                        defaultValue={field.value.toString()}
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

              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? (
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
