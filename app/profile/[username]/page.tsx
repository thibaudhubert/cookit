import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import FriendshipButton from '@/components/FriendshipButton'
import RecipeCardGrid from '@/components/RecipeCardGrid'
import NotificationBell from '@/components/NotificationBell'
import type { Profile, RecipeWithSocialData } from '@/lib/types/recipe'

interface PageProps {
  params: Promise<{ username: string }>
  searchParams: Promise<{ tab?: string }>
}

export default async function UserProfilePage({ params, searchParams }: PageProps) {
  const { username } = await params
  const { tab = 'recipes' } = await searchParams
  const supabase = await createClient()

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth')
  }

  // Fetch profile by username
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username)
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
              <Link href="/feed" className="text-gray-600 hover:text-gray-900">
                Feed
              </Link>
              <Link href="/explore" className="text-gray-600 hover:text-gray-900">
                Explore
              </Link>
              <Link href="/friends" className="text-gray-600 hover:text-gray-900">
                Friends
              </Link>
              <NotificationBell />
              <Link href="/profile" className="text-gray-600 hover:text-gray-900">
                Profile
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
          <div className="p-8">
            <div className="flex flex-col sm:flex-row items-start gap-6 mb-6">
              {/* Avatar */}
              {profileData.avatar_url ? (
                <img
                  src={profileData.avatar_url}
                  alt={profileData.display_name || profileData.username}
                  className="w-32 h-32 rounded-full object-cover border-4 border-gray-100"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center border-4 border-gray-100">
                  <span className="text-6xl">👤</span>
                </div>
              )}

              {/* Profile Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h1 className="text-3xl font-bold text-gray-900 mb-1">
                      {profileData.display_name || profileData.username}
                    </h1>
                    <p className="text-gray-500 mb-3">@{profileData.username}</p>
                  </div>

                  {/* Action Button */}
                  {isOwnProfile ? (
                    <Link
                      href="/settings/profile"
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-medium"
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
                <div className="flex items-center gap-6 mb-4">
                  <div>
                    <span className="font-bold text-gray-900">{recipeCount}</span>{' '}
                    <span className="text-gray-600">
                      {recipeCount === 1 ? 'recipe' : 'recipes'}
                    </span>
                  </div>
                  <div>
                    <span className="font-bold text-gray-900">{friendCount}</span>{' '}
                    <span className="text-gray-600">
                      {friendCount === 1 ? 'friend' : 'friends'}
                    </span>
                  </div>
                </div>

                {/* Bio */}
                {profileData.bio && <p className="text-gray-700">{profileData.bio}</p>}
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-t border-gray-200">
            <nav className="flex">
              <Link
                href={`/profile/${username}?tab=recipes`}
                className={`flex-1 px-6 py-4 text-center font-medium border-b-2 transition-colors ${
                  tab === 'recipes'
                    ? 'border-gray-900 text-gray-900'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Recipes
              </Link>
              <Link
                href={`/profile/${username}?tab=liked`}
                className={`flex-1 px-6 py-4 text-center font-medium border-b-2 transition-colors ${
                  tab === 'liked'
                    ? 'border-gray-900 text-gray-900'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Liked
              </Link>
              {isOwnProfile && (
                <Link
                  href={`/profile/${username}?tab=bookmarks`}
                  className={`flex-1 px-6 py-4 text-center font-medium border-b-2 transition-colors ${
                    tab === 'bookmarks'
                      ? 'border-gray-900 text-gray-900'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
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
      </main>
    </div>
  )
}
