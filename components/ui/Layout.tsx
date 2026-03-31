import { ReactNode } from 'react'

interface LayoutProps {
  header: ReactNode
  children: ReactNode
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'
}

const maxWidthClasses = {
  sm: 'max-w-2xl',
  md: 'max-w-4xl',
  lg: 'max-w-5xl',
  xl: 'max-w-6xl',
  '2xl': 'max-w-7xl',
  full: 'max-w-full',
}

export default function Layout({ header, children, maxWidth = 'lg' }: LayoutProps) {
  return (
    <div className="min-h-screen bg-app">
      {/* Apple-style header: white, opaque, with subtle shadow */}
      <header className="bg-white/95 backdrop-blur-apple border-b border-border sticky top-0 z-50 shadow-sm">
        <div className={`${maxWidthClasses[maxWidth]} mx-auto px-4 sm:px-6 lg:px-8`}>
          {header}
        </div>
      </header>

      {/* Main content with generous spacing */}
      <main className={`${maxWidthClasses[maxWidth]} mx-auto px-4 sm:px-6 lg:px-8 py-12`}>
        {children}
      </main>
    </div>
  )
}
