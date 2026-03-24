import { Navbar } from '@/components/Navbar'

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Your Profile 👤
          </h1>
          <p className="text-gray-600">
            View and edit your profile, recipes, and settings.
          </p>
        </div>
      </main>
    </div>
  )
}
