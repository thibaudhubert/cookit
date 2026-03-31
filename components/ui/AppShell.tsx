import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface AppShellProps {
  children: ReactNode
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'
  className?: string
}

const maxWidthClasses = {
  sm: 'max-w-2xl',
  md: 'max-w-4xl',
  lg: 'max-w-5xl',
  xl: 'max-w-6xl',
  '2xl': 'max-w-7xl',
  full: 'max-w-full',
}

export default function AppShell({ children, maxWidth = 'lg', className }: AppShellProps) {
  return (
    <div className="min-h-screen bg-app">
      <main className={cn(maxWidthClasses[maxWidth], 'mx-auto px-4 sm:px-6 lg:px-8 py-8', className)}>
        {children}
      </main>
    </div>
  )
}
