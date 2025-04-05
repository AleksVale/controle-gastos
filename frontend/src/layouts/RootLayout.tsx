import { Outlet } from 'react-router-dom'
import { ModeToggle } from '@/components/theme-toggle'

export default function RootLayout() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-bold">Controle de Gastos</h1>
          <nav className="flex items-center gap-4">
            {/* Navigation elements will go here */}
            <ModeToggle />
          </nav>
        </div>
      </header>

      <main className="p-4">
        <Outlet />
      </main>

      <footer className="border-t p-4 text-center text-sm text-muted-foreground">
        © 2025 Controle de Gastos
      </footer>
    </div>
  )
}
