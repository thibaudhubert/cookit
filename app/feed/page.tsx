import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function FeedPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth')
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
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/feed" className="flex items-center gap-2">
              <span className="text-2xl">🍴</span>
              <span className="text-xl font-bold text-gray-900">Cookit</span>
            </Link>

            <div className="flex items-center gap-6">
              <Link href="/feed" className="text-gray-900 font-medium">
                Feed
              </Link>
              <Link href="/profile" className="text-gray-600 hover:text-gray-900">
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
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Welcome to your Feed! 🍳
          </h1>
          <p className="text-gray-600 mb-4">
            Signed in as: <strong>{user.email}</strong>
          </p>
          <p className="text-gray-500">
            This is your personalized recipe feed. Start sharing your favorite recipes with friends!
          </p>
        </div>
      </main>
    </div>
  )
}
