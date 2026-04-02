import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import RecipeCard from '@/components/RecipeCard'
import LoadMoreButton from '@/components/LoadMoreButton'
import FeedEmpty from '@/components/FeedEmpty'
import AppHeader from '@/components/ui/AppHeader'
import Layout from '@/components/ui/Layout'
import PageHeader from '@/components/ui/PageHeader'
import Button from '@/components/ui/Button'
import EmptyState from '@/components/ui/EmptyState'
import { getTrendingRecipes, getPopularCreators } from '@/lib/queries/trending'
import type { RecipeWithSocialData } from '@/lib/types/recipe'

const RECIPES_PER_PAGE = 20

// Enable ISR caching for 30 seconds (short cache for personalized content)
export const revalidate = 30

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

  // Fetch data in parallel for better performance
  const [recipesResult, profileResult] = await Promise.all([
    // Fetch recipes using database function
    supabase.rpc('get_feed_recipes', {
      p_user_id: user.id,
      p_limit: RECIPES_PER_PAGE,
      p_offset: (currentPage - 1) * RECIPES_PER_PAGE,
      p_search_query: null,
      p_friends_only: true,
    }),
    // Fetch user profile
    supabase
      .from('profiles')
      .select('display_name, username')
      .eq('id', user.id)
      .single(),
  ])

  if (recipesResult.error) {
    console.error('Error fetching recipes:', recipesResult.error)
  }

  const recipesData = (recipesResult.data || []) as RecipeWithSocialData[]
  const profile = profileResult.data

  // If feed is empty on first page, fetch trending content for empty state
  const showEmptyState = recipesData.length === 0 && currentPage === 1
  let trendingRecipes: RecipeWithSocialData[] = []
  let popularCreators: any[] = []

  if (showEmptyState) {
    // Fetch trending content in parallel
    const [trending, creators] = await Promise.all([
      getTrendingRecipes(6),
      getPopularCreators(6),
    ])
    trendingRecipes = trending
    popularCreators = creators
  }

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
    <Layout
      maxWidth="md"
      header={<AppHeader onSignOut={handleSignOut} />}
    >
      <PageHeader
        title="Your Feed"
        action={
          <Link href="/recipes/new">
            <Button>+ Create</Button>
          </Link>
        }
      />

      {recipesData.length === 0 ? (
        showEmptyState ? (
          <FeedEmpty
            userName={profile?.display_name || profile?.username}
            trendingRecipes={trendingRecipes}
            popularCreators={popularCreators}
          />
        ) : (
          <EmptyState
            title="No more recipes"
            description="You've reached the end of your feed."
          />
        )
      ) : (
        <div className="space-y-6">
          {recipesData.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}

          {hasMore && (
            <LoadMoreButton currentPage={currentPage} totalPages={totalPages} />
          )}

          {!hasMore && recipesData.length > 0 && (
            <div className="text-center py-8">
              <p className="text-text-muted text-sm">You've reached the end!</p>
            </div>
          )}
        </div>
      )}
    </Layout>
  )
}
