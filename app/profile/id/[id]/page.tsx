import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import FriendshipButton from '@/components/FriendshipButton'
import RecipeCardGrid from '@/components/RecipeCardGrid'
import Layout from '@/components/ui/Layout'
import AppHeader from '@/components/ui/AppHeader'
import type { Profile, RecipeWithSocialData } from '@/lib/types/recipe'

interface PageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{ tab?: string }>
}

export default async function UserProfileByIdPage({ params, searchParams }: PageProps) {
  const { id } = await params
  const { tab = 'recipes' } = await searchParams
  const supabase = await createClient()

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth')
  }

  // Fetch profile by ID
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single()

  if (profileError || !profile) {
    notFound()
  }

  const profileData = profile as Profile
  const isOwnProfile = user.id === profileData.id

  // Get friendship status
  let friendshipStatus = 'none'
  let friendshipId: string | undefined

  if (!isOwnProfile) {
    const { data: status } = await supabase.rpc('get_friendship_status', {
      other_user_id: profileData.id,
    })
    friendshipStatus = status || 'none'

    // Get friendship ID if there's a pending received request
    if (friendshipStatus === 'pending_received') {
      const { data: friendshipData } = await supabase
        .from('friendships')
        .select('id')
        .eq('addressee_id', user.id)
        .eq('requester_id', profileData.id)
        .eq('status', 'pending')
        .single()

      friendshipId = friendshipData?.id
    }
  }

  // Get friend count
  const { data: friends } = await supabase.rpc('get_friends', {
    user_id: profileData.id,
  })
  const friendCount = friends?.length || 0

  // Get all recipes with social data
  const { data: allRecipes } = await supabase.rpc('get_feed_recipes', {
    p_user_id: user.id,
    p_limit: 100,
    p_offset: 0,
    p_search_query: null,
    p_friends_only: false,
  })

  // Filter to only this user's recipes
  const userRecipes = (allRecipes || []).filter(
    (recipe: RecipeWithSocialData) => recipe.author_id === profileData.id
  )

  // Get liked recipes
  const { data: likedRecipesData } = await supabase
    .from('likes')
    .select('recipe_id')
    .eq('user_id', profileData.id)

  const likedRecipeIds = (likedRecipesData || []).map((like) => like.recipe_id)
  const likedRecipes = (allRecipes || []).filter((recipe: RecipeWithSocialData) =>
    likedRecipeIds.includes(recipe.id)
  )

  // Get bookmarked recipes (only if own profile)
  let bookmarkedRecipes: RecipeWithSocialData[] = []
  if (isOwnProfile) {
    const { data: bookmarksData } = await supabase
      .from('bookmarks')
      .select('recipe_id')
      .eq('user_id', user.id)

    const bookmarkedRecipeIds = (bookmarksData || []).map((bookmark) => bookmark.recipe_id)
    bookmarkedRecipes = (allRecipes || []).filter((recipe: RecipeWithSocialData) =>
      bookmarkedRecipeIds.includes(recipe.id)
    )
  }

  const recipeCount = userRecipes.length

  const handleSignOut = async () => {
    'use server'
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/')
  }

  return (
    <Layout maxWidth="lg" header={<AppHeader onSignOut={handleSignOut} />}>
        {/* Profile Header */}
        <div className="bg-surface rounded-2xl shadow-apple overflow-hidden mb-10 border border-border">
          <div className="p-10">
            <div className="flex flex-col sm:flex-row items-start gap-8 mb-8">
              {/* Avatar */}
              {profileData.avatar_url ? (
                <img
                  src={profileData.avatar_url}
                  alt={profileData.display_name || profileData.username || 'User'}
                  className="w-32 h-32 rounded-full object-cover border-4 border-border-light"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-gray-100 flex items-center justify-center border-4 border-border-light">
                  <span className="text-6xl">👤</span>
                </div>
              )}

              {/* Profile Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h1 className="text-4xl font-bold text-text-primary tracking-tight mb-2">
                      {profileData.display_name || profileData.username || 'User'}
                    </h1>
                    {profileData.username && (
                      <p className="text-lg text-text-muted mb-4">@{profileData.username}</p>
                    )}
                  </div>

                  {/* Action Button */}
                  {isOwnProfile ? (
                    <Link
                      href="/settings/profile"
                      className="px-5 py-2.5 border border-border rounded-xl text-text-primary hover:bg-surface-hover font-semibold shadow-apple hover:shadow-apple-lg transition-all duration-200 active:scale-[0.98]"
                    >
                      Edit Profile
                    </Link>
                  ) : (
                    <FriendshipButton
                      targetUserId={profileData.id}
                      initialStatus={
                        (friendshipStatus as
                          | 'none'
                          | 'friends'
                          | 'pending_sent'
                          | 'pending_received') || 'none'
                      }
                      friendshipId={friendshipId}
                    />
                  )}
                </div>

                {/* Stats */}
                <div className="flex items-center gap-8 mb-6">
                  <div>
                    <span className="font-bold text-text-primary text-xl">{recipeCount}</span>{' '}
                    <span className="text-base text-text-secondary">
                      {recipeCount === 1 ? 'recipe' : 'recipes'}
                    </span>
                  </div>
                  <div>
                    <span className="font-bold text-text-primary text-xl">{friendCount}</span>{' '}
                    <span className="text-base text-text-secondary">
                      {friendCount === 1 ? 'friend' : 'friends'}
                    </span>
                  </div>
                </div>

                {/* Bio */}
                {profileData.bio && <p className="text-base text-text-secondary">{profileData.bio}</p>}
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-t border-border">
            <nav className="flex">
              <Link
                href={`/profile/id/${id}?tab=recipes`}
                className={`flex-1 px-6 py-4 text-center font-semibold border-b-2 transition-colors ${
                  tab === 'recipes'
                    ? 'border-accent text-accent'
                    : 'border-transparent text-text-muted hover:text-text-secondary hover:border-border'
                }`}
              >
                Recipes
              </Link>
              <Link
                href={`/profile/id/${id}?tab=liked`}
                className={`flex-1 px-6 py-4 text-center font-semibold border-b-2 transition-colors ${
                  tab === 'liked'
                    ? 'border-accent text-accent'
                    : 'border-transparent text-text-muted hover:text-text-secondary hover:border-border'
                }`}
              >
                Liked
              </Link>
              {isOwnProfile && (
                <Link
                  href={`/profile/id/${id}?tab=bookmarks`}
                  className={`flex-1 px-6 py-4 text-center font-semibold border-b-2 transition-colors ${
                    tab === 'bookmarks'
                      ? 'border-accent text-accent'
                      : 'border-transparent text-text-muted hover:text-text-secondary hover:border-border'
                  }`}
                >
                  Bookmarks
                </Link>
              )}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {tab === 'recipes' && <RecipeCardGrid recipes={userRecipes} />}
          {tab === 'liked' && <RecipeCardGrid recipes={likedRecipes} />}
          {tab === 'bookmarks' && isOwnProfile && <RecipeCardGrid recipes={bookmarkedRecipes} />}
        </div>
    </Layout>
  )
}
