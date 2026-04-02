import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import DeleteRecipeButton from '@/components/DeleteRecipeButton'
import CommentSection from '@/components/CommentSection'
import RecipeImage from '@/components/RecipeImage'
import Layout from '@/components/ui/Layout'
import AppHeader from '@/components/ui/AppHeader'
import type { RecipeWithDetails } from '@/lib/types/recipe'

// Enable ISR caching for 5 minutes (content changes less frequently)
export const revalidate = 300

interface PageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params

  // Guard against reserved routes
  if (id === 'new' || id === 'create') {
    return {
      title: 'Create Recipe | Cookit',
    }
  }

  const supabase = await createClient()

  const { data: recipe, error } = await supabase
    .from('recipes')
    .select('title, description, image_url, author:profiles!recipes_author_id_fkey(display_name, username)')
    .eq('id', id)
    .single()

  if (error || !recipe) {
    // Log errors for debugging but return fallback metadata
    if (error) {
      console.error('Error fetching recipe metadata:', error)
    }
    return {
      title: 'Recipe Not Found | Cookit',
    }
  }

  const recipeData = recipe as any
  const authorName = recipeData.author?.display_name || recipeData.author?.username || 'Cookit User'

  return {
    title: `${recipe.title} by ${authorName} | Cookit`,
    description: recipe.description || `Check out this recipe by ${authorName} on Cookit`,
    openGraph: {
      title: recipe.title,
      description: recipe.description || `A delicious recipe by ${authorName}`,
      images: recipe.image_url ? [recipe.image_url] : [],
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: recipe.title,
      description: recipe.description || `A delicious recipe by ${authorName}`,
      images: recipe.image_url ? [recipe.image_url] : [],
    },
  }
}

export default async function RecipePage({ params }: PageProps) {
  const { id } = await params

  // Guard against reserved routes
  if (id === 'new' || id === 'create') {
    redirect('/recipes/new')
  }

  const supabase = await createClient()

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth')
  }

  // Fetch recipe and comments in parallel for better performance
  const [recipeResult, commentsResult] = await Promise.all([
    // Fetch recipe with all details
    supabase
      .from('recipes')
      .select(
        `
        *,
        author:profiles!recipes_author_id_fkey(*),
        ingredients:recipe_ingredients(*),
        steps:recipe_steps(*)
      `
      )
      .eq('id', id)
      .order('position', { referencedTable: 'recipe_ingredients', ascending: true })
      .order('position', { referencedTable: 'recipe_steps', ascending: true })
      .single(),

    // Fetch comments
    supabase
      .from('comments')
      .select(
        `
        *,
        author:profiles(username, display_name, avatar_url)
      `
      )
      .eq('recipe_id', id)
      .order('created_at', { ascending: true }),
  ])

  // Handle recipe errors properly
  if (recipeResult.error) {
    // PGRST116 = "not found" error from PostgREST
    if (recipeResult.error.code === 'PGRST116') {
      console.log(`Recipe not found: ${id}`)
      notFound()
    }
    // Any other error is a real database/query error - surface it
    console.error('Error fetching recipe:', recipeResult.error)
    throw new Error(`Failed to fetch recipe: ${recipeResult.error.message}`)
  }

  if (!recipeResult.data) {
    console.log(`Recipe returned null: ${id}`)
    notFound()
  }

  const recipeData = recipeResult.data as unknown as RecipeWithDetails
  const isOwner = user.id === recipeData.author_id
  const commentsData = (commentsResult.data || []) as any[]

  const handleSignOut = async () => {
    'use server'
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/')
  }

  return (
    <Layout maxWidth="lg" header={<AppHeader onSignOut={handleSignOut} />}>
        {/* Hero Image */}
        <div className="mb-10">
          <RecipeImage
            src={recipeData.image_url}
            alt={recipeData.title}
            className="w-full h-96 object-cover rounded-2xl shadow-apple-lg"
            fallbackClassName="w-full h-96 rounded-2xl"
            fallbackSize="large"
          />
        </div>

        {/* Recipe Header */}
        <div className="bg-surface rounded-2xl shadow-apple p-10 mb-8 border border-border">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-text-primary tracking-tight mb-3">
                {recipeData.title}
              </h1>
              {recipeData.description && (
                <p className="text-lg text-text-secondary">{recipeData.description}</p>
              )}
            </div>
            {isOwner && (
              <div className="flex gap-3 ml-4">
                <Link
                  href={`/recipes/${id}/edit`}
                  className="px-5 py-2.5 border border-border rounded-xl text-text-primary hover:bg-surface-hover font-semibold shadow-apple hover:shadow-apple-lg transition-all duration-200 active:scale-[0.98]"
                >
                  Edit
                </Link>
                <DeleteRecipeButton recipeId={id} />
              </div>
            )}
          </div>

          {/* Author Info */}
          <div className="flex items-center gap-4 mb-8 pb-8 border-b border-border">
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
        {recipeData.ingredients && recipeData.ingredients.length > 0 && (
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
        )}

        {/* Steps */}
        {recipeData.steps && recipeData.steps.length > 0 && (
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
        )}

        {/* Comments */}
        <CommentSection
          recipeId={id}
          recipeAuthorId={recipeData.author_id}
          currentUserId={user.id}
          initialComments={commentsData}
        />
    </Layout>
  )
}
