import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import FriendsList from '@/components/FriendsList'
import FriendRequests from '@/components/FriendRequests'

export default async function FriendsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>
}) {
  const supabase = await createClient()
  const params = await searchParams
  const activeTab = params.tab || 'friends'

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth')
  }

  // Fetch friends
  const { data: friends } = await supabase.rpc('get_friends', {
    user_id: user.id,
  })

  // Fetch pending requests (where user is addressee)
  const { data: pendingRequests } = await supabase
    .from('friendships')
    .select(
      `
      id,
      created_at,
      requester:profiles!friendships_requester_id_fkey(
        id,
        username,
        display_name,
        avatar_url
      )
    `
    )
    .eq('addressee_id', user.id)
    .eq('status', 'pending')
    .order('created_at', { ascending: false })

  const friendsData = (friends || []) as any[]
  const requestsData = (pendingRequests || []) as any[]

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
              <Link href="/friends" className="text-gray-900 font-medium">
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
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <Link
                href="/friends?tab=friends"
                className={`px-6 py-4 text-sm font-medium border-b-2 ${
                  activeTab === 'friends'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Friends ({friendsData.length})
              </Link>
              <Link
                href="/friends?tab=requests"
                className={`px-6 py-4 text-sm font-medium border-b-2 ${
                  activeTab === 'requests'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Requests
                {requestsData.length > 0 && (
                  <span className="ml-2 px-2 py-0.5 text-xs bg-red-500 text-white rounded-full">
                    {requestsData.length}
                  </span>
                )}
              </Link>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'friends' ? (
              <FriendsList friends={friendsData} currentUserId={user.id} />
            ) : (
              <FriendRequests requests={requestsData} />
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
