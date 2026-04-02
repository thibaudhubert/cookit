import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="text-center">
        <div className="mb-8">
          <span className="text-8xl">🍴</span>
        </div>
        <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
        <p className="text-2xl text-gray-600 mb-8">Page Not Found</p>
        <p className="text-gray-500 mb-8 max-w-md mx-auto">
          This page doesn't exist or may have been moved.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/feed"
            className="px-6 py-3 bg-gray-900 text-white rounded-md hover:bg-gray-800 font-medium"
          >
            Go to Feed
          </Link>
          <Link
            href="/explore"
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 font-medium"
          >
            Explore Recipes
          </Link>
        </div>
      </div>
    </div>
  )
}
