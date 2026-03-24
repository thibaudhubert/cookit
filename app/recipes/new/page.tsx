'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Navbar } from '@/components/Navbar'
import { Plus, X, Upload, GripVertical } from 'lucide-react'
import type { Difficulty } from '@/lib/types'

interface IngredientInput {
  id: string
  text: string
}

interface StepInput {
  id: string
  instruction: string
  image_url: string | null
}

export default function NewRecipePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form fields
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [prepTime, setPrepTime] = useState('')
  const [cookTime, setCookTime] = useState('')
  const [servings, setServings] = useState('')
  const [difficulty, setDifficulty] = useState<Difficulty>('easy')
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)

  // Dynamic lists
  const [ingredients, setIngredients] = useState<IngredientInput[]>([
    { id: crypto.randomUUID(), text: '' }
  ])
  const [steps, setSteps] = useState<StepInput[]>([
    { id: crypto.randomUUID(), instruction: '', image_url: null }
  ])

  const addIngredient = () => {
    setIngredients([...ingredients, { id: crypto.randomUUID(), text: '' }])
  }

  const removeIngredient = (id: string) => {
    if (ingredients.length > 1) {
      setIngredients(ingredients.filter(ing => ing.id !== id))
    }
  }

  const updateIngredient = (id: string, text: string) => {
    setIngredients(ingredients.map(ing => ing.id === id ? { ...ing, text } : ing))
  }

  const addStep = () => {
    setSteps([...steps, { id: crypto.randomUUID(), instruction: '', image_url: null }])
  }

  const removeStep = (id: string) => {
    if (steps.length > 1) {
      setSteps(steps.filter(step => step.id !== id))
    }
  }

  const updateStep = (id: string, instruction: string) => {
    setSteps(steps.map(step => step.id === id ? { ...step, instruction } : step))
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setImageFile(file)
    // Create preview URL
    const previewUrl = URL.createObjectURL(file)
    setImageUrl(previewUrl)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const supabase = createClient()

      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('You must be logged in to create a recipe')
      }

      // Upload image if provided
      let uploadedImageUrl: string | null = null
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop()
        const fileName = `${crypto.randomUUID()}.${fileExt}`
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('recipe-images')
          .upload(fileName, imageFile)

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
          .from('recipe-images')
          .getPublicUrl(fileName)

        uploadedImageUrl = publicUrl
      }

      // Insert recipe
      const { data: recipe, error: recipeError } = await supabase
        .from('recipes')
        .insert({
          author_id: user.id,
          title,
          description: description || null,
          image_url: uploadedImageUrl,
          prep_time_minutes: prepTime ? parseInt(prepTime) : null,
          cook_time_minutes: cookTime ? parseInt(cookTime) : null,
          servings: servings ? parseInt(servings) : null,
          difficulty,
        })
        .select()
        .single()

      if (recipeError) throw recipeError

      // Insert ingredients
      const ingredientsData = ingredients
        .filter(ing => ing.text.trim())
        .map((ing, index) => ({
          recipe_id: recipe.id,
          position: index + 1,
          text: ing.text,
        }))

      if (ingredientsData.length > 0) {
        const { error: ingredientsError } = await supabase
          .from('recipe_ingredients')
          .insert(ingredientsData)

        if (ingredientsError) throw ingredientsError
      }

      // Insert steps
      const stepsData = steps
        .filter(step => step.instruction.trim())
        .map((step, index) => ({
          recipe_id: recipe.id,
          position: index + 1,
          instruction: step.instruction,
          image_url: step.image_url,
        }))

      if (stepsData.length > 0) {
        const { error: stepsError } = await supabase
          .from('recipe_steps')
          .insert(stepsData)

        if (stepsError) throw stepsError
      }

      // Redirect to recipe page
      router.push(`/recipes/${recipe.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create recipe')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Create New Recipe</h1>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-md">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Info */}
          <div className="bg-white rounded-lg shadow p-6 space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Basic Information</h2>

            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Recipe Title *
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                maxLength={150}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900"
                placeholder="e.g., Classic Chocolate Chip Cookies"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={500}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900"
                placeholder="A brief description of your recipe..."
              />
              <p className="text-xs text-gray-500 mt-1">{description.length}/500</p>
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Recipe Image
              </label>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50 transition-colors">
                  <Upload className="w-4 h-4" />
                  <span className="text-sm">Upload Image</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
                {imageUrl && (
                  <div className="relative">
                    <img
                      src={imageUrl}
                      alt="Preview"
                      className="w-24 h-24 object-cover rounded-md"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImageUrl(null)
                        setImageFile(null)
                      }}
                      className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Time and Servings */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label htmlFor="prep-time" className="block text-sm font-medium text-gray-700 mb-1">
                  Prep Time (min)
                </label>
                <input
                  id="prep-time"
                  type="number"
                  min="0"
                  value={prepTime}
                  onChange={(e) => setPrepTime(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
              </div>

              <div>
                <label htmlFor="cook-time" className="block text-sm font-medium text-gray-700 mb-1">
                  Cook Time (min)
                </label>
                <input
                  id="cook-time"
                  type="number"
                  min="0"
                  value={cookTime}
                  onChange={(e) => setCookTime(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
              </div>

              <div>
                <label htmlFor="servings" className="block text-sm font-medium text-gray-700 mb-1">
                  Servings
                </label>
                <input
                  id="servings"
                  type="number"
                  min="1"
                  value={servings}
                  onChange={(e) => setServings(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
              </div>

              <div>
                <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700 mb-1">
                  Difficulty
                </label>
                <select
                  id="difficulty"
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as Difficulty)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
            </div>
          </div>

          {/* Ingredients */}
          <div className="bg-white rounded-lg shadow p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Ingredients</h2>
              <button
                type="button"
                onClick={addIngredient}
                className="flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Ingredient
              </button>
            </div>

            <div className="space-y-2">
              {ingredients.map((ingredient, index) => (
                <div key={ingredient.id} className="flex items-center gap-2">
                  <GripVertical className="w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={ingredient.text}
                    onChange={(e) => updateIngredient(ingredient.id, e.target.value)}
                    placeholder={`Ingredient ${index + 1} (e.g., 200g flour)`}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900"
                  />
                  {ingredients.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeIngredient(ingredient.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Steps */}
          <div className="bg-white rounded-lg shadow p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Instructions</h2>
              <button
                type="button"
                onClick={addStep}
                className="flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Step
              </button>
            </div>

            <div className="space-y-4">
              {steps.map((step, index) => (
                <div key={step.id} className="flex gap-2">
                  <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-gray-900 text-white rounded-full font-semibold text-sm">
                    {index + 1}
                  </div>
                  <div className="flex-1 space-y-2">
                    <textarea
                      value={step.instruction}
                      onChange={(e) => updateStep(step.id, e.target.value)}
                      placeholder={`Step ${index + 1} instructions...`}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900"
                    />
                  </div>
                  {steps.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeStep(step.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !title.trim()}
              className="px-6 py-3 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Publishing...' : 'Publish Recipe'}
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}
