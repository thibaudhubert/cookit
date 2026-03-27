import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import type { Recipe, Profile } from '@/lib/types/recipe'

interface RecipeWithAuthor extends Recipe {
  author: Profile
}

export default async function FeedPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth')
  }

  // Fetch all recipes with author info
  const { data: recipes } = await supabase
    .from('recipes')
    .select(
      `
      *,
      author:profiles(*)
    `
    )
    .order('created_at', { ascending: false })

  const recipesData = (recipes || []) as unknown as RecipeWithAuthor[]

  const handleSignOut = async () => {
    'use server'
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/feed" className="flex items-center gap-2">
              <span className="text-2xl">🍴</span>
              <span className="text-xl font-bold text-gray-900">Cookit</span>
            </Link>

            <div className="flex items-center gap-6">
              <Link href="/feed" className="text-gray-900 font-medium">
                Feed
              </Link>
              <Link href="/profile" className="text-gray-600 hover:text-gray-900">
                Profile
              </Link>
              <form action={handleSignOut}>
                <button
                  type="submit"
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  Sign Out
                </button>
              </form>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with Create Button */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Recipe Feed</h1>
          <Link
            href="/recipes/new"
            className="px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800"
          >
            + Create Recipe
          </Link>
        </div>

        {/* Recipe Grid */}
        {recipesData.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <p className="text-gray-500 mb-4">
              No recipes yet. Be the first to share a recipe!
            </p>
            <Link
              href="/recipes/new"
              className="inline-block px-6 py-3 bg-gray-900 text-white rounded-md hover:bg-gray-800"
            >
              Create Your First Recipe
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {recipesData.map((recipe) => (
              <Link
                key={recipe.id}
                href={`/recipes/${recipe.id}`}
                className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* Recipe Image */}
                {recipe.image_url ? (
                  <img
                    src={recipe.image_url}
                    alt={recipe.title}
                    className="w-full h-48 object-cover"
                  />
                ) : (
                  <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                    <span className="text-6xl">🍴</span>
                  </div>
                )}

                {/* Recipe Info */}
                <div className="p-4">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2">
                    {recipe.title}
                  </h2>

                  {recipe.description && (
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {recipe.description}
                    </p>
                  )}

                  {/* Author */}
                  <div className="flex items-center gap-2 mb-3">
                    {recipe.author.avatar_url ? (
                      <img
                        src={recipe.author.avatar_url}
                        alt={recipe.author.display_name || recipe.author.username}
                        className="w-6 h-6 rounded-full"
                      />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs">
                        👤
                      </div>
                    )}
                    <span className="text-sm text-gray-600">
                      {recipe.author.display_name || recipe.author.username}
                    </span>
                  </div>

                  {/* Metadata */}
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    {recipe.prep_time_minutes !== null &&
                      recipe.cook_time_minutes !== null && (
                        <span>
                          ⏱️ {recipe.prep_time_minutes + recipe.cook_time_minutes}{' '}
                          min
                        </span>
                      )}
                    {recipe.servings !== null && (
                      <span>🍽️ {recipe.servings} servings</span>
                    )}
                    {recipe.difficulty && (
                      <span className="capitalize">
                        {recipe.difficulty === 'easy' && '🟢'}
                        {recipe.difficulty === 'medium' && '🟡'}
                        {recipe.difficulty === 'hard' && '🔴'}{' '}
                        {recipe.difficulty}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
