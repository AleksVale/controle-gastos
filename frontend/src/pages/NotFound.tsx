import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <h1 className="text-4xl font-bold">404</h1>
      <p className="mt-2 text-lg">Página não encontrada</p>
      <Button asChild className="mt-4">
        <Link to="/">Voltar para a página inicial</Link>
      </Button>
    </div>
  )
}
