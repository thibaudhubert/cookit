import Link from 'next/link'

export default function QuickActions() {
  const actions = [
    {
      icon: '📝',
      title: 'Create a Recipe',
      description: 'Share your culinary creations',
      href: '/recipes/new',
      gradient: 'from-blue-50 to-indigo-50',
      border: 'border-blue-100',
    },
    {
      icon: '🔍',
      title: 'Explore Recipes',
      description: 'Discover delicious dishes',
      href: '/explore',
      gradient: 'from-green-50 to-emerald-50',
      border: 'border-green-100',
    },
    {
      icon: '👥',
      title: 'Find Friends',
      description: 'Connect with other cooks',
      href: '/explore?mode=people',
      gradient: 'from-purple-50 to-pink-50',
      border: 'border-purple-100',
    },
  ]

  return (
    <div className="mb-10">
      <h2 className="text-2xl font-bold text-text-primary tracking-tight mb-6">
        Quick Actions
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {actions.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className="group block"
          >
            <div
              className={`bg-gradient-to-br ${action.gradient} ${action.border} rounded-2xl p-7 border shadow-apple hover:shadow-apple-lg transition-all duration-200 hover:scale-[1.02]`}
            >
              <div className="text-4xl mb-4">{action.icon}</div>
              <h3 className="font-semibold text-text-primary text-lg mb-2 group-hover:text-accent transition-colors">
                {action.title}
              </h3>
              <p className="text-base text-text-secondary">
                {action.description}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
