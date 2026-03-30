import Link from 'next/link'

export default function QuickActions() {
  const actions = [
    {
      icon: '📝',
      title: 'Create a Recipe',
      description: 'Share your culinary creations',
      href: '/recipes/new',
      color: 'from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800',
    },
    {
      icon: '🔍',
      title: 'Explore Recipes',
      description: 'Discover delicious dishes',
      href: '/explore',
      color: 'from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-800',
    },
    {
      icon: '👥',
      title: 'Find Friends',
      description: 'Connect with other cooks',
      href: '/explore?mode=people',
      color: 'from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-800',
    },
  ]

  return (
    <div className="mb-8">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Quick Actions
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {actions.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className="group block"
          >
            <div
              className={`bg-gradient-to-br ${action.color} rounded-xl p-6 border transition-all hover:shadow-md hover:scale-[1.02]`}
            >
              <div className="text-3xl mb-3">{action.icon}</div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                {action.title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {action.description}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
