import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'sonner'
import jsPDF from 'jspdf'
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'
import { ReportService } from '@/services/report-service'
import { Category, Expense } from '@/types/api'

export default function Reports() {
  const [selectedOptions, setSelectedOptions] = useState<string[]>([])
  const [isExporting, setIsExporting] = useState(false)

  const { data: expenses, isLoading: isLoadingExpenses } = useQuery({
    queryKey: ['expenses'],
    queryFn: ReportService.fetchExpenses,
  })

  const { data: categories, isLoading: isLoadingCategories } = useQuery({
    queryKey: ['categories'],
    queryFn: ReportService.fetchCategories,
  })

  const { data: summary, isLoading: isLoadingSummary } = useQuery({
    queryKey: ['summary'],
    queryFn: ReportService.fetchSummary,
  })

  const reportOptions = [
    { id: 'expenses', label: 'Despesas' },
    { id: 'categories', label: 'Categorias' },
    { id: 'summary', label: 'Resumo' },
  ]

  const handleCheckboxChange = (id: string) => {
    setSelectedOptions((prev) =>
      prev.includes(id) ? prev.filter((option) => option !== id) : [...prev, id],
    )
  }

  const exportToPDF = async () => {
    setIsExporting(true)
    try {
      const doc = new jsPDF()

      selectedOptions.forEach((option, index) => {
        if (index > 0) doc.addPage()
        doc.setFontSize(16)
        doc.text(reportOptions.find((o) => o.id === option)?.label || '', 10, 10)

        if (option === 'expenses' && expenses) {
          expenses.data.forEach((expense: Expense, i: number) => {
            doc.text(
              `${i + 1}. ${expense.description || 'Sem descrição'} - R$ ${
                expense.amount
              } - ${new Date(expense.date).toLocaleDateString('pt-BR')}`,
              10,
              20 + i * 10,
            )
          })
        } else if (option === 'categories' && categories) {
          categories.forEach((category: Category, i: number) => {
            doc.text(`${i + 1}. ${category.name} - ${category.color}`, 10, 20 + i * 10)
          })
        } else if (option === 'summary' && summary) {
          doc.text(`Total de Despesas: R$ ${summary.totalExpenses}`, 10, 20)
          doc.text(`Número de Categorias: ${summary.categoryCount}`, 10, 30)
          doc.text(
            `Última Despesa: ${summary.lastExpense.description} - R$ ${summary.lastExpense.amount} - ${new Date(
              summary.lastExpense.date,
            ).toLocaleDateString('pt-BR')}`,
            10,
            40,
          )
        }
      })

      doc.save('relatorio.pdf')
      toast.success('Relatório exportado como PDF!')
    } catch (error) {
      console.error(error)
      toast.error('Erro ao exportar relatório como PDF.')
    } finally {
      setIsExporting(false)
    }
  }

  const exportToXLSX = async () => {
    setIsExporting(true)
    try {
      const workbook = XLSX.utils.book_new()

      selectedOptions.forEach((option) => {
        if (option === 'expenses' && expenses) {
          const worksheet = XLSX.utils.json_to_sheet(expenses.data)
          XLSX.utils.book_append_sheet(workbook, worksheet, 'Despesas')
        } else if (option === 'categories' && categories) {
          const worksheet = XLSX.utils.json_to_sheet(categories)
          XLSX.utils.book_append_sheet(workbook, worksheet, 'Categorias')
        } else if (option === 'summary' && summary) {
          const worksheet = XLSX.utils.json_to_sheet([summary])
          XLSX.utils.book_append_sheet(workbook, worksheet, 'Resumo')
        }
      })

      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
      const blob = new Blob([excelBuffer], { type: 'application/octet-stream' })
      saveAs(blob, 'relatorio.xlsx')
      toast.success('Relatório exportado como XLSX!')
    } catch (error) {
      console.error(error)
      toast.error('Erro ao exportar relatório como XLSX.')
    } finally {
      setIsExporting(false)
    }
  }

  const isLoading = isLoadingExpenses || isLoadingCategories || isLoadingSummary

  return (
    <div className="p-6">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold">Relatórios</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p>Carregando dados...</p>
          ) : (
            <div className="space-y-4">
              <p>Selecione os dados que deseja exportar:</p>
              {reportOptions.map((option) => (
                <div key={option.id} className="flex items-center gap-2">
                  <Checkbox
                    id={option.id}
                    checked={selectedOptions.includes(option.id)}
                    onCheckedChange={() => handleCheckboxChange(option.id)}
                  />
                  <label htmlFor={option.id}>{option.label}</label>
                </div>
              ))}

              <div className="flex gap-4 mt-4">
                <Button
                  onClick={exportToPDF}
                  disabled={isExporting || selectedOptions.length === 0}
                >
                  {isExporting ? 'Exportando...' : 'Exportar como PDF'}
                </Button>
                <Button
                  onClick={exportToXLSX}
                  disabled={isExporting || selectedOptions.length === 0}
                >
                  {isExporting ? 'Exportando...' : 'Exportar como XLSX'}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
