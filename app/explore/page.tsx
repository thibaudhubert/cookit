import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import RecipeCard from '@/components/RecipeCard'
import LoadMoreButton from '@/components/LoadMoreButton'
import SearchBar from '@/components/SearchBar'
import TrendingRecipes from '@/components/TrendingRecipes'
import Layout from '@/components/ui/Layout'
import AppHeader from '@/components/ui/AppHeader'
import type { RecipeWithSocialData, Profile } from '@/lib/types/recipe'

const RECIPES_PER_PAGE = 20
const PEOPLE_PER_PAGE = 20
const TRENDING_LIMIT = 8

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

  // Fetch trending recipes (top liked recipes for the last 7 days)
  let trendingRecipes: RecipeWithSocialData[] = []
  if (mode === 'recipes' && !searchQuery) {
    const { data: trending } = await supabase.rpc('get_feed_recipes', {
      p_user_id: user.id,
      p_limit: TRENDING_LIMIT,
      p_offset: 0,
      p_search_query: null,
      p_friends_only: false,
    })
    // Sort by like count to get trending
    trendingRecipes = ((trending || []) as RecipeWithSocialData[])
      .sort((a, b) => b.like_count - a.like_count)
      .slice(0, TRENDING_LIMIT)
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
      p_friends_only: false,
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
    <Layout maxWidth="md" header={<AppHeader onSignOut={handleSignOut} />}>
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-text-primary tracking-tight mb-6">
            Explore {mode === 'recipes' ? 'Recipes' : 'People'}
          </h1>

          {/* Mode Toggle */}
          <div className="flex gap-3 mb-6">
            <Link
              href={`/explore?mode=recipes${searchQuery ? `&q=${searchQuery}` : ''}`}
              className={`px-5 py-2.5 rounded-xl font-semibold transition-all duration-200 ${
                mode === 'recipes'
                  ? 'bg-accent text-white shadow-apple-lg active:scale-[0.98]'
                  : 'bg-surface text-text-secondary hover:bg-surface-hover border border-border shadow-apple hover:shadow-apple-lg'
              }`}
            >
              Recipes
            </Link>
            <Link
              href={`/explore?mode=people${searchQuery ? `&q=${searchQuery}` : ''}`}
              className={`px-5 py-2.5 rounded-xl font-semibold transition-all duration-200 ${
                mode === 'people'
                  ? 'bg-accent text-white shadow-apple-lg active:scale-[0.98]'
                  : 'bg-surface text-text-secondary hover:bg-surface-hover border border-border shadow-apple hover:shadow-apple-lg'
              }`}
            >
              People
            </Link>
          </div>

          <SearchBar initialQuery={searchQuery} />
        </div>

        {/* Search Results Info */}
        {searchQuery && (
          <div className="mb-6">
            <p className="text-base text-text-secondary mb-2">
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
              className="text-base text-accent hover:text-accent-hover font-medium transition-colors"
            >
              Clear search
            </Link>
          </div>
        )}

        {/* Trending Recipes */}
        {mode === 'recipes' && !searchQuery && trendingRecipes.length > 0 && (
          <TrendingRecipes recipes={trendingRecipes} />
        )}

        {/* Recipe Feed */}
        {mode === 'recipes' && (
          <>
            {recipesData.length === 0 ? (
              <div className="bg-surface rounded-2xl shadow-apple p-12 text-center border border-border">
                <div className="text-6xl mb-6">🔍</div>
                <p className="text-lg text-text-secondary mb-6">
                  {searchQuery
                    ? 'No recipes found matching your search.'
                    : 'No recipes yet. Be the first to share a recipe!'}
                </p>
                {!searchQuery && (
                  <Link
                    href="/recipes/new"
                    className="inline-block px-6 py-3 bg-accent text-white rounded-xl hover:bg-accent-hover shadow-apple-lg font-semibold active:scale-[0.98] transition-all duration-200"
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
                    <p className="text-text-muted text-sm">You've reached the end!</p>
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
              <div className="bg-surface rounded-2xl shadow-apple p-12 text-center border border-border">
                <div className="text-6xl mb-6">👥</div>
                <p className="text-lg text-text-secondary">
                  {searchQuery ? 'No people found matching your search.' : 'No users to show.'}
                </p>
              </div>
            ) : (
              <div className="space-y-5">
                {peopleData.map((person) => (
                  <Link
                    key={person.id}
                    href={`/profile/${person.username}`}
                    className="flex items-center gap-5 p-5 bg-surface rounded-2xl shadow-apple hover:shadow-apple-lg transition-all duration-200 border border-border hover:scale-[1.01]"
                  >
                    {person.avatar_url ? (
                      <img
                        src={person.avatar_url}
                        alt={person.display_name || person.username}
                        className="w-16 h-16 rounded-full object-cover border-2 border-border-light"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center border-2 border-border-light">
                        <span className="text-2xl">👤</span>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-text-primary text-base mb-1 truncate">
                        {person.display_name || person.username}
                      </p>
                      <p className="text-sm text-text-muted truncate">@{person.username}</p>
                      {person.bio && (
                        <p className="text-sm text-text-secondary mt-2 line-clamp-2">{person.bio}</p>
                      )}
                    </div>
                  </Link>
                ))}

                {/* Load More Button */}
                {hasMore && <LoadMoreButton currentPage={currentPage} totalPages={0} />}

                {/* End of Results */}
                {!hasMore && peopleData.length > 0 && (
                  <div className="text-center py-8">
                    <p className="text-text-muted text-sm">You've reached the end!</p>
                  </div>
                )}
              </div>
            )}
          </>
        )}
    </Layout>
  )
}
