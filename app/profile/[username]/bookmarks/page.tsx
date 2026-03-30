import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import RecipeCard from '@/components/RecipeCard'
import type { RecipeWithSocialData } from '@/lib/types/recipe'

interface PageProps {
  params: Promise<{ username: string }>
}

export default async function BookmarksPage({ params }: PageProps) {
  const { username } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth')
  }

  // Fetch the profile for the username
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username)
    .single()

  if (!profile) {
    notFound()
  }

  // Only allow users to view their own bookmarks
  if (profile.id !== user.id) {
    redirect(`/profile/${username}`)
  }

  // Fetch bookmarked recipes with social data
  const { data: bookmarksData } = await supabase
    .from('bookmarks')
    .select('recipe_id')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const recipeIds = bookmarksData?.map((b) => b.recipe_id) || []

  let recipesData: RecipeWithSocialData[] = []

  if (recipeIds.length > 0) {
    // Fetch full recipe data for bookmarked recipes
    const { data: recipes } = await supabase.rpc('get_feed_recipes', {
      p_user_id: user.id,
      p_limit: 100, // Reasonable limit for bookmarks
      p_offset: 0,
      p_search_query: null,
    })

    // Filter to only bookmarked recipes
    recipesData = (recipes || []).filter((r: RecipeWithSocialData) =>
      recipeIds.includes(r.id)
    )
  }

  const handleSignOut = async () => {
    'use server'
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/feed" className="flex items-center gap-2">
              <span className="text-2xl">🍴</span>
              <span className="text-xl font-bold text-gray-900">Cookit</span>
            </Link>

            <div className="flex items-center gap-4 sm:gap-6">
              <Link
                href="/feed"
                className="text-gray-600 hover:text-gray-900 text-sm sm:text-base"
              >
                Feed
              </Link>
              <Link
                href="/explore"
                className="text-gray-600 hover:text-gray-900 text-sm sm:text-base"
              >
                Explore
              </Link>
              <Link
                href="/profile"
                className="text-gray-900 font-medium text-sm sm:text-base"
              >
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
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <Link
            href={`/profile/${username}`}
            className="text-sm text-gray-600 hover:text-gray-900 mb-2 inline-block"
          >
            ← Back to profile
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Bookmarked Recipes
          </h1>
        </div>

        {/* Bookmarked Recipes */}
        {recipesData.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <span className="text-6xl mb-4 block">🔖</span>
            <p className="text-gray-500 mb-4">
              You haven't bookmarked any recipes yet.
            </p>
            <Link
              href="/explore"
              className="inline-block px-6 py-3 bg-gray-900 text-white rounded-md hover:bg-gray-800"
            >
              Explore Recipes
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {recipesData.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
