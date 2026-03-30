import Link from 'next/link'
import type { RecipeWithSocialData } from '@/lib/types/recipe'

interface RecipeCardGridProps {
  recipes: RecipeWithSocialData[]
}

export default function RecipeCardGrid({ recipes }: RecipeCardGridProps) {
  if (recipes.length === 0) {
    return (
      <div className="col-span-full text-center py-12">
        <p className="text-gray-500">No recipes yet.</p>
      </div>
    )
  }

  return (
    <>
      {recipes.map((recipe) => (
        <Link
          key={recipe.id}
          href={`/recipes/${recipe.id}`}
          className="group block bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
        >
          {/* Recipe Image */}
          {recipe.image_url ? (
            <div className="aspect-square w-full overflow-hidden bg-gray-100">
              <img
                src={recipe.image_url}
                alt={recipe.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
              />
            </div>
          ) : (
            <div className="aspect-square w-full bg-gray-100 flex items-center justify-center">
              <span className="text-6xl">🍴</span>
            </div>
          )}

          {/* Recipe Info */}
          <div className="p-4">
            <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
              {recipe.title}
            </h3>

            {/* Stats */}
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <span>{recipe.like_count > 0 ? '❤️' : '🤍'}</span>
                <span>{recipe.like_count}</span>
              </div>
              <div className="flex items-center gap-1">
                <span>💬</span>
                <span>{recipe.comment_count}</span>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </>
  )
}
