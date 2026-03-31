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
    <div className="mb-10">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl">👥</span>
        <h2 className="text-2xl font-bold text-text-primary tracking-tight">
          Popular Creators to Follow
        </h2>
      </div>

      {/* Horizontal Scroll */}
      <div className="overflow-x-auto pb-4 -mx-4 px-4">
        <div className="flex gap-5 min-w-max">
          {creators.map((creator) => (
            <div
              key={creator.id}
              className="w-[180px] flex-shrink-0 bg-surface rounded-2xl p-5 shadow-apple hover:shadow-apple-lg transition-all duration-200 border border-border text-center"
            >
              {/* Avatar */}
              <Link href={`/profile/${creator.username}`} className="block mb-4">
                {creator.avatar_url ? (
                  <img
                    src={creator.avatar_url}
                    alt={creator.display_name || creator.username}
                    className="w-20 h-20 rounded-full object-cover mx-auto border-2 border-border-light"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto border-2 border-border-light">
                    <span className="text-3xl">👤</span>
                  </div>
                )}
              </Link>

              {/* Name */}
              <Link
                href={`/profile/${creator.username}`}
                className="block font-semibold text-text-primary text-base mb-2 hover:text-accent truncate transition-colors"
              >
                {creator.display_name || creator.username}
              </Link>

              {/* Username & Recipe Count */}
              <p className="text-sm text-text-muted mb-1 truncate">
                @{creator.username}
              </p>
              <p className="text-sm text-text-secondary mb-4">
                {creator.recipe_count} {creator.recipe_count === 1 ? 'recipe' : 'recipes'}
              </p>

              {/* Follow Button */}
              <button
                onClick={() => handleFollow(creator.id)}
                disabled={followingStates[creator.id] || loadingStates[creator.id]}
                className={`w-full px-4 py-2 text-sm font-semibold rounded-xl transition-all duration-200 ${
                  followingStates[creator.id]
                    ? 'bg-gray-100 text-text-muted cursor-not-allowed'
                    : 'bg-accent text-white hover:bg-accent-hover shadow-apple hover:shadow-apple-lg active:scale-[0.98] disabled:opacity-50'
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
