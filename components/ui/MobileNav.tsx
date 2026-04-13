'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

export default function MobileNav() {
  const pathname = usePathname()

  const navItems = [
    {
      href: '/feed',
      label: 'Feed',
      icon: (active: boolean) => (
        <svg viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={1.8} className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      href: '/explore',
      label: 'Explore',
      icon: (active: boolean) => (
        <svg viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={1.8} className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      ),
    },
    {
      href: '/recipes/new',
      label: 'Create',
      icon: (_active: boolean) => (
        <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center shadow-apple -mt-4">
          <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2.5} className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
        </div>
      ),
    },
    {
      href: '/friends',
      label: 'Friends',
      icon: (active: boolean) => (
        <svg viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={1.8} className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
    },
    {
      href: '/profile',
      label: 'Profile',
      icon: (active: boolean) => (
        <svg viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={1.8} className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
    },
  ]

  return (
    <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-apple border-t border-border">
      <div className="flex items-end justify-around px-2 pb-safe">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/recipes/new' && item.href !== '/feed' && pathname.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center gap-0.5 py-2 px-3 min-w-0 transition-colors',
                item.href === '/recipes/new' ? 'pb-0' : '',
                isActive ? 'text-accent' : 'text-text-muted'
              )}
            >
              {item.icon(isActive)}
              {item.href !== '/recipes/new' && (
                <span className="text-[10px] font-medium truncate">{item.label}</span>
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
