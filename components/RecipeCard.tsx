'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { timeAgo } from '@/lib/utils/timeAgo'
import RecipeImage from '@/components/RecipeImage'
import type { RecipeWithSocialData } from '@/lib/types/recipe'

interface RecipeCardProps {
  recipe: RecipeWithSocialData
}

export default function RecipeCard({ recipe }: RecipeCardProps) {
  const [isLiked, setIsLiked] = useState(recipe.is_liked_by_me)
  const [likeCount, setLikeCount] = useState(recipe.like_count)
  const [isBookmarked, setIsBookmarked] = useState(recipe.is_bookmarked_by_me)
  const totalTime = (recipe.prep_time_minutes || 0) + (recipe.cook_time_minutes || 0)

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    // Optimistic update
    const newIsLiked = !isLiked
    setIsLiked(newIsLiked)
    setLikeCount((prev) => (newIsLiked ? prev + 1 : prev - 1))

    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        // Revert if not authenticated
        setIsLiked(isLiked)
        setLikeCount(likeCount)
        return
      }

      if (newIsLiked) {
        const { error } = await supabase
          .from('likes')
          .insert({ user_id: user.id, recipe_id: recipe.id })
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('likes')
          .delete()
          .eq('user_id', user.id)
          .eq('recipe_id', recipe.id)
        if (error) throw error
      }
    } catch (error) {
      // Revert on error
      setIsLiked(isLiked)
      setLikeCount(likeCount)
      console.error('Error toggling like:', error)
    }
  }

  const handleBookmark = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    // Optimistic update
    const newIsBookmarked = !isBookmarked
    setIsBookmarked(newIsBookmarked)

    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        // Revert if not authenticated
        setIsBookmarked(isBookmarked)
        return
      }

      if (newIsBookmarked) {
        const { error } = await supabase
          .from('bookmarks')
          .insert({ user_id: user.id, recipe_id: recipe.id })
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('bookmarks')
          .delete()
          .eq('user_id', user.id)
          .eq('recipe_id', recipe.id)
        if (error) throw error
      }
    } catch (error) {
      // Revert on error
      setIsBookmarked(isBookmarked)
      console.error('Error toggling bookmark:', error)
    }
  }

  return (
    <div className="bg-surface rounded-2xl shadow-apple overflow-hidden hover:shadow-apple-lg transition-all duration-200 border border-border">
      {/* Author Header */}
      <div className="p-4 flex items-center gap-3">
        <Link href={`/profile/${recipe.author_username}`}>
          {recipe.author_avatar_url ? (
            <Image
              src={recipe.author_avatar_url}
              alt={recipe.author_display_name || recipe.author_username}
              width={40}
              height={40}
              className="w-10 h-10 rounded-full object-cover hover:opacity-80 transition-opacity"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors border-2 border-border-light">
              <span className="text-lg">👤</span>
            </div>
          )}
        </Link>
        <div className="flex-1 min-w-0">
          <Link
            href={`/profile/${recipe.author_username}`}
            className="font-semibold text-text-primary hover:text-accent block truncate transition-colors"
          >
            {recipe.author_display_name || recipe.author_username}
          </Link>
          <p className="text-sm text-text-muted">{timeAgo(recipe.created_at)}</p>
        </div>
      </div>

      {/* Recipe Image */}
      <Link href={`/recipes/${recipe.id}`}>
        <RecipeImage
          src={recipe.image_url}
          alt={recipe.title}
          className="w-full h-56 sm:h-80 object-cover hover:opacity-95 transition-opacity"
          fallbackClassName="w-full h-56 sm:h-80"
          fallbackSize="large"
        />
      </Link>

      {/* Recipe Content */}
      <div className="p-4">
        <Link href={`/recipes/${recipe.id}`}>
          <h3 className="text-xl font-bold text-text-primary mb-2 hover:text-accent line-clamp-2 transition-colors">
            {recipe.title}
          </h3>
        </Link>

        {recipe.description && (
          <p className="text-text-secondary text-sm mb-4 line-clamp-2">
            {recipe.description}
          </p>
        )}

        {/* Metadata Pills */}
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          {totalTime > 0 && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-text-secondary rounded-full text-xs font-medium">
              ⏱️ {totalTime} min
            </span>
          )}
          {recipe.servings && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-text-secondary rounded-full text-xs font-medium">
              🍽️ {recipe.servings} {recipe.servings === 1 ? 'serving' : 'servings'}
            </span>
          )}
          {recipe.difficulty && (
            <span
              className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                recipe.difficulty === 'easy'
                  ? 'bg-green-100 text-green-700'
                  : recipe.difficulty === 'medium'
                  ? 'bg-yellow-100 text-yellow-700'
                  : 'bg-red-100 text-red-700'
              }`}
            >
              {recipe.difficulty === 'easy' && '🟢'}
              {recipe.difficulty === 'medium' && '🟡'}
              {recipe.difficulty === 'hard' && '🔴'}
              <span className="capitalize">{recipe.difficulty}</span>
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-4 sm:gap-6 pt-3 border-t border-border">
          <button
            onClick={handleLike}
            className={`flex items-center gap-2 transition-colors ${
              isLiked ? 'text-red-500' : 'text-text-secondary hover:text-red-500'
            }`}
            aria-label={isLiked ? 'Unlike recipe' : 'Like recipe'}
          >
            <span className="text-xl">{isLiked ? '❤️' : '🤍'}</span>
            <span className="text-sm font-medium">
              {likeCount > 0 && <span className="mr-1">{likeCount}</span>}
              Like
            </span>
          </button>
          <Link
            href={`/recipes/${recipe.id}#comments`}
            className="flex items-center gap-2 text-text-secondary hover:text-accent transition-colors"
            aria-label="Comment on recipe"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="text-xl">💬</span>
            <span className="text-sm font-medium">
              {recipe.comment_count > 0 && (
                <span className="mr-1">{recipe.comment_count}</span>
              )}
              Comment
            </span>
          </Link>
          <button
            onClick={handleBookmark}
            className={`flex items-center gap-2 transition-colors ${
              isBookmarked ? 'text-amber-500' : 'text-text-secondary hover:text-amber-500'
            }`}
            aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark recipe'}
          >
            <span className="text-xl">{isBookmarked ? '🔖' : '📑'}</span>
            <span className="text-sm font-medium">Bookmark</span>
          </button>
        </div>
      </div>
    </div>
  )
}
