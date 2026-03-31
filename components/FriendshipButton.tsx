'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Button from '@/components/ui/Button'

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
      <Button
        onClick={handleSendRequest}
        disabled={isLoading}
        variant="primary"
        size="md"
      >
        {isLoading ? 'Sending...' : 'Add Friend'}
      </Button>
    )
  }

  if (status === 'pending_sent') {
    return (
      <Button
        disabled
        variant="outline"
        size="md"
      >
        Request Sent
      </Button>
    )
  }

  if (status === 'pending_received') {
    return (
      <div className="flex gap-2">
        <Button
          onClick={handleAccept}
          disabled={isLoading}
          variant="success"
          size="md"
        >
          {isLoading ? 'Accepting...' : 'Accept'}
        </Button>
        <Button
          onClick={handleDecline}
          disabled={isLoading}
          variant="outline"
          size="md"
        >
          {isLoading ? 'Declining...' : 'Decline'}
        </Button>
      </div>
    )
  }

  if (status === 'friends') {
    return (
      <div className="relative">
        <Button
          onClick={() => setShowDropdown(!showDropdown)}
          variant="outline"
          size="md"
          className="gap-2"
        >
          <span>Friends ✓</span>
          <span className="text-xs">▼</span>
        </Button>
        {showDropdown && (
          <div className="absolute right-0 mt-2 w-48 bg-surface rounded-xl shadow-apple-lg border border-border z-10 overflow-hidden">
            <button
              onClick={handleRemove}
              disabled={isLoading}
              className="w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 transition-colors disabled:opacity-60 disabled:cursor-not-allowed font-semibold"
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
