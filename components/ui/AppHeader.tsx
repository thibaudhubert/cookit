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
    { href: '/friends', label: 'Friends' },
    { href: '/profile', label: 'Profile' },
  ]

  return (
    <div className="flex items-center justify-between py-4">
      <Link href="/feed" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
        <span className="text-2xl">🍴</span>
        <span className="text-xl font-bold text-text-primary">Cookit</span>
      </Link>

      <nav className="flex items-center gap-6">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'text-sm font-medium transition-colors',
              pathname === item.href
                ? 'text-accent'
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
            className="text-sm text-text-secondary hover:text-text-primary transition-colors"
          >
            Sign Out
          </button>
        )}
      </nav>
    </div>
  )
}
