import { ModeToggle } from '@/components/theme-toggle'
import { Outlet } from 'react-router-dom'

export default function AuthLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-background items-center justify-center">
      <div className="absolute right-4 top-4">
        <ModeToggle />
      </div>
      <div className="w-full max-w-md rounded-lg p-8 shadow-sm">
        <Outlet />
      </div>
    </div>
  )
}
