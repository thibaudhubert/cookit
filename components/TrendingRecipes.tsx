import Link from 'next/link'
import type { RecipeWithSocialData } from '@/lib/types/recipe'

interface TrendingRecipesProps {
  recipes: RecipeWithSocialData[]
}

export default function TrendingRecipes({ recipes }: TrendingRecipesProps) {
  if (recipes.length === 0) return null

  return (
    <div className="mb-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xl">🔥</span>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Trending Recipes This Week
          </h2>
        </div>
        <Link
          href="/explore"
          className="text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium"
        >
          See all →
        </Link>
      </div>

      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        Popular recipes from the Cookit community
      </p>

      {/* Horizontal Scroll */}
      <div className="overflow-x-auto pb-4 -mx-4 px-4">
        <div className="flex gap-4 min-w-max">
          {recipes.map((recipe) => (
            <Link
              key={recipe.id}
              href={`/recipes/${recipe.id}`}
              className="group block w-[200px] flex-shrink-0"
            >
              <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-gray-200 dark:border-gray-700">
                {/* Image */}
                {recipe.image_url ? (
                  <div className="aspect-square w-full overflow-hidden bg-gray-100 dark:bg-gray-700">
                    <img
                      src={recipe.image_url}
                      alt={recipe.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                  </div>
                ) : (
                  <div className="aspect-square w-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                    <span className="text-4xl">🍴</span>
                  </div>
                )}

                {/* Info */}
                <div className="p-3">
                  <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-2 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {recipe.title}
                  </h3>

                  {/* Stats */}
                  <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mb-2">
                    <div className="flex items-center gap-1">
                      <span>{recipe.like_count > 0 ? '❤️' : '🤍'}</span>
                      <span>{recipe.like_count}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span>💬</span>
                      <span>{recipe.comment_count}</span>
                    </div>
                  </div>

                  {/* Author */}
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    by @{recipe.author_username}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
