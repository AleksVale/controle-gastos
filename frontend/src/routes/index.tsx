import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom'
import { Suspense, lazy } from 'react'

// Layouts
import RootLayout from '@/layouts/RootLayout'
import AuthLayout from '@/layouts/AuthLayout'

// Auth protection
import { ProtectedRoute, PublicRoute } from '@/components/protected-route'
import Profile from '@/pages/Profile'

// Pages (lazy-loaded)
const Dashboard = lazy(() => import('@/pages/Dashboard'))
const Login = lazy(() => import('@/pages/Login'))
const Register = lazy(() => import('@/pages/Register'))
const Expenses = lazy(() => import('@/pages/Expenses'))
const CreateExpense = lazy(() => import('@/pages/CreateExpense'))
const EditExpense = lazy(() => import('@/pages/EditExpense')) // Import the EditExpense page
const Categories = lazy(() => import('@/pages/Categories'))
const NotFound = lazy(() => import('@/pages/NotFound'))
const Reports = lazy(() => import('@/pages/Reports'))

// Loading component for suspense fallback
const Loading = () => (
  <div className="flex h-screen items-center bg-background justify-center">Loading...</div>
)

const router = createBrowserRouter([
  // Protected Routes (requires authentication)
  {
    path: '/',
    element: <ProtectedRoute />,
    children: [
      {
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
            children: [
              {
                index: true,
                element: (
                  <Suspense fallback={<Loading />}>
                    <Expenses />
                  </Suspense>
                ),
              },
              {
                path: 'create',
                element: (
                  <Suspense fallback={<Loading />}>
                    <CreateExpense />
                  </Suspense>
                ),
              },
              {
                path: 'edit/:id',
                element: (
                  <Suspense fallback={<Loading />}>
                    <EditExpense />
                  </Suspense>
                ),
              },
            ],
          },
          {
            path: 'categories',
            element: (
              <Suspense fallback={<Loading />}>
                <Categories />
              </Suspense>
            ),
          },
          {
            path: 'profile',
            element: (
              <Suspense fallback={<Loading />}>
                <Profile />
              </Suspense>
            ),
          },
          {
            path: 'reports',
            element: (
              <Suspense fallback={<Loading />}>
                <Reports />
              </Suspense>
            ),
          },
        ],
      },
    ],
  },

  // Public Routes (no authentication required)
  {
    path: '/auth',
    element: <PublicRoute />,
    children: [
      {
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

  // Fallback for undefined routes
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
