'use client'

import Link from 'next/link'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { timeAgo } from '@/lib/utils/timeAgo'

interface FriendRequest {
  id: string
  created_at: string
  requester: {
    id: string
    username: string
    display_name: string | null
    avatar_url: string | null
  }
}

interface FriendRequestsProps {
  requests: FriendRequest[]
}

export default function FriendRequests({ requests }: FriendRequestsProps) {
  const [requestsList, setRequestsList] = useState(requests)
  const [processingId, setProcessingId] = useState<string | null>(null)

  const handleAccept = async (requestId: string, requesterId: string) => {
    setProcessingId(requestId)

    // Optimistic update
    const previousRequests = [...requestsList]
    setRequestsList((prev) => prev.filter((r) => r.id !== requestId))

    try {
      const supabase = createClient()
      const { error } = await supabase.rpc('respond_to_friend_request', {
        friendship_id: requestId,
        new_status: 'accepted',
      })

      if (error) throw error
    } catch (error) {
      // Revert on error
      setRequestsList(previousRequests)
      console.error('Error accepting friend request:', error)
    } finally {
      setProcessingId(null)
    }
  }

  const handleDecline = async (requestId: string) => {
    setProcessingId(requestId)

    // Optimistic update
    const previousRequests = [...requestsList]
    setRequestsList((prev) => prev.filter((r) => r.id !== requestId))

    try {
      const supabase = createClient()
      const { error } = await supabase.rpc('respond_to_friend_request', {
        friendship_id: requestId,
        new_status: 'declined',
      })

      if (error) throw error
    } catch (error) {
      // Revert on error
      setRequestsList(previousRequests)
      console.error('Error declining friend request:', error)
    } finally {
      setProcessingId(null)
    }
  }

  if (requestsList.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No pending friend requests.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {requestsList.map((request) => (
        <div
          key={request.id}
          className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
        >
          <Link
            href={`/profile/${request.requester.username}`}
            className="flex items-center gap-3 flex-1"
          >
            {request.requester.avatar_url ? (
              <img
                src={request.requester.avatar_url}
                alt={request.requester.display_name || request.requester.username}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                <span className="text-xl">👤</span>
              </div>
            )}
            <div>
              <p className="font-semibold text-gray-900">
                {request.requester.display_name || request.requester.username}
              </p>
              <p className="text-sm text-gray-500">
                @{request.requester.username} • {timeAgo(request.created_at)}
              </p>
            </div>
          </Link>
          <div className="flex gap-2">
            <button
              onClick={() => handleAccept(request.id, request.requester.id)}
              disabled={processingId === request.id}
              className="px-4 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {processingId === request.id ? 'Accepting...' : 'Accept'}
            </button>
            <button
              onClick={() => handleDecline(request.id)}
              disabled={processingId === request.id}
              className="px-4 py-2 text-sm bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {processingId === request.id ? 'Declining...' : 'Decline'}
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
