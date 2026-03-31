import Link from 'next/link'
import type { RecipeWithSocialData } from '@/lib/types/recipe'

interface TrendingRecipesProps {
  recipes: RecipeWithSocialData[]
}

export default function TrendingRecipes({ recipes }: TrendingRecipesProps) {
  if (recipes.length === 0) return null

  return (
    <div className="mb-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🔥</span>
          <h2 className="text-2xl font-bold text-text-primary tracking-tight">
            Trending Recipes This Week
          </h2>
        </div>
        <Link
          href="/explore"
          className="text-base font-medium text-accent hover:text-accent-hover transition-colors"
        >
          See all →
        </Link>
      </div>

      <p className="text-base text-text-secondary mb-6">
        Popular recipes from the Cookit community
      </p>

      {/* Horizontal Scroll */}
      <div className="overflow-x-auto pb-4 -mx-4 px-4">
        <div className="flex gap-5 min-w-max">
          {recipes.map((recipe) => (
            <Link
              key={recipe.id}
              href={`/recipes/${recipe.id}`}
              className="group block w-[220px] flex-shrink-0"
            >
              <div className="bg-surface rounded-2xl overflow-hidden shadow-apple hover:shadow-apple-lg transition-all duration-200 border border-border hover:scale-[1.02]">
                {/* Image */}
                {recipe.image_url ? (
                  <div className="aspect-square w-full overflow-hidden bg-gray-100">
                    <img
                      src={recipe.image_url}
                      alt={recipe.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                ) : (
                  <div className="aspect-square w-full bg-gray-100 flex items-center justify-center">
                    <span className="text-5xl">🍴</span>
                  </div>
                )}

                {/* Info */}
                <div className="p-4">
                  <h3 className="font-semibold text-text-primary text-base mb-3 line-clamp-2 group-hover:text-accent transition-colors">
                    {recipe.title}
                  </h3>

                  {/* Stats */}
                  <div className="flex items-center gap-4 text-sm text-text-muted mb-2">
                    <div className="flex items-center gap-1.5">
                      <span>{recipe.like_count > 0 ? '❤️' : '🤍'}</span>
                      <span>{recipe.like_count}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span>💬</span>
                      <span>{recipe.comment_count}</span>
                    </div>
                  </div>

                  {/* Author */}
                  <p className="text-sm text-text-muted truncate">
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
