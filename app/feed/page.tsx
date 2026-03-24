import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/Navbar'
import Link from 'next/link'
import { Clock, Users, Plus } from 'lucide-react'

export default async function FeedPage() {
  const supabase = await createClient()

  // Fetch recipes with author info
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Recipe Feed</h1>
            <p className="text-gray-600 mt-1">Discover delicious recipes from the community</p>
          </div>
          <Link
            href="/recipes/new"
            className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors"
          >
            <Plus className="w-5 h-5" />
            New Recipe
          </Link>
        </div>

        {!recipes || recipes.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <p className="text-gray-600 mb-4">No recipes yet! Be the first to share a recipe.</p>
            <Link
              href="/recipes/new"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Create Your First Recipe
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recipes.map((recipe) => {
              const totalTime = (recipe.prep_time_minutes || 0) + (recipe.cook_time_minutes || 0)

              return (
                <Link
                  key={recipe.id}
                  href={`/recipes/${recipe.id}`}
                  className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                >
                  {/* Recipe Image */}
                  {recipe.image_url ? (
                    <div className="w-full h-48 bg-gray-200">
                      <img
                        src={recipe.image_url}
                        alt={recipe.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-full h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                      <span className="text-6xl">🍴</span>
                    </div>
                  )}

                  {/* Recipe Info */}
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                      {recipe.title}
                    </h3>

                    {recipe.description && (
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {recipe.description}
                      </p>
                    )}

                    {/* Metadata */}
                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                      {totalTime > 0 && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{totalTime} min</span>
                        </div>
                      )}
                      {recipe.servings && (
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          <span>{recipe.servings}</span>
                        </div>
                      )}
                      {recipe.difficulty && (
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          recipe.difficulty === 'easy'
                            ? 'bg-green-100 text-green-800'
                            : recipe.difficulty === 'medium'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {recipe.difficulty}
                        </span>
                      )}
                    </div>

                    {/* Author */}
                    <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                      {recipe.author.avatar_url ? (
                        <img
                          src={recipe.author.avatar_url}
                          alt={recipe.author.display_name || recipe.author.username}
                          className="w-6 h-6 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-gray-200" />
                      )}
                      <span className="text-sm text-gray-600">
                        {recipe.author.display_name || recipe.author.username}
                      </span>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
