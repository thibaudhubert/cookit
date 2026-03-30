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
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-8 flex items-start gap-3">
          <span className="text-2xl flex-shrink-0">💡</span>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
              Pro Tip
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Follow friends to see their recipes here in your personalized feed. Until then, explore what the community is cooking!
            </p>
          </div>
          <button
            onClick={() => setShowTip(false)}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 flex-shrink-0"
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
