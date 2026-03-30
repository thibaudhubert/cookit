import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import RecipeCard from '@/components/RecipeCard'
import LoadMoreButton from '@/components/LoadMoreButton'
import SearchBar from '@/components/SearchBar'
import type { RecipeWithSocialData, Profile } from '@/lib/types/recipe'

const RECIPES_PER_PAGE = 20
const PEOPLE_PER_PAGE = 20

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string; mode?: string }>
}) {
  const supabase = await createClient()
  const params = await searchParams
  const currentPage = parseInt(params.page || '1', 10)
  const searchQuery = params.q || ''
  const mode = params.mode || 'recipes'

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth')
  }

  let recipesData: RecipeWithSocialData[] = []
  let peopleData: Profile[] = []
  let count = 0
  let hasMore = false

  if (mode === 'recipes') {
    // Fetch recipes using database function with social data and search
    const { data: recipes, error } = await supabase.rpc('get_feed_recipes', {
      p_user_id: user.id,
      p_limit: RECIPES_PER_PAGE,
      p_offset: (currentPage - 1) * RECIPES_PER_PAGE,
      p_search_query: searchQuery || null,
    })

    if (error) {
      console.error('Error fetching recipes:', error)
    }

    recipesData = (recipes || []) as RecipeWithSocialData[]

    // For pagination with search, count matching recipes
    let countQuery = supabase.from('recipes').select('*', { count: 'exact', head: true })

    if (searchQuery) {
      countQuery = countQuery.ilike('title', `%${searchQuery}%`)
    }

    const { count: recipeCount } = await countQuery
    count = recipeCount || 0
    const totalPages = count ? Math.ceil(count / RECIPES_PER_PAGE) : 1
    hasMore = currentPage < totalPages
  } else {
    // Fetch people
    let peopleQuery = supabase
      .from('profiles')
      .select('*', { count: 'exact' })
      .neq('id', user.id)
      .range((currentPage - 1) * PEOPLE_PER_PAGE, currentPage * PEOPLE_PER_PAGE - 1)

    if (searchQuery) {
      peopleQuery = peopleQuery.or(
        `username.ilike.%${searchQuery}%,display_name.ilike.%${searchQuery}%`
      )
    }

    const { data: people, count: peopleCount } = await peopleQuery

    peopleData = (people || []) as Profile[]
    count = peopleCount || 0
    const totalPages = count ? Math.ceil(count / PEOPLE_PER_PAGE) : 1
    hasMore = currentPage < totalPages
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
              <Link href="/feed" className="text-gray-600 hover:text-gray-900 text-sm sm:text-base">
                Feed
              </Link>
              <Link href="/explore" className="text-gray-900 font-medium text-sm sm:text-base">
                Explore
              </Link>
              <Link href="/friends" className="text-gray-600 hover:text-gray-900 text-sm sm:text-base">
                Friends
              </Link>
              <Link href="/profile" className="text-gray-600 hover:text-gray-900 text-sm sm:text-base">
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
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
            Explore {mode === 'recipes' ? 'Recipes' : 'People'}
          </h1>

          {/* Mode Toggle */}
          <div className="flex gap-2 mb-4">
            <Link
              href={`/explore?mode=recipes${searchQuery ? `&q=${searchQuery}` : ''}`}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                mode === 'recipes'
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Recipes
            </Link>
            <Link
              href={`/explore?mode=people${searchQuery ? `&q=${searchQuery}` : ''}`}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                mode === 'people'
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              People
            </Link>
          </div>

          <SearchBar initialQuery={searchQuery} />
        </div>

        {/* Search Results Info */}
        {searchQuery && (
          <div className="mb-4">
            <p className="text-sm text-gray-600">
              {count === 0 ? (
                <>No results found for &quot;{searchQuery}&quot;</>
              ) : count === 1 ? (
                <>1 result for &quot;{searchQuery}&quot;</>
              ) : (
                <>{count} results for &quot;{searchQuery}&quot;</>
              )}
            </p>
            <Link
              href={`/explore?mode=${mode}`}
              className="text-sm text-gray-900 hover:underline font-medium"
            >
              Clear search
            </Link>
          </div>
        )}

        {/* Recipe Feed */}
        {mode === 'recipes' && (
          <>
            {recipesData.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <p className="text-gray-500 mb-4">
                  {searchQuery
                    ? 'No recipes found matching your search.'
                    : 'No recipes yet. Be the first to share a recipe!'}
                </p>
                {!searchQuery && (
                  <Link
                    href="/recipes/new"
                    className="inline-block px-6 py-3 bg-gray-900 text-white rounded-md hover:bg-gray-800"
                  >
                    Create Your First Recipe
                  </Link>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                {recipesData.map((recipe) => (
                  <RecipeCard key={recipe.id} recipe={recipe} />
                ))}

                {/* Load More Button */}
                {hasMore && <LoadMoreButton currentPage={currentPage} totalPages={0} />}

                {/* End of Results */}
                {!hasMore && recipesData.length > 0 && (
                  <div className="text-center py-8">
                    <p className="text-gray-500 text-sm">You've reached the end!</p>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* People List */}
        {mode === 'people' && (
          <>
            {peopleData.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <p className="text-gray-500">
                  {searchQuery ? 'No people found matching your search.' : 'No users to show.'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {peopleData.map((person) => (
                  <Link
                    key={person.id}
                    href={`/profile/${person.username}`}
                    className="flex items-center gap-4 p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
                  >
                    {person.avatar_url ? (
                      <img
                        src={person.avatar_url}
                        alt={person.display_name || person.username}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                        <span className="text-2xl">👤</span>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 truncate">
                        {person.display_name || person.username}
                      </p>
                      <p className="text-sm text-gray-500 truncate">@{person.username}</p>
                      {person.bio && (
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">{person.bio}</p>
                      )}
                    </div>
                  </Link>
                ))}

                {/* Load More Button */}
                {hasMore && <LoadMoreButton currentPage={currentPage} totalPages={0} />}

                {/* End of Results */}
                {!hasMore && peopleData.length > 0 && (
                  <div className="text-center py-8">
                    <p className="text-gray-500 text-sm">You've reached the end!</p>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}
