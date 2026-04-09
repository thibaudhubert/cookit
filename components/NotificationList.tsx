'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { timeAgo } from '@/lib/utils/timeAgo'

interface Notification {
  id: string
  actor_id: string
  type: string
  recipe_id: string | null
  read: boolean
  created_at: string
  actor: {
    username: string
    display_name: string | null
    avatar_url: string | null
  }
  recipe?: {
    title: string
  } | null
}

interface NotificationListProps {
  notifications: Notification[]
  userId: string
}

export default function NotificationList({ notifications: initialNotifications, userId }: NotificationListProps) {
  const router = useRouter()
  const [notifications, setNotifications] = useState(initialNotifications)
  const [isMarkingAllRead, setIsMarkingAllRead] = useState(false)

  const getNotificationMessage = (notification: Notification): string => {
    const actorName = notification.actor.display_name || notification.actor.username

    switch (notification.type) {
      case 'like':
        return `${actorName} liked your recipe "${notification.recipe?.title}"`
      case 'comment':
        return `${actorName} commented on your recipe "${notification.recipe?.title}"`
      case 'friend_request':
        return `${actorName} sent you a friend request`
      case 'friend_accepted':
        return `${actorName} accepted your friend request`
      default:
        return `${actorName} interacted with your content`
    }
  }

  const getNotificationLink = (notification: Notification): string => {
    switch (notification.type) {
      case 'like':
      case 'comment':
        return notification.recipe_id ? `/recipes/${notification.recipe_id}` : '/feed'
      case 'friend_request':
        return '/friends?tab=requests'
      case 'friend_accepted':
        return `/profile/${notification.actor.username}`
      default:
        return '/feed'
    }
  }

  const handleNotificationClick = async (notification: Notification) => {
    // Mark as read if not already read
    if (!notification.read) {
      const supabase = createClient()
      await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notification.id)

      // Update local state
      setNotifications((prev) =>
        prev.map((n) => (n.id === notification.id ? { ...n, read: true } : n))
      )
    }

    // Navigate to the relevant page
    router.push(getNotificationLink(notification))
  }

  const handleMarkAllRead = async () => {
    setIsMarkingAllRead(true)

    try {
      const supabase = createClient()
      await supabase
        .from('notifications')
        .update({ read: true })
        .eq('recipient_id', userId)
        .eq('read', false)

      // Update local state
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    } catch (error) {
      console.error('Error marking all as read:', error)
    } finally {
      setIsMarkingAllRead(false)
    }
  }

  const unreadCount = notifications.filter((n) => !n.read).length

  if (notifications.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-12 text-center">
        <p className="text-gray-500">No notifications yet.</p>
      </div>
    )
  }

  return (
    <div>
      {/* Mark All as Read Button */}
      {unreadCount > 0 && (
        <div className="mb-4 flex justify-end">
          <button
            onClick={handleMarkAllRead}
            disabled={isMarkingAllRead}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isMarkingAllRead ? 'Marking...' : 'Mark all as read'}
          </button>
        </div>
      )}

      {/* Notifications List */}
      <div className="bg-white rounded-lg shadow-sm divide-y divide-gray-200">
        {notifications.map((notification) => (
          <button
            key={notification.id}
            onClick={() => handleNotificationClick(notification)}
            className={`w-full flex items-start gap-4 p-4 hover:bg-gray-50 transition-colors text-left ${
              !notification.read ? 'bg-blue-50' : ''
            }`}
          >
            {/* Actor Avatar */}
            {notification.actor.avatar_url ? (
              <Image
                src={notification.actor.avatar_url}
                alt={notification.actor.display_name || notification.actor.username}
                width={48}
                height={48}
                className="w-12 h-12 rounded-full object-cover flex-shrink-0"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                <span className="text-xl">👤</span>
              </div>
            )}

            {/* Notification Content */}
            <div className="flex-1 min-w-0">
              <p className={`text-sm ${!notification.read ? 'font-semibold' : 'font-normal'} text-gray-900`}>
                {getNotificationMessage(notification)}
              </p>
              <p className="text-xs text-gray-500 mt-1">{timeAgo(notification.created_at)}</p>
            </div>

            {/* Unread Indicator */}
            {!notification.read && (
              <div className="flex-shrink-0">
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
