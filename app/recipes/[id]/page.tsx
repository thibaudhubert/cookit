import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import DeleteRecipeButton from '@/components/DeleteRecipeButton'
import type { RecipeWithDetails } from '@/lib/types/recipe'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function RecipePage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth')
  }

  // Fetch recipe with all details
  const { data: recipe, error: recipeError } = await supabase
    .from('recipes')
    .select(
      `
      *,
      author:profiles(*),
      ingredients:recipe_ingredients(*),
      steps:recipe_steps(*)
    `
    )
    .eq('id', id)
    .order('position', { referencedTable: 'recipe_ingredients', ascending: true })
    .order('position', { referencedTable: 'recipe_steps', ascending: true })
    .single()

  if (recipeError || !recipe) {
    notFound()
  }

  const recipeData = recipe as unknown as RecipeWithDetails
  const isOwner = user.id === recipeData.author_id

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/feed" className="flex items-center gap-2">
              <span className="text-2xl">🍴</span>
              <span className="text-xl font-bold text-gray-900">Cookit</span>
            </Link>
            <div className="flex items-center gap-6">
              <Link href="/feed" className="text-gray-600 hover:text-gray-900">
                Feed
              </Link>
              <Link href="/profile" className="text-gray-600 hover:text-gray-900">
                Profile
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Image */}
        {recipeData.image_url && (
          <div className="mb-8">
            <img
              src={recipeData.image_url}
              alt={recipeData.title}
              className="w-full h-96 object-cover rounded-lg shadow-sm"
            />
          </div>
        )}

        {/* Recipe Header */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                {recipeData.title}
              </h1>
              {recipeData.description && (
                <p className="text-lg text-gray-600">{recipeData.description}</p>
              )}
            </div>
            {isOwner && (
              <div className="flex gap-2 ml-4">
                <Link
                  href={`/recipes/${id}/edit`}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 text-sm"
                >
                  Edit
                </Link>
                <DeleteRecipeButton recipeId={id} />
              </div>
            )}
          </div>

          {/* Author Info */}
          <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-200">
            {recipeData.author.avatar_url ? (
              <img
                src={recipeData.author.avatar_url}
                alt={recipeData.author.display_name || recipeData.author.username}
                className="w-12 h-12 rounded-full"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                <span className="text-xl">👤</span>
              </div>
            )}
            <div>
              <p className="font-medium text-gray-900">
                {recipeData.author.display_name || recipeData.author.username}
              </p>
              <p className="text-sm text-gray-500">
                {new Date(recipeData.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Metadata */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {recipeData.prep_time_minutes !== null && (
              <div>
                <p className="text-sm text-gray-500">Prep Time</p>
                <p className="text-lg font-semibold text-gray-900">
                  {recipeData.prep_time_minutes} min
                </p>
              </div>
            )}
            {recipeData.cook_time_minutes !== null && (
              <div>
                <p className="text-sm text-gray-500">Cook Time</p>
                <p className="text-lg font-semibold text-gray-900">
                  {recipeData.cook_time_minutes} min
                </p>
              </div>
            )}
            {recipeData.servings !== null && (
              <div>
                <p className="text-sm text-gray-500">Servings</p>
                <p className="text-lg font-semibold text-gray-900">
                  {recipeData.servings}
                </p>
              </div>
            )}
            {recipeData.difficulty && (
              <div>
                <p className="text-sm text-gray-500">Difficulty</p>
                <p className="text-lg font-semibold text-gray-900 capitalize">
                  {recipeData.difficulty}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Ingredients */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Ingredients</h2>
          <ul className="space-y-2">
            {recipeData.ingredients.map((ingredient) => (
              <li key={ingredient.id} className="flex items-start">
                <span className="text-gray-400 mr-3">•</span>
                <span className="text-gray-700">{ingredient.text}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Steps */}
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Instructions</h2>
          <div className="space-y-6">
            {recipeData.steps.map((step, index) => (
              <div key={step.id} className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center font-semibold">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <p className="text-gray-700 mb-3">{step.instruction}</p>
                  {step.image_url && (
                    <img
                      src={step.image_url}
                      alt={`Step ${index + 1}`}
                      className="w-full max-w-md h-48 object-cover rounded-md"
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
