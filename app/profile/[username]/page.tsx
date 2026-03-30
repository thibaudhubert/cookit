import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import FriendshipButton from '@/components/FriendshipButton'
import RecipeCard from '@/components/RecipeCard'
import type { Profile, RecipeWithSocialData } from '@/lib/types/recipe'

interface PageProps {
  params: Promise<{ username: string }>
}

export default async function UserProfilePage({ params }: PageProps) {
  const { username } = await params
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

  // If viewing own profile, redirect to /profile
  if (isOwnProfile) {
    redirect('/profile')
  }

  // Get friendship status
  const { data: friendshipStatus } = await supabase.rpc('get_friendship_status', {
    other_user_id: profileData.id,
  })

  // Get friendship ID if there's a pending received request (needed for accept/decline)
  let friendshipId: string | undefined
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

  // Get friend count
  const { data: friends, count: friendCount } = await supabase.rpc('get_friends', {
    user_id: profileData.id,
  })

  // Get user's recipes
  const { data: recipes } = await supabase.rpc('get_feed_recipes', {
    p_user_id: user.id,
    p_limit: 50,
    p_offset: 0,
    p_search_query: null,
    p_friends_only: false,
  })

  // Filter to only this user's recipes
  const userRecipes = (recipes || []).filter(
    (recipe: RecipeWithSocialData) => recipe.author_id === profileData.id
  )

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
              <Link href="/profile" className="text-gray-600 hover:text-gray-900">
                Profile
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              {profileData.avatar_url ? (
                <img
                  src={profileData.avatar_url}
                  alt={profileData.display_name || profileData.username}
                  className="w-24 h-24 rounded-full object-cover"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-4xl">👤</span>
                </div>
              )}
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-1">
                  {profileData.display_name || profileData.username}
                </h1>
                <p className="text-gray-600 mb-2">@{profileData.username}</p>
                <p className="text-sm text-gray-500">
                  {friendCount || 0} {friendCount === 1 ? 'friend' : 'friends'}
                </p>
              </div>
            </div>

            {/* Friendship Button */}
            {!isOwnProfile && (
              <FriendshipButton
                targetUserId={profileData.id}
                initialStatus={
                  (friendshipStatus as 'none' | 'friends' | 'pending_sent' | 'pending_received') ||
                  'none'
                }
                friendshipId={friendshipId}
              />
            )}
          </div>

          {profileData.bio && (
            <div className="border-t border-gray-200 pt-4">
              <p className="text-gray-700">{profileData.bio}</p>
            </div>
          )}
        </div>

        {/* User's Recipes */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Recipes by {profileData.display_name || profileData.username}
          </h2>

          {userRecipes.length > 0 ? (
            <div className="grid grid-cols-1 gap-6">
              {userRecipes.map((recipe: RecipeWithSocialData) => (
                <RecipeCard key={recipe.id} recipe={recipe} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <p className="text-gray-500">
                {profileData.display_name || profileData.username} hasn't shared any recipes
                yet.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
