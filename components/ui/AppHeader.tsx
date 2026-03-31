'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import NotificationBell from '@/components/NotificationBell'

interface AppHeaderProps {
  onSignOut?: () => void
}

export default function AppHeader({ onSignOut }: AppHeaderProps) {
  const pathname = usePathname()

  const navItems = [
    { href: '/feed', label: 'Feed' },
    { href: '/explore', label: 'Explore' },
    { href: '/profile', label: 'Profile' },
  ]

  return (
    <div className="flex items-center justify-between py-3">
      {/* Logo with Apple-style weight */}
      <Link href="/feed" className="flex items-center gap-2.5 hover:opacity-70 transition-opacity">
        <span className="text-2xl">🍴</span>
        <span className="text-xl font-semibold text-text-primary tracking-tight">Cookit</span>
      </Link>

      {/* Navigation with Apple-style spacing and hover */}
      <nav className="flex items-center gap-8">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'text-sm font-medium transition-all duration-200',
              pathname === item.href
                ? 'text-accent font-semibold'
                : 'text-text-secondary hover:text-text-primary'
            )}
          >
            {item.label}
          </Link>
        ))}

        <NotificationBell />

        {onSignOut && (
          <button
            onClick={onSignOut}
            className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
          >
            Sign Out
          </button>
        )}
      </nav>
    </div>
  )
}
