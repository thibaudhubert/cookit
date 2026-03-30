'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function NotificationBell() {
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    const supabase = createClient()

    // Fetch initial unread count
    const fetchUnreadCount = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      const { count } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('recipient_id', user.id)
        .eq('read', false)

      setUnreadCount(count || 0)
    }

    fetchUnreadCount()

    // Subscribe to realtime notifications
    const setupRealtimeSubscription = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      const channel = supabase
        .channel('notifications')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `recipient_id=eq.${user.id}`,
          },
          () => {
            // New notification received, increment count
            setUnreadCount((prev) => prev + 1)
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'notifications',
            filter: `recipient_id=eq.${user.id}`,
          },
          () => {
            // Notification updated (likely marked as read), refetch count
            fetchUnreadCount()
          }
        )
        .subscribe()

      return channel
    }

    const channelPromise = setupRealtimeSubscription()

    // Cleanup subscription on unmount
    return () => {
      channelPromise.then((channel) => {
        if (channel) {
          supabase.removeChannel(channel)
        }
      })
    }
  }, [])

  return (
    <Link href="/notifications" className="relative">
      <div className="relative">
        {/* Bell Icon */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-6 h-6 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
          />
        </svg>

        {/* Unread Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-xs font-bold text-white bg-red-500 rounded-full">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </div>
    </Link>
  )
}
