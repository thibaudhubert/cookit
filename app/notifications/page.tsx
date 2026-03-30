import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import NotificationBell from '@/components/NotificationBell'
import NotificationList from '@/components/NotificationList'

interface Notification {
  id: string
  actor_id: string
  type: string
  recipe_id: string | null
  read: boolean
  created_at: string
  actor: {
    username: string
    display_name: string | null
    avatar_url: string | null
  }
  recipe?: {
    title: string
  } | null
}

export default async function NotificationsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth')
  }

  // Fetch all notifications with actor and recipe details
  const { data: notifications } = await supabase
    .from('notifications')
    .select(
      `
      *,
      actor:profiles!notifications_actor_id_fkey(username, display_name, avatar_url),
      recipe:recipes(title)
    `
    )
    .eq('recipient_id', user.id)
    .order('created_at', { ascending: false })

  const notificationsData = (notifications || []) as unknown as Notification[]

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
              <Link
                href="/explore"
                className="text-gray-600 hover:text-gray-900 text-sm sm:text-base"
              >
                Explore
              </Link>
              <Link
                href="/friends"
                className="text-gray-600 hover:text-gray-900 text-sm sm:text-base"
              >
                Friends
              </Link>
              <NotificationBell />
              <Link
                href="/profile"
                className="text-gray-600 hover:text-gray-900 text-sm sm:text-base"
              >
                Profile
              </Link>
              <form action={handleSignOut}>
                <button type="submit" className="text-sm text-gray-600 hover:text-gray-900">
                  Sign Out
                </button>
              </form>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">Notifications</h1>

        <NotificationList notifications={notificationsData} userId={user.id} />
      </main>
    </div>
  )
}
