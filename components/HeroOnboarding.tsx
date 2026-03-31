import Link from 'next/link'
import Button from '@/components/ui/Button'

interface HeroOnboardingProps {
  userName?: string
}

export default function HeroOnboarding({ userName }: HeroOnboardingProps) {
  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl p-10 shadow-apple-lg border border-border-light mb-10">
      <div className="max-w-2xl mx-auto text-center">
        <div className="mb-8">
          <span className="text-7xl">🍴</span>
        </div>

        <h2 className="text-3xl sm:text-4xl font-bold text-text-primary tracking-tight mb-4">
          Welcome to Cookit{userName ? `, ${userName}` : ''}!
        </h2>

        <p className="text-lg text-text-secondary mb-8">
          Your personal feed will show recipes from friends you follow. Start by discovering
          trending recipes or connecting with other cooks.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
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
