import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, LogIn, Mail, Lock } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useAuthContext } from '@/providers/auth-provider'
import { cn } from '@/lib/utils'

const loginSchema = z.object({
  email: z.string().min(1, { message: 'Email é obrigatório' }).email({ message: 'Email inválido' }),
  password: z.string().min(6, { message: 'Senha deve ter no mínimo 6 caracteres' }),
})

type LoginFormValues = z.infer<typeof loginSchema>

export default function Login() {
  const { login } = useAuthContext()
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  async function onSubmit(data: LoginFormValues) {
    setIsLoading(true)
    setError(null)

    try {
      await login(data)
      navigate('/dashboard')
    } catch (err) {
      if (err instanceof Error) {
        setError('Credenciais inválidas. Por favor, verifique seu email e senha.')
      } else {
        setError('Ocorreu um erro. Tente novamente mais tarde.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center bg-background to-background p-4">
      <Card className="w-full max-w-md overflow-hidden border-none shadow-lg">
        <div className="h-2 bg-gradient-to-r from-primary via-primary/80 to-primary/60" />
        <CardHeader className="space-y-1 pb-2 pt-6">
          <CardTitle className="text-2xl font-bold text-center">Acessar sua conta</CardTitle>
          <CardDescription className="text-center text-primary">
            Entre com suas credenciais para acessar o sistema
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4 p-6">
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <div className="relative">
                      <FormControl>
                        <Input
                          placeholder="seu@email.com"
                          type="email"
                          autoComplete="email"
                          disabled={isLoading}
                          className={cn(
                            'pl-10 py-6',
                            form.formState.errors.email && 'ring-destructive border-destructive',
                          )}
                          {...field}
                        />
                      </FormControl>
                      <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel>Senha</FormLabel>
                      <Link to="/auth/forgot-password" className="text-xs hover:underline">
                        Esqueceu a senha?
                      </Link>
                    </div>
                    <div className="relative">
                      <FormControl>
                        <Input
                          placeholder="******"
                          type="password"
                          autoComplete="current-password"
                          disabled={isLoading}
                          className={cn(
                            'pl-10 py-6',
                            form.formState.errors.password && 'ring-destructive border-destructive',
                          )}
                          {...field}
                        />
                      </FormControl>
                      <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full py-6 text-base font-medium cursor-pointer"
                disabled={isLoading}
                variant={'outline'}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Entrando...
                  </>
                ) : (
                  <>
                    <LogIn className="mr-2 h-5 w-5" />
                    Entrar
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>

        <CardFooter className="flex flex-col gap-4 border-t bg-muted/30 p-6">
          <div className="text-center text-sm">
            Não tem uma conta?{' '}
            <Link to="/auth/register" className="font-medium text-primary hover:underline">
              Criar conta
            </Link>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
          </div>
        </CardFooter>
      </Card>

      <p className="mt-8 text-center text-sm text-muted-foreground">
        &copy; 2025 Controle de Gastos. Todos os direitos reservados.
      </p>
    </div>
  )
}
