import Link from 'next/link'
import Button from '@/components/ui/Button'

interface HeroOnboardingProps {
  userName?: string
}

export default function HeroOnboarding({ userName }: HeroOnboardingProps) {
  return (
    <div className="bg-gradient-to-br from-blue-50 to-green-50 rounded-2xl p-8 shadow-sm border border-blue-100 mb-8">
      <div className="max-w-2xl mx-auto text-center">
        <div className="mb-6">
          <span className="text-6xl">🍴</span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-bold text-text-primary mb-3">
          Welcome to Cookit{userName ? `, ${userName}` : ''}!
        </h2>

        <p className="text-text-secondary mb-6 text-base sm:text-lg">
          Your personal feed will show recipes from friends you follow. Start by discovering
          trending recipes or connecting with other cooks.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/explore">
            <Button size="lg">Explore Recipes</Button>
          </Link>
          <Link href="/explore?mode=people">
            <Button variant="secondary" size="lg">Find Friends</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
