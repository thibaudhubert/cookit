'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/lib/types/recipe'

interface PopularCreatorsProps {
  creators: (Profile & { recipe_count: number })[]
}

export default function PopularCreators({ creators }: PopularCreatorsProps) {
  const [followingStates, setFollowingStates] = useState<Record<string, boolean>>({})
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({})

  if (creators.length === 0) return null

  const handleFollow = async (creatorId: string) => {
    setLoadingStates((prev) => ({ ...prev, [creatorId]: true }))

    try {
      const supabase = createClient()
      const { error } = await supabase.rpc('send_friend_request', {
        target_user_id: creatorId,
      })

      if (!error) {
        setFollowingStates((prev) => ({ ...prev, [creatorId]: true }))
      }
    } catch (error) {
      console.error('Error sending friend request:', error)
    } finally {
      setLoadingStates((prev) => ({ ...prev, [creatorId]: false }))
    }
  }

  return (
    <div className="mb-8">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xl">👥</span>
        <h2 className="text-xl font-bold text-text-primary">
          Popular Creators to Follow
        </h2>
      </div>

      {/* Horizontal Scroll */}
      <div className="overflow-x-auto pb-4 -mx-4 px-4">
        <div className="flex gap-4 min-w-max">
          {creators.map((creator) => (
            <div
              key={creator.id}
              className="w-[160px] flex-shrink-0 bg-surface rounded-lg p-4 shadow-sm border border-border text-center"
            >
              {/* Avatar */}
              <Link href={`/profile/${creator.username}`} className="block mb-3">
                {creator.avatar_url ? (
                  <img
                    src={creator.avatar_url}
                    alt={creator.display_name || creator.username}
                    className="w-16 h-16 rounded-full object-cover mx-auto border-2 border-border-light"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center mx-auto">
                    <span className="text-2xl">👤</span>
                  </div>
                )}
              </Link>

              {/* Name */}
              <Link
                href={`/profile/${creator.username}`}
                className="block font-semibold text-text-primary text-sm mb-1 hover:text-accent truncate"
              >
                {creator.display_name || creator.username}
              </Link>

              {/* Username & Recipe Count */}
              <p className="text-xs text-text-muted mb-3 truncate">
                @{creator.username}
              </p>
              <p className="text-xs text-text-secondary mb-3">
                {creator.recipe_count} {creator.recipe_count === 1 ? 'recipe' : 'recipes'}
              </p>

              {/* Follow Button */}
              <button
                onClick={() => handleFollow(creator.id)}
                disabled={followingStates[creator.id] || loadingStates[creator.id]}
                className={`w-full px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  followingStates[creator.id]
                    ? 'bg-gray-200 text-text-muted cursor-not-allowed'
                    : 'bg-accent text-white hover:bg-accent-hover disabled:opacity-50'
                }`}
              >
                {loadingStates[creator.id]
                  ? 'Sending...'
                  : followingStates[creator.id]
                  ? 'Request Sent'
                  : 'Follow'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
