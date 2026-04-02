import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Layout from '@/components/ui/Layout'
import AppHeader from '@/components/ui/AppHeader'
import PageHeader from '@/components/ui/PageHeader'
import EmptyState from '@/components/ui/EmptyState'
import type { Profile } from '@/lib/types/recipe'

export default async function FriendsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth')
  }

  // Get friends list
  const { data: friends } = await supabase.rpc('get_friends', {
    user_id: user.id,
  })

  const friendsData = (friends || []) as Profile[]

  const handleSignOut = async () => {
    'use server'
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/')
  }

  return (
    <Layout maxWidth="md" header={<AppHeader onSignOut={handleSignOut} />}>
      <PageHeader title="Friends" />

      {friendsData.length === 0 ? (
        <EmptyState
          icon="👥"
          title="No friends yet"
          description="Start following other cooks to see their recipes in your feed."
          action={
            <Link
              href="/explore?mode=people"
              className="inline-block px-6 py-3 bg-accent text-white rounded-xl hover:bg-accent-hover shadow-apple-lg font-semibold active:scale-[0.98] transition-all duration-200"
            >
              Find People
            </Link>
          }
        />
      ) : (
        <div className="space-y-5">
          {friendsData.map((friend) => (
            <Link
              key={friend.id}
              href={`/profile/${friend.username}`}
              className="flex items-center gap-5 p-5 bg-surface rounded-2xl shadow-apple hover:shadow-apple-lg transition-all duration-200 border border-border hover:scale-[1.01]"
            >
              {friend.avatar_url ? (
                <img
                  src={friend.avatar_url}
                  alt={friend.display_name || friend.username}
                  className="w-16 h-16 rounded-full object-cover border-2 border-border-light"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center border-2 border-border-light">
                  <span className="text-2xl">👤</span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-text-primary text-base mb-1 truncate">
                  {friend.display_name || friend.username}
                </p>
                <p className="text-sm text-text-muted truncate">@{friend.username}</p>
                {friend.bio && (
                  <p className="text-sm text-text-secondary mt-2 line-clamp-2">{friend.bio}</p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </Layout>
  )
}
