import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/Navbar'
import { Clock, Users, ChefHat, User } from 'lucide-react'
import { notFound } from 'next/navigation'
import type { Recipe, RecipeIngredient, RecipeStep, Profile } from '@/lib/types'
import Link from 'next/link'

interface RecipePageProps {
  params: {
    id: string
  }
}

export default async function RecipePage({ params }: RecipePageProps) {
  const supabase = await createClient()

  // Fetch recipe with author profile
  const { data: recipe, error: recipeError } = await supabase
    .from('recipes')
    .select(`
      *,
      author:profiles(*)
    `)
    .eq('id', params.id)
    .single()

  if (recipeError || !recipe) {
    notFound()
  }

  // Fetch ingredients
  const { data: ingredients } = await supabase
    .from('recipe_ingredients')
    .select('*')
    .eq('recipe_id', params.id)
    .order('position', { ascending: true })

  // Fetch steps
  const { data: steps } = await supabase
    .from('recipe_steps')
    .select('*')
    .eq('recipe_id', params.id)
    .order('position', { ascending: true })

  const totalTime = (recipe.prep_time_minutes || 0) + (recipe.cook_time_minutes || 0)

  const difficultyColors: Record<string, string> = {
    easy: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    hard: 'bg-red-100 text-red-800',
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Image */}
        {recipe.image_url && (
          <div className="w-full h-96 rounded-lg overflow-hidden mb-8">
            <img
              src={recipe.image_url}
              alt={recipe.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{recipe.title}</h1>

          {recipe.description && (
            <p className="text-lg text-gray-600 mb-6">{recipe.description}</p>
          )}

          {/* Author Info */}
          <div className="flex items-center justify-between">
            <Link
              href={`/profile/${recipe.author.id}`}
              className="flex items-center gap-3 hover:opacity-80 transition-opacity"
            >
              {recipe.author.avatar_url ? (
                <img
                  src={recipe.author.avatar_url}
                  alt={recipe.author.display_name || recipe.author.username}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                  <User className="w-6 h-6 text-gray-600" />
                </div>
              )}
              <div>
                <p className="font-semibold text-gray-900">
                  {recipe.author.display_name || recipe.author.username}
                </p>
                <p className="text-sm text-gray-500">
                  {new Date(recipe.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            </Link>
          </div>
        </div>

        {/* Metadata Bar */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {recipe.prep_time_minutes && (
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-gray-600" />
                <div>
                  <p className="text-sm text-gray-500">Prep Time</p>
                  <p className="font-semibold text-gray-900">{recipe.prep_time_minutes} min</p>
                </div>
              </div>
            )}

            {recipe.cook_time_minutes && (
              <div className="flex items-center gap-2">
                <ChefHat className="w-5 h-5 text-gray-600" />
                <div>
                  <p className="text-sm text-gray-500">Cook Time</p>
                  <p className="font-semibold text-gray-900">{recipe.cook_time_minutes} min</p>
                </div>
              </div>
            )}

            {recipe.servings && (
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-gray-600" />
                <div>
                  <p className="text-sm text-gray-500">Servings</p>
                  <p className="font-semibold text-gray-900">{recipe.servings}</p>
                </div>
              </div>
            )}

            {recipe.difficulty && (
              <div>
                <p className="text-sm text-gray-500 mb-1">Difficulty</p>
                <span
                  className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                    difficultyColors[recipe.difficulty]
                  }`}
                >
                  {recipe.difficulty.charAt(0).toUpperCase() + recipe.difficulty.slice(1)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Ingredients */}
        {ingredients && ingredients.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Ingredients</h2>
            <ul className="space-y-2">
              {ingredients.map((ingredient) => (
                <li key={ingredient.id} className="flex items-start gap-2">
                  <span className="text-gray-600 mt-1">•</span>
                  <span className="text-gray-800">{ingredient.text}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Instructions */}
        {steps && steps.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Instructions</h2>
            <div className="space-y-6">
              {steps.map((step) => (
                <div key={step.id} className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-gray-900 text-white rounded-full font-semibold">
                    {step.position}
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-800 leading-relaxed">{step.instruction}</p>
                    {step.image_url && (
                      <img
                        src={step.image_url}
                        alt={`Step ${step.position}`}
                        className="mt-4 rounded-lg max-w-md"
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
