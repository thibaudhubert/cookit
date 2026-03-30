import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import RecipeCard from '@/components/RecipeCard'
import LoadMoreButton from '@/components/LoadMoreButton'
import NotificationBell from '@/components/NotificationBell'
import ThemeToggle from '@/components/ThemeToggle'
import type { RecipeWithSocialData } from '@/lib/types/recipe'

const RECIPES_PER_PAGE = 20

export default async function FeedPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const supabase = await createClient()
  const params = await searchParams
  const currentPage = parseInt(params.page || '1', 10)

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth')
  }

  // Fetch recipes using database function with social data
  // Only show recipes from friends + own recipes
  const { data: recipes, error } = await supabase.rpc('get_feed_recipes', {
    p_user_id: user.id,
    p_limit: RECIPES_PER_PAGE,
    p_offset: (currentPage - 1) * RECIPES_PER_PAGE,
    p_search_query: null,
    p_friends_only: true,
  })

  if (error) {
    console.error('Error fetching recipes:', error)
  }

  const recipesData = (recipes || []) as RecipeWithSocialData[]

  // For pagination, we need a total count - let's get it separately
  const { count } = await supabase
    .from('recipes')
    .select('*', { count: 'exact', head: true })

  const totalPages = count ? Math.ceil(count / RECIPES_PER_PAGE) : 1
  const hasMore = currentPage < totalPages

  const handleSignOut = async () => {
    'use server'
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/')
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/feed" className="flex items-center gap-2">
              <span className="text-2xl">🍴</span>
              <span className="text-xl font-bold text-gray-900">Cookit</span>
            </Link>

            <div className="flex items-center gap-4 sm:gap-6">
              <Link href="/feed" className="text-gray-900 dark:text-white font-medium text-sm sm:text-base">
                Feed
              </Link>
              <Link href="/explore" className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white text-sm sm:text-base">
                Explore
              </Link>
              <Link href="/friends" className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white text-sm sm:text-base">
                Friends
              </Link>
              <NotificationBell />
              <ThemeToggle />
              <Link href="/profile" className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white text-sm sm:text-base">
                Profile
              </Link>
              <form action={handleSignOut}>
                <button
                  type="submit"
                  className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
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
        {/* Header with Create Button */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Your Feed</h1>
          <Link
            href="/recipes/new"
            className="px-3 py-2 sm:px-4 sm:py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 text-sm sm:text-base"
          >
            + Create
          </Link>
        </div>

        {/* Recipe Feed */}
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
          <div className="space-y-6">
            {recipesData.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}

            {/* Load More Button */}
            {hasMore && (
              <LoadMoreButton currentPage={currentPage} totalPages={totalPages} />
            )}

            {/* End of Feed */}
            {!hasMore && recipesData.length > 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500 text-sm">You've reached the end!</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
