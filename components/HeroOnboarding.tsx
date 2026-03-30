import Link from 'next/link'

interface HeroOnboardingProps {
  userName?: string
}

export default function HeroOnboarding({ userName }: HeroOnboardingProps) {
  return (
    <div className="bg-gradient-to-br from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 rounded-2xl p-8 shadow-sm border border-blue-100 dark:border-blue-800 mb-8">
      <div className="max-w-2xl mx-auto text-center">
        {/* Illustration */}
        <div className="mb-6">
          <span className="text-6xl">🍴</span>
        </div>

        {/* Title */}
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">
          Welcome to Cookit{userName ? `, ${userName}` : ''}!
        </h2>

        {/* Description */}
        <p className="text-gray-600 dark:text-gray-300 mb-6 text-base sm:text-lg">
          Your personal feed will show recipes from friends you follow. Start by discovering
          trending recipes or connecting with other cooks.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/explore"
            className="px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 font-medium transition-colors"
          >
            Explore Recipes
          </Link>
          <Link
            href="/explore?mode=people"
            className="px-6 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 font-medium transition-colors"
          >
            Find Friends
          </Link>
        </div>
      </div>
    </div>
  )
}
