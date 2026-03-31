'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

const SHOWCASE_RECIPES = [
  { title: 'Beef Wellington', image: 'https://images.unsplash.com/photo-1615937722923-67f6deaf2cc9?w=800&h=600&fit=crop' },
  { title: 'Boeuf Bourguignon', image: 'https://images.unsplash.com/photo-1607621054049-6562c4e229c4?w=800&h=600&fit=crop' },
  { title: 'Roasted Cauliflower', image: 'https://images.unsplash.com/photo-1568584711271-16fdf9143003?w=800&h=600&fit=crop' },
  { title: 'Perfect Scrambled Eggs', image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=800&h=600&fit=crop' },
  { title: 'Chocolate Cake', image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&h=600&fit=crop' },
  { title: 'Quick Tomato Pasta', image: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=800&h=600&fit=crop' },
]

export default function AuthPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleGoogleSignIn = async () => {
    setLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) throw error
    } catch (err: any) {
      setError(err.message || 'An error occurred during sign in')
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-app">
      {/* Left Side - Recipe Showcase (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-accent/5 to-accent/10 p-12 items-center justify-center">
        <div className="max-w-2xl">
          <h2 className="text-5xl font-bold text-text-primary tracking-tight mb-4">
            Discover & Share
            <br />
            Amazing Recipes
          </h2>
          <p className="text-xl text-text-secondary mb-12">
            Join our community of food lovers and explore thousands of delicious recipes
          </p>

          {/* Recipe Grid */}
          <div className="grid grid-cols-3 gap-4">
            {SHOWCASE_RECIPES.map((recipe, index) => (
              <div
                key={index}
                className="relative aspect-square rounded-2xl overflow-hidden shadow-apple-lg hover:shadow-apple-xl transition-all duration-300 hover:scale-105"
              >
                <img
                  src={recipe.image}
                  alt={recipe.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0" />
                <div className="absolute bottom-3 left-3 right-3">
                  <p className="text-white text-sm font-semibold line-clamp-2">
                    {recipe.title}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Side - Sign In Form */}
      <div className="flex-1 flex items-center justify-center px-4 py-12 lg:w-1/2">
        <div className="w-full max-w-md">
          {/* Logo - mobile only */}
          <div className="text-center mb-10 lg:hidden">
            <div className="inline-flex items-center gap-2 mb-6">
              <span className="text-7xl">🍴</span>
            </div>
            <h1 className="text-4xl font-bold text-text-primary tracking-tight mb-3">Welcome to Cookit</h1>
            <p className="text-lg text-text-secondary">Sign in to start sharing recipes</p>
          </div>

          {/* Desktop heading */}
          <div className="hidden lg:block text-center mb-10">
            <div className="inline-flex items-center gap-2 mb-6">
              <span className="text-7xl">🍴</span>
            </div>
            <h1 className="text-4xl font-bold text-text-primary tracking-tight mb-3">Welcome Back</h1>
            <p className="text-lg text-text-secondary">Sign in to continue</p>
          </div>

          {/* Auth Card */}
          <div className="bg-surface rounded-2xl shadow-apple-lg p-10 border border-border-light">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-surface border border-border rounded-xl hover:bg-surface-hover shadow-apple hover:shadow-apple-lg transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span className="text-text-primary">
                {loading ? 'Signing in...' : 'Continue with Google'}
              </span>
            </button>

            <p className="text-center text-sm text-text-muted mt-8">
              By signing in, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
