import { useState, useEffect } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  BarChart4,
  CreditCard,
  DollarSign,
  Home,
  LogOut,
  Menu,
  Settings,
  Tag,
  User,
  X,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { useAuthContext } from '@/providers/auth-provider'
import { ModeToggle } from '@/components/theme-toggle'
import { Skeleton } from '@/components/ui/skeleton'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ScrollArea } from '@/components/ui/scroll-area'
import { api } from '@/lib/axios'
import { useQuery } from '@tanstack/react-query'
import { formatCurrency } from '@/utils/format'
import { format } from 'date-fns'

export default function RootLayout() {
  const { user, logout } = useAuthContext()
  const location = useLocation()
  const navigate = useNavigate()
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  const [isOpen, setIsOpen] = useState(false)
  const { data: stats, isLoading } = useQuery({
    queryKey: ['summary'],
    queryFn: async () => {
      const response = await api.get('/expenses/summary')
      return response.data
    },
  })

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    setIsOpen(false)
  }, [location.pathname])

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((part) => part[0])
      .slice(0, 2)
      .join('')
      .toUpperCase()
  }

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: <Home className="size-5" /> },
    { path: '/expenses', label: 'Despesas', icon: <DollarSign className="size-5" /> },
    { path: '/categories', label: 'Categorias', icon: <Tag className="size-5" /> },
    { path: '/reports', label: 'Relatórios', icon: <BarChart4 className="size-5" /> },
    { path: '/settings', label: 'Configurações', icon: <Settings className="size-5" /> },
  ]

  const Sidebar = () => (
    <div className="flex h-full flex-col gap-4">
      <div className="flex h-14 items-center border-b px-4">
        <Link to="/dashboard" className="flex items-center gap-2 font-semibold">
          <CreditCard className="size-5 text-primary" />
          <span>Controle de Gastos</span>
        </Link>
      </div>

      <ScrollArea className="flex-1">
        <div className="flex flex-col gap-1 px-2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-muted/50 text-foreground/70 hover:text-foreground'
                }`
              }
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}
        </div>
      </ScrollArea>

      {!isLoading && stats && (
        <div className="border-t border-border/40 pt-4">
          <div className="grid gap-3 px-4">
            <div className="grid grid-cols-2 gap-2 rounded-lg border bg-card p-3 text-card-foreground">
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground">Total gasto</span>
                <span className="font-medium">{formatCurrency(stats.totalExpenses)}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground">Categorias</span>
                <span className="font-medium">{stats.categoryCount}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground">Última despesa</span>
                <span className="font-medium">
                  {stats.lastExpense ? formatCurrency(stats.lastExpense?.amount) : ''} -{' '}
                  {stats.lastExpense ? format(new Date(stats.lastExpense?.date), 'dd/MM/yyyy') : ''}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {isLoading && (
        <div className="border-t border-border/40 pt-4">
          <div className="grid gap-3 px-4">
            <Skeleton className="h-[74px] w-full rounded-lg" />
          </div>
        </div>
      )}

      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="" alt={user?.name || ''} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {user?.name ? getInitials(user.name) : '??'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col items-start text-sm">
                    <span className="font-medium leading-none">
                      {user?.name || 'Carregando...'}
                    </span>
                    <span className="text-xs leading-none text-muted-foreground">
                      {user?.email || ''}
                    </span>
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                <DropdownMenuItem onClick={() => navigate('/profile')}>
                  <User className="mr-2 size-4" />
                  Perfil
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/settings')}>
                  <Settings className="mr-2 size-4" />
                  Configurações
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={logout}
                >
                  <LogOut className="mr-2 size-4" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <ModeToggle />
        </div>
      </div>
    </div>
  )

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <aside className="hidden w-64 shrink-0 border-r border-border/40 md:block">
        <Sidebar />
      </aside>

      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild className="md:hidden">
          <Button variant="outline" size="icon" className="absolute left-4 top-3 z-50">
            <Menu className="size-5" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 pr-0" hidden={!isMobile}>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-3 md:hidden"
            onClick={() => setIsOpen(false)}
          >
            <X className="size-5" />
            <span className="sr-only">Close Menu</span>
          </Button>
          <Sidebar />
        </SheetContent>
      </Sheet>

      <div className="flex flex-1 flex-col">
        <header className="sticky top-0 z-10 flex h-14 items-center border-b bg-background/95 backdrop-blur px-4 md:px-6">
          <div className="flex w-full items-center justify-between md:justify-end">
            <div className="md:hidden">
              <CreditCard className="size-6 text-primary" />
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="hidden md:flex"
                onClick={() => navigate('/expenses/create')}
              >
                <DollarSign className="mr-2 size-4" />
                Nova despesa
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild className="md:hidden">
                  <Button size="icon" variant="ghost" className="rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {user?.name ? getInitials(user.name) : '??'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => navigate('/profile')}>
                    <User className="mr-2 size-4" />
                    Perfil
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/settings')}>
                    <Settings className="mr-2 size-4" />
                    Configurações
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={logout}
                  >
                    <LogOut className="mr-2 size-4" />
                    Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <ModeToggle />
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6">
          <Outlet />
        </main>

        <footer className="flex items-center justify-between border-t p-4 text-xs text-muted-foreground md:p-6">
          <p>© 2025 Controle de Gastos. Todos os direitos reservados.</p>
          <p>v1.0.0</p>
        </footer>
      </div>
    </div>
  )
}
