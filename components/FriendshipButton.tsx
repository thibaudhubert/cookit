'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface FriendshipButtonProps {
  targetUserId: string
  initialStatus: 'none' | 'friends' | 'pending_sent' | 'pending_received'
  friendshipId?: string
}

export default function FriendshipButton({
  targetUserId,
  initialStatus,
  friendshipId,
}: FriendshipButtonProps) {
  const [status, setStatus] = useState(initialStatus)
  const [isLoading, setIsLoading] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)

  const handleSendRequest = async () => {
    setIsLoading(true)
    // Optimistic update
    setStatus('pending_sent')

    try {
      const supabase = createClient()
      const { error } = await supabase.rpc('send_friend_request', {
        target_user_id: targetUserId,
      })

      if (error) throw error
    } catch (error) {
      // Revert on error
      setStatus('none')
      console.error('Error sending friend request:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAccept = async () => {
    if (!friendshipId) return

    setIsLoading(true)
    // Optimistic update
    const prevStatus = status
    setStatus('friends')

    try {
      const supabase = createClient()
      const { error } = await supabase.rpc('respond_to_friend_request', {
        friendship_id: friendshipId,
        new_status: 'accepted',
      })

      if (error) throw error
    } catch (error) {
      // Revert on error
      setStatus(prevStatus)
      console.error('Error accepting friend request:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDecline = async () => {
    if (!friendshipId) return

    setIsLoading(true)
    // Optimistic update
    const prevStatus = status
    setStatus('none')

    try {
      const supabase = createClient()
      const { error } = await supabase.rpc('respond_to_friend_request', {
        friendship_id: friendshipId,
        new_status: 'declined',
      })

      if (error) throw error
    } catch (error) {
      // Revert on error
      setStatus(prevStatus)
      console.error('Error declining friend request:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRemove = async () => {
    setIsLoading(true)
    setShowDropdown(false)
    // Optimistic update
    const prevStatus = status
    setStatus('none')

    try {
      const supabase = createClient()
      const { error } = await supabase.rpc('remove_friend', {
        friend_user_id: targetUserId,
      })

      if (error) throw error
    } catch (error) {
      // Revert on error
      setStatus(prevStatus)
      console.error('Error removing friend:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (status === 'none') {
    return (
      <button
        onClick={handleSendRequest}
        disabled={isLoading}
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Sending...' : 'Add Friend'}
      </button>
    )
  }

  if (status === 'pending_sent') {
    return (
      <button
        disabled
        className="px-4 py-2 bg-gray-300 text-gray-600 rounded-md cursor-not-allowed"
      >
        Request Sent
      </button>
    )
  }

  if (status === 'pending_received') {
    return (
      <div className="flex gap-2">
        <button
          onClick={handleAccept}
          disabled={isLoading}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Accepting...' : 'Accept'}
        </button>
        <button
          onClick={handleDecline}
          disabled={isLoading}
          className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Declining...' : 'Decline'}
        </button>
      </div>
    )
  }

  if (status === 'friends') {
    return (
      <div className="relative">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="px-4 py-2 bg-gray-100 text-gray-900 rounded-md hover:bg-gray-200 flex items-center gap-2"
        >
          <span>Friends ✓</span>
          <span className="text-xs">▼</span>
        </button>
        {showDropdown && (
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-10">
            <button
              onClick={handleRemove}
              disabled={isLoading}
              className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Removing...' : 'Remove Friend'}
            </button>
          </div>
        )}
      </div>
    )
  }

  return null
}
