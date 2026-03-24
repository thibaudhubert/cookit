'use client'

import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useCurrentUser } from '@/lib/hooks/useCurrentUser'
import { createClient } from '@/lib/supabase/client'
import { LogOut, User } from 'lucide-react'

export function Navbar() {
  const { profile, loading } = useCurrentUser()
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  if (loading) {
    return (
      <nav className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="h-6 w-24 bg-gray-200 animate-pulse rounded"></div>
          </div>
        </div>
      </nav>
    )
  }

  const isActive = (path: string) => pathname === path

  return (
    <nav className="border-b border-gray-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/feed" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <span className="text-2xl">🍴</span>
            <span className="text-xl font-bold text-gray-900">Cookit</span>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-8">
            <Link
              href="/feed"
              className={`font-medium transition-colors ${
                isActive('/feed')
                  ? 'text-gray-900 border-b-2 border-gray-900 pb-1'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Feed
            </Link>
            <Link
              href="/explore"
              className={`font-medium transition-colors ${
                isActive('/explore')
                  ? 'text-gray-900 border-b-2 border-gray-900 pb-1'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Explore
            </Link>
            <Link
              href="/profile"
              className={`font-medium transition-colors ${
                isActive('/profile')
                  ? 'text-gray-900 border-b-2 border-gray-900 pb-1'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              My Profile
            </Link>
          </div>

          {/* User Section */}
          <div className="flex items-center gap-3">
            {/* Avatar */}
            <Link
              href="/profile"
              className="flex items-center justify-center w-9 h-9 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors"
              title={profile?.display_name || profile?.username || 'Profile'}
            >
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.display_name || profile.username}
                  className="w-9 h-9 rounded-full object-cover"
                />
              ) : (
                <User className="w-5 h-5 text-gray-600" />
              )}
            </Link>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
              title="Log out"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Log out</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
