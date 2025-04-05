import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom'
import { Suspense, lazy } from 'react'

// Layouts
import RootLayout from '@/layouts/RootLayout'
import AuthLayout from '@/layouts/AuthLayout'

// Auth protection
import { ProtectedRoute, PublicRoute } from '@/components/protected-route'

// Pages (lazy-loaded)
const Dashboard = lazy(() => import('@/pages/Dashboard'))
const Login = lazy(() => import('@/pages/Login'))
const Register = lazy(() => import('@/pages/Register'))
const Expenses = lazy(() => import('@/pages/Expenses'))
const Categories = lazy(() => import('@/pages/Categories'))
const NotFound = lazy(() => import('@/pages/NotFound'))

// Loading component for suspense fallback
const Loading = () => (
  <div className="flex h-screen items-center bg-background justify-center">Loading...</div>
)

const router = createBrowserRouter([
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: '/',
        element: <RootLayout />,
        children: [
          { index: true, element: <Navigate to="/dashboard" replace /> },
          {
            path: 'dashboard',
            element: (
              <Suspense fallback={<Loading />}>
                <Dashboard />
              </Suspense>
            ),
          },
          {
            path: 'expenses',
            element: (
              <Suspense fallback={<Loading />}>
                <Expenses />
              </Suspense>
            ),
          },
          {
            path: 'categories',
            element: (
              <Suspense fallback={<Loading />}>
                <Categories />
              </Suspense>
            ),
          },
        ],
      },
    ],
  },
  {
    element: <PublicRoute />,
    children: [
      {
        path: '/auth',
        element: <AuthLayout />,
        children: [
          { index: true, element: <Navigate to="/auth/login" replace /> },
          {
            path: 'login',
            element: (
              <Suspense fallback={<Loading />}>
                <Login />
              </Suspense>
            ),
          },
          {
            path: 'register',
            element: (
              <Suspense fallback={<Loading />}>
                <Register />
              </Suspense>
            ),
          },
        ],
      },
    ],
  },
  {
    path: '*',
    element: (
      <Suspense fallback={<Loading />}>
        <NotFound />
      </Suspense>
    ),
  },
])

export function Router() {
  return <RouterProvider router={router} />
}
