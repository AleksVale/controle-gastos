import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { ExpenseService } from '@/services/expense-service'
import { CategoryService } from '@/services/category-service'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Bar } from 'react-chartjs-2'
import { format, subMonths } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { formatCurrency } from '@/utils/format'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

interface ChartData {
  labels: string[]
  datasets: {
    label: string
    data: number[]
    backgroundColor: string
    borderColor: string
    borderWidth: number
  }[]
}

export default function Dashboard() {
  const [chartData, setChartData] = useState<ChartData | null>(null)
  const [isLoadingChart, setIsLoadingChart] = useState(true)

  const { data: totalExpenses, isLoading: isLoadingTotalExpenses } = useQuery({
    queryKey: ['totalExpenses'],
    queryFn: async () => {
      const total = await ExpenseService.getTotalExpenses()
      return total
    },
    retry: false,
  })

  const { data: categoryCount, isLoading: isLoadingCategoryCount } = useQuery({
    queryKey: ['categoryCount'],
    queryFn: async () => {
      const categories = await CategoryService.list()
      return categories.length
    },
    retry: false,
  })

  useEffect(() => {
    const fetchChartData = async () => {
      setIsLoadingChart(true)
      try {
        const endDate = new Date()
        endDate.setDate(endDate.getDate() + 1) // Adiciona 1 dia à data final
        const startDate = subMonths(endDate, 6)

        // Busca as despesas no intervalo de datas
        const expensesResponse = await ExpenseService.getExpensesByDateRange(startDate, endDate)
        const expenses = expensesResponse // Certifique-se de que está acessando os dados corretamente

        if (!expenses || expenses.meta.total === 0) {
          console.warn('Nenhuma despesa encontrada no intervalo de datas.')
          setChartData(null)
          return
        }

        const labels: string[] = []
        const data: number[] = []

        let currentDate = startDate
        while (currentDate <= endDate) {
          const formattedDate = format(currentDate, 'MMMM yyyy', { locale: ptBR }) // Formata como "Mês Ano"
          labels.push(formattedDate)

          const monthTotal = expenses.data
            .filter((expense) => {
              const expenseDate = new Date(expense.date)
              return (
                expenseDate.getFullYear() === currentDate.getFullYear() &&
                expenseDate.getMonth() === currentDate.getMonth()
              )
            })
            .reduce((acc, expense) => acc + expense.amount, 0)

          data.push(monthTotal)
          currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
        }
        console.log(data)
        setChartData({
          labels,
          datasets: [
            {
              label: 'Despesas por mês',
              data,
              backgroundColor: 'rgba(75,192,192,0.2)',
              borderColor: 'rgba(75,192,192,1)',
              borderWidth: 1,
            },
          ],
        })
      } catch (error) {
        console.error('Erro ao buscar dados do gráfico:', error)
        setChartData(null)
      } finally {
        setIsLoadingChart(false)
      }
    }

    fetchChartData()
  }, [])

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Despesas nos últimos 6 meses',
      },
    },
  }

  return (
    <div className="grid gap-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Total de Despesas</CardTitle>
            <CardDescription>Valor total gasto até o momento</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingTotalExpenses ? (
              <Skeleton className="h-10 w-32" />
            ) : (
              <div className="text-2xl font-bold">{formatCurrency(totalExpenses ?? 0.0)}</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Número de Categorias</CardTitle>
            <CardDescription>Total de categorias cadastradas</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingCategoryCount ? (
              <Skeleton className="h-10 w-32" />
            ) : (
              <div className="text-2xl font-bold">{categoryCount || '0'}</div>
            )}
          </CardContent>
        </Card>

        <Card className="hidden md:flex">
          <CardHeader>
            <CardTitle>Dica Financeira</CardTitle>
            <CardDescription>Uma dica para economizar</CardDescription>
          </CardHeader>
          <CardContent>Economize 10% do seu salário todo mês e invista em algo seguro.</CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Gráfico de Despesas</CardTitle>
          <CardDescription>Despesas mensais nos últimos 6 meses</CardDescription>
        </CardHeader>
        <CardContent className="max-w-3/4 overflow-hidden">
          {isLoadingChart ? (
            <Skeleton className="h-64 w-full" />
          ) : chartData ? (
            <div className="relative- w-full">
              <Bar options={chartOptions} data={chartData} />
            </div>
          ) : (
            <div>Nenhum dado disponível para o gráfico.</div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
