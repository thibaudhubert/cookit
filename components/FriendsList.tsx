'use client'

import Link from 'next/link'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Friend {
  id: string
  username: string
  display_name: string | null
  avatar_url: string | null
}

interface FriendsListProps {
  friends: Friend[]
  currentUserId: string
}

export default function FriendsList({ friends, currentUserId }: FriendsListProps) {
  const [friendsList, setFriendsList] = useState(friends)
  const [removingId, setRemovingId] = useState<string | null>(null)

  const handleRemoveFriend = async (friendId: string) => {
    if (!confirm('Are you sure you want to remove this friend?')) {
      return
    }

    setRemovingId(friendId)

    // Optimistic update
    const previousFriends = [...friendsList]
    setFriendsList((prev) => prev.filter((f) => f.id !== friendId))

    try {
      const supabase = createClient()
      const { error } = await supabase.rpc('remove_friend', {
        friend_user_id: friendId,
      })

      if (error) throw error
    } catch (error) {
      // Revert on error
      setFriendsList(previousFriends)
      console.error('Error removing friend:', error)
    } finally {
      setRemovingId(null)
    }
  }

  if (friendsList.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 mb-4">You don't have any friends yet.</p>
        <Link
          href="/explore"
          className="text-blue-600 hover:text-blue-700 font-medium"
        >
          Explore recipes to find people to connect with
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {friendsList.map((friend) => (
        <div
          key={friend.id}
          className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <Link
            href={`/profile/${friend.username}`}
            className="flex items-center gap-3 flex-1"
          >
            {friend.avatar_url ? (
              <img
                src={friend.avatar_url}
                alt={friend.display_name || friend.username}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                <span className="text-xl">👤</span>
              </div>
            )}
            <div>
              <p className="font-semibold text-gray-900">
                {friend.display_name || friend.username}
              </p>
              <p className="text-sm text-gray-500">@{friend.username}</p>
            </div>
          </Link>
          <button
            onClick={() => handleRemoveFriend(friend.id)}
            disabled={removingId === friend.id}
            className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {removingId === friend.id ? 'Removing...' : 'Remove'}
          </button>
        </div>
      ))}
    </div>
  )
}
