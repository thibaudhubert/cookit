import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import FriendshipButton from '@/components/FriendshipButton'
import RecipeCardGrid from '@/components/RecipeCardGrid'
import Layout from '@/components/ui/Layout'
import AppHeader from '@/components/ui/AppHeader'
import type { Profile, RecipeWithSocialData } from '@/lib/types/recipe'

// Enable ISR caching for 60 seconds
export const revalidate = 60

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

  // Fetch all data in parallel for better performance
  const [friendsResult, userRecipesResult, likedRecipesResult, bookmarkedRecipesResult] = await Promise.all([
    // Get friend count
    supabase.rpc('get_friends', { user_id: profileData.id }),

    // Get user's recipes directly (not all recipes)
    supabase
      .from('recipes')
      .select('*, author:profiles!recipes_author_id_fkey(username, display_name, avatar_url)')
      .eq('author_id', profileData.id)
      .order('created_at', { ascending: false })
      .limit(50),

    // Get liked recipe IDs
    supabase
      .from('likes')
      .select('recipe_id')
      .eq('user_id', profileData.id),

    // Get bookmarked recipe IDs (only if own profile)
    isOwnProfile
      ? supabase.from('bookmarks').select('recipe_id').eq('user_id', user.id)
      : Promise.resolve({ data: [] }),
  ])

  const friendCount = friendsResult.data?.length || 0

  // Transform user recipes to include social data
  const userRecipes = (userRecipesResult.data || []).map((recipe: any) => ({
    ...recipe,
    author_username: recipe.author?.username || '',
    author_display_name: recipe.author?.display_name || '',
    author_avatar_url: recipe.author?.avatar_url || null,
    like_count: 0,
    is_liked_by_me: false,
    is_bookmarked_by_me: false,
    comment_count: 0,
  })) as RecipeWithSocialData[]

  const recipeCount = userRecipes.length

  // Get liked recipes if we have any
  let likedRecipes: RecipeWithSocialData[] = []
  if (likedRecipesResult.data && likedRecipesResult.data.length > 0) {
    const likedRecipeIds = likedRecipesResult.data.map((like) => like.recipe_id)
    const { data: likedRecipesData } = await supabase
      .from('recipes')
      .select('*, author:profiles!recipes_author_id_fkey(username, display_name, avatar_url)')
      .in('id', likedRecipeIds)
      .limit(50)

    likedRecipes = (likedRecipesData || []).map((recipe: any) => ({
      ...recipe,
      author_username: recipe.author?.username || '',
      author_display_name: recipe.author?.display_name || '',
      author_avatar_url: recipe.author?.avatar_url || null,
      like_count: 0,
      is_liked_by_me: true,
      is_bookmarked_by_me: false,
      comment_count: 0,
    })) as RecipeWithSocialData[]
  }

  // Get bookmarked recipes if we have any
  let bookmarkedRecipes: RecipeWithSocialData[] = []
  if (isOwnProfile && bookmarkedRecipesResult.data && bookmarkedRecipesResult.data.length > 0) {
    const bookmarkedRecipeIds = bookmarkedRecipesResult.data.map((bookmark) => bookmark.recipe_id)
    const { data: bookmarkedRecipesData } = await supabase
      .from('recipes')
      .select('*, author:profiles!recipes_author_id_fkey(username, display_name, avatar_url)')
      .in('id', bookmarkedRecipeIds)
      .limit(50)

    bookmarkedRecipes = (bookmarkedRecipesData || []).map((recipe: any) => ({
      ...recipe,
      author_username: recipe.author?.username || '',
      author_display_name: recipe.author?.display_name || '',
      author_avatar_url: recipe.author?.avatar_url || null,
      like_count: 0,
      is_liked_by_me: false,
      is_bookmarked_by_me: true,
      comment_count: 0,
    })) as RecipeWithSocialData[]
  }

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
                <Image
                  src={profileData.avatar_url}
                  alt={profileData.display_name || profileData.username}
                  width={128}
                  height={128}
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
                      {profileData.display_name || profileData.username}
                    </h1>
                    <p className="text-lg text-text-muted mb-4">@{profileData.username}</p>
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
                href={`/profile/${username}?tab=recipes`}
                className={`flex-1 px-6 py-4 text-center font-semibold border-b-2 transition-colors ${
                  tab === 'recipes'
                    ? 'border-accent text-accent'
                    : 'border-transparent text-text-muted hover:text-text-secondary hover:border-border'
                }`}
              >
                Recipes
              </Link>
              <Link
                href={`/profile/${username}?tab=liked`}
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
                  href={`/profile/${username}?tab=bookmarks`}
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
