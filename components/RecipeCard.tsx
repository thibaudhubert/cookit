'use client'

import Link from 'next/link'
import { timeAgo } from '@/lib/utils/timeAgo'
import type { Recipe, Profile } from '@/lib/types/recipe'

interface RecipeWithAuthor extends Recipe {
  author: Profile
}

interface RecipeCardProps {
  recipe: RecipeWithAuthor
}

export default function RecipeCard({ recipe }: RecipeCardProps) {
  const totalTime = (recipe.prep_time_minutes || 0) + (recipe.cook_time_minutes || 0)

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      {/* Author Header */}
      <div className="p-4 flex items-center gap-3">
        <Link href={`/profile/${recipe.author.username}`}>
          {recipe.author.avatar_url ? (
            <img
              src={recipe.author.avatar_url}
              alt={recipe.author.display_name || recipe.author.username}
              className="w-10 h-10 rounded-full object-cover hover:opacity-80 transition-opacity"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition-colors">
              <span className="text-lg">👤</span>
            </div>
          )}
        </Link>
        <div className="flex-1 min-w-0">
          <Link
            href={`/profile/${recipe.author.username}`}
            className="font-semibold text-gray-900 hover:underline block truncate"
          >
            {recipe.author.display_name || recipe.author.username}
          </Link>
          <p className="text-sm text-gray-500">{timeAgo(recipe.created_at)}</p>
        </div>
      </div>

      {/* Recipe Image */}
      <Link href={`/recipes/${recipe.id}`}>
        {recipe.image_url ? (
          <img
            src={recipe.image_url}
            alt={recipe.title}
            className="w-full h-80 object-cover hover:opacity-95 transition-opacity"
          />
        ) : (
          <div className="w-full h-80 bg-gray-100 flex items-center justify-center">
            <span className="text-8xl">🍴</span>
          </div>
        )}
      </Link>

      {/* Recipe Content */}
      <div className="p-4">
        <Link href={`/recipes/${recipe.id}`}>
          <h3 className="text-xl font-bold text-gray-900 mb-2 hover:underline line-clamp-2">
            {recipe.title}
          </h3>
        </Link>

        {recipe.description && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
            {recipe.description}
          </p>
        )}

        {/* Metadata Pills */}
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          {totalTime > 0 && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
              ⏱️ {totalTime} min
            </span>
          )}
          {recipe.servings && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
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
        <div className="flex items-center gap-6 pt-3 border-t border-gray-100">
          <button
            className="flex items-center gap-2 text-gray-600 hover:text-red-500 transition-colors"
            aria-label="Like recipe"
          >
            <span className="text-xl">❤️</span>
            <span className="text-sm font-medium">Like</span>
          </button>
          <button
            className="flex items-center gap-2 text-gray-600 hover:text-blue-500 transition-colors"
            aria-label="Comment on recipe"
          >
            <span className="text-xl">💬</span>
            <span className="text-sm font-medium">Comment</span>
          </button>
          <button
            className="flex items-center gap-2 text-gray-600 hover:text-amber-500 transition-colors"
            aria-label="Bookmark recipe"
          >
            <span className="text-xl">🔖</span>
            <span className="text-sm font-medium">Bookmark</span>
          </button>
        </div>
      </div>
    </div>
  )
}
