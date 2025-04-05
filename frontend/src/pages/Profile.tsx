import { useQuery } from '@tanstack/react-query'
import { useAuthContext } from '@/providers/auth-provider'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useNavigate } from 'react-router-dom'
import { api } from '@/lib/axios'

interface UserProfile {
  id: number
  name: string
  email: string
  createdAt: string
}

export default function Profile() {
  const { logout } = useAuthContext()
  const navigate = useNavigate()

  const {
    data: profile,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['profile'],
    queryFn: async (): Promise<UserProfile> => {
      const response = await api.get('/profile')
      return response.data
    },
  })

  const handleLogout = () => {
    logout()
    navigate('/auth/login')
  }

  return (
    <div className="p-6 flex flex-col items-center">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold">Meu Perfil</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-8 w-3/4 mx-auto" />
              <Skeleton className="h-6 w-1/2 mx-auto" />
              <Skeleton className="h-6 w-1/3 mx-auto" />
            </div>
          ) : isError ? (
            <p className="text-center text-red-500">Erro ao carregar perfil. Tente novamente.</p>
          ) : (
            <div className="space-y-4 text-center">
              <div>
                <p className="text-lg font-medium text-muted-foreground">Nome</p>
                <p className="text-xl font-bold text-primary">{profile?.name}</p>
              </div>
              <div>
                <p className="text-lg font-medium text-muted-foreground">Email</p>
                <p className="text-xl font-bold text-primary">{profile?.email}</p>
              </div>
              <div>
                <p className="text-lg font-medium text-muted-foreground">Conta criada em</p>
                <p className="text-xl font-bold text-primary">
                  {new Date(profile?.createdAt ?? '').toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="mt-6">
        <Button variant="destructive" onClick={handleLogout}>
          Sair da Conta
        </Button>
      </div>
    </div>
  )
}
