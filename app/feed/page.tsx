import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/Navbar'
import Link from 'next/link'
import { Heart, MessageCircle, Bookmark, Clock, ChefHat, User } from 'lucide-react'
import { timeAgo } from '@/lib/utils'

export default async function FeedPage() {
  const supabase = await createClient()

  // Fetch recipes with author info (global feed for now, easily filterable by friends later)
  const { data: recipes } = await supabase
    .from('recipes')
    .select(`
      *,
      author:profiles(*)
    `)
    .order('created_at', { ascending: false })
    .limit(20)

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-2xl mx-auto px-4 py-6">
        {!recipes || recipes.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <p className="text-gray-600 mb-4">No recipes in your feed yet.</p>
            <Link
              href="/recipes/new"
              className="inline-block px-6 py-3 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors"
            >
              Share Your First Recipe
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {recipes.map((recipe) => {
              const totalTime = (recipe.prep_time_minutes || 0) + (recipe.cook_time_minutes || 0)
              const difficultyColors: Record<string, string> = {
                easy: 'bg-green-100 text-green-800',
                medium: 'bg-yellow-100 text-yellow-800',
                hard: 'bg-red-100 text-red-800',
              }

              return (
                <article key={recipe.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                  {/* Author Header */}
                  <div className="flex items-center gap-3 p-4">
                    <Link href={`/profile/${recipe.author.username}`} className="flex-shrink-0">
                      {recipe.author.avatar_url ? (
                        <img
                          src={recipe.author.avatar_url}
                          alt={recipe.author.display_name || recipe.author.username}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <User className="w-5 h-5 text-gray-600" />
                        </div>
                      )}
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/profile/${recipe.author.username}`}
                        className="font-semibold text-gray-900 hover:underline"
                      >
                        {recipe.author.display_name || recipe.author.username}
                      </Link>
                      <p className="text-sm text-gray-500">
                        @{recipe.author.username} • {timeAgo(recipe.created_at)}
                      </p>
                    </div>
                  </div>

                  {/* Recipe Image */}
                  <Link href={`/recipes/${recipe.id}`} className="block">
                    {recipe.image_url ? (
                      <div className="w-full aspect-square bg-gray-100">
                        <img
                          src={recipe.image_url}
                          alt={recipe.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-full aspect-square bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                        <span className="text-8xl">🍴</span>
                      </div>
                    )}
                  </Link>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-4 px-4 py-3 border-b border-gray-100">
                    <button className="flex items-center gap-2 text-gray-700 hover:text-red-600 transition-colors">
                      <Heart className="w-6 h-6" />
                    </button>
                    <button className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors">
                      <MessageCircle className="w-6 h-6" />
                    </button>
                    <button className="flex items-center gap-2 text-gray-700 hover:text-yellow-600 transition-colors ml-auto">
                      <Bookmark className="w-6 h-6" />
                    </button>
                  </div>

                  {/* Recipe Content */}
                  <div className="px-4 py-3">
                    <Link href={`/recipes/${recipe.id}`}>
                      <h3 className="text-xl font-bold text-gray-900 mb-2 hover:underline">
                        {recipe.title}
                      </h3>
                    </Link>

                    {recipe.description && (
                      <p className="text-gray-700 mb-3 line-clamp-2">
                        {recipe.description}
                      </p>
                    )}

                    {/* Metadata Pills */}
                    <div className="flex flex-wrap items-center gap-2">
                      {totalTime > 0 && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                          <Clock className="w-4 h-4" />
                          {recipe.prep_time_minutes && (
                            <span>{recipe.prep_time_minutes}m prep</span>
                          )}
                          {recipe.prep_time_minutes && recipe.cook_time_minutes && (
                            <span>•</span>
                          )}
                          {recipe.cook_time_minutes && (
                            <span>{recipe.cook_time_minutes}m cook</span>
                          )}
                        </span>
                      )}

                      {recipe.difficulty && (
                        <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                          difficultyColors[recipe.difficulty]
                        }`}>
                          {recipe.difficulty}
                        </span>
                      )}

                      {recipe.servings && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                          <ChefHat className="w-4 h-4" />
                          {recipe.servings} servings
                        </span>
                      )}
                    </div>
                  </div>
                </article>
              )
            })}

            {/* Load More */}
            {recipes.length >= 20 && (
              <div className="text-center py-8">
                <button className="px-6 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors">
                  Load More Recipes
                </button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
