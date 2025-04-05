import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, UserPlus, Mail, Lock, User } from 'lucide-react'
import { toast } from 'sonner'

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

const registerSchema = z
  .object({
    name: z.string().min(3, { message: 'Nome deve ter no mínimo 3 caracteres' }),
    email: z
      .string()
      .min(1, { message: 'Email é obrigatório' })
      .email({ message: 'Email inválido' }),
    password: z.string().min(6, { message: 'Senha deve ter no mínimo 6 caracteres' }),
    confirmPassword: z.string().min(1, { message: 'Confirmação de senha é obrigatória' }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não conferem',
    path: ['confirmPassword'],
  })

type RegisterFormValues = z.infer<typeof registerSchema>

export default function Register() {
  const { register } = useAuthContext()
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  })

  async function onSubmit(data: RegisterFormValues) {
    setIsLoading(true)
    setError(null)

    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { confirmPassword, ...userData } = data

      await register(userData)
      setSuccess(true)

      setTimeout(() => {
        navigate('/auth/login')
      }, 2000)
    } catch (err) {
      if (err instanceof Error) {
        if (err.message.includes('409')) {
          setError('Este email já está sendo utilizado. Tente outro ou faça login.')
        } else {
          setError('Não foi possível criar sua conta. Por favor, tente novamente.')
        }
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
          <CardTitle className="text-2xl font-bold text-center">Criar conta</CardTitle>
          <CardDescription className="text-center">
            Preencha os dados abaixo para criar sua conta
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4 p-6">
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="mb-4 border-green-500 bg-green-50 text-green-800 dark:bg-green-950 dark:text-green-300">
              <AlertDescription>
                Conta criada com sucesso! Redirecionando para o login...
              </AlertDescription>
            </Alert>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5" noValidate>
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome</FormLabel>
                    <div className="relative">
                      <FormControl>
                        <Input
                          placeholder="Seu nome completo"
                          type="text"
                          autoComplete="name"
                          disabled={isLoading || success}
                          className={cn(
                            'pl-10 py-6',
                            form.formState.errors.name && 'ring-destructive border-destructive',
                          )}
                          {...field}
                        />
                      </FormControl>
                      <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
                          disabled={isLoading || success}
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
                    <FormLabel>Senha</FormLabel>
                    <div className="relative">
                      <FormControl>
                        <Input
                          placeholder="******"
                          type="password"
                          autoComplete="new-password"
                          disabled={isLoading || success}
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

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirme sua senha</FormLabel>
                    <div className="relative">
                      <FormControl>
                        <Input
                          placeholder="******"
                          type="password"
                          autoComplete="new-password"
                          disabled={isLoading || success}
                          className={cn(
                            'pl-10 py-6',
                            form.formState.errors.confirmPassword &&
                              'ring-destructive border-destructive',
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

              {form.formState.errors.confirmPassword && toast.error('As senhas não coincidem.')}

              <Button
                type="submit"
                className="w-full py-6 text-base font-medium cursor-pointer"
                disabled={isLoading || success}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Criando conta...
                  </>
                ) : (
                  <>
                    <UserPlus className="mr-2 h-5 w-5" />
                    Criar conta
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>

        <CardFooter className="flex flex-col gap-4 border-t bg-muted/30 p-6">
          <div className="text-center text-sm">
            Já tem uma conta?{' '}
            <Link to="/auth/login" className="font-medium text-primary hover:underline">
              Faça login
            </Link>
          </div>
        </CardFooter>
      </Card>

      <p className="mt-8 text-center text-sm text-muted-foreground">
        &copy; 2025 Controle de Gastos. Todos os direitos reservados.
      </p>
    </div>
  )
}
