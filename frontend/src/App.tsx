import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Router } from './routes'
import { AuthProvider } from './providers/auth-provider'
import { ThemeProvider } from './providers/theme-provider'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Router />
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  )
}

export default App
