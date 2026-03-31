'use client'

import { useState } from 'react'
import HeroOnboarding from './HeroOnboarding'
import TrendingRecipes from './TrendingRecipes'
import PopularCreators from './PopularCreators'
import QuickActions from './QuickActions'
import type { RecipeWithSocialData, Profile } from '@/lib/types/recipe'

interface FeedEmptyProps {
  userName?: string
  trendingRecipes: RecipeWithSocialData[]
  popularCreators: (Profile & { recipe_count: number })[]
}

export default function FeedEmpty({ userName, trendingRecipes, popularCreators }: FeedEmptyProps) {
  const [showTip, setShowTip] = useState(true)

  return (
    <div className="max-w-4xl mx-auto">
      {/* Hero Onboarding */}
      <HeroOnboarding userName={userName} />

      {/* Dismissible Tip Card */}
      {showTip && (
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 mb-10 flex items-start gap-4 shadow-apple">
          <span className="text-2xl flex-shrink-0">💡</span>
          <div className="flex-1">
            <h3 className="font-semibold text-text-primary text-lg mb-2">
              Pro Tip
            </h3>
            <p className="text-base text-text-secondary">
              Follow friends to see their recipes here in your personalized feed. Until then, explore what the community is cooking!
            </p>
          </div>
          <button
            onClick={() => setShowTip(false)}
            className="text-text-muted hover:text-text-secondary flex-shrink-0 text-xl transition-colors"
            aria-label="Dismiss tip"
          >
            ✕
          </button>
        </div>
      )}

      {/* Quick Actions */}
      <QuickActions />

      {/* Trending Recipes */}
      {trendingRecipes.length > 0 && (
        <TrendingRecipes recipes={trendingRecipes} />
      )}

      {/* Popular Creators */}
      {popularCreators.length > 0 && (
        <PopularCreators creators={popularCreators} />
      )}
    </div>
  )
}
