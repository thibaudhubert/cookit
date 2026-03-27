'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState, useRef, DragEvent, ChangeEvent } from 'react'
import Link from 'next/link'

interface Ingredient {
  text: string
}

interface Step {
  instruction: string
  image_url: string | null
  image_file?: File | null
  image_preview?: string | null
}

export default function NewRecipePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form fields
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [prepTime, setPrepTime] = useState('')
  const [cookTime, setCookTime] = useState('')
  const [servings, setServings] = useState('')
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium')
  const [ingredients, setIngredients] = useState<Ingredient[]>([{ text: '' }])
  const [steps, setSteps] = useState<Step[]>([{ instruction: '', image_url: null }])

  const fileInputRef = useRef<HTMLInputElement>(null)
  const stepFileInputRefs = useRef<(HTMLInputElement | null)[]>([])

  // Image upload handlers
  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) {
      setImageFile(file)
      setImageUrl(URL.createObjectURL(file))
    }
  }

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      setImageUrl(URL.createObjectURL(file))
    }
  }

  // Ingredient handlers
  const addIngredient = () => {
    setIngredients([...ingredients, { text: '' }])
  }

  const removeIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index))
  }

  const updateIngredient = (index: number, text: string) => {
    const updated = [...ingredients]
    updated[index] = { text }
    setIngredients(updated)
  }

  const moveIngredient = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === ingredients.length - 1)
    ) {
      return
    }
    const updated = [...ingredients]
    const newIndex = direction === 'up' ? index - 1 : index + 1
    ;[updated[index], updated[newIndex]] = [updated[newIndex], updated[index]]
    setIngredients(updated)
  }

  // Step handlers
  const addStep = () => {
    setSteps([...steps, { instruction: '', image_url: null }])
  }

  const removeStep = (index: number) => {
    setSteps(steps.filter((_, i) => i !== index))
  }

  const updateStep = (index: number, instruction: string) => {
    const updated = [...steps]
    updated[index] = { ...updated[index], instruction }
    setSteps(updated)
  }

  const moveStep = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === steps.length - 1)
    ) {
      return
    }
    const updated = [...steps]
    const newIndex = direction === 'up' ? index - 1 : index + 1
    ;[updated[index], updated[newIndex]] = [updated[newIndex], updated[index]]
    setSteps(updated)
  }

  const updateStepImage = (index: number, file: File) => {
    const updated = [...steps]
    updated[index] = {
      ...updated[index],
      image_file: file,
      image_preview: URL.createObjectURL(file),
    }
    setSteps(updated)
  }

  const removeStepImage = (index: number) => {
    const updated = [...steps]
    updated[index] = {
      ...updated[index],
      image_file: null,
      image_preview: null,
      image_url: null,
    }
    setSteps(updated)
  }

  // Upload image to Supabase Storage
  const uploadImage = async (file: File, userId: string): Promise<string> => {
    const supabase = createClient()
    const fileExt = file.name.split('.').pop()
    const fileName = `${userId}/${Date.now()}.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from('recipe-images')
      .upload(fileName, file)

    if (uploadError) throw uploadError

    const {
      data: { publicUrl },
    } = supabase.storage.from('recipe-images').getPublicUrl(fileName)

    return publicUrl
  }

  // Submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const supabase = createClient()

      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Upload main image if exists
      let finalImageUrl = imageUrl
      if (imageFile) {
        finalImageUrl = await uploadImage(imageFile, user.id)
      }

      // Prepare ingredients and steps
      const ingredientsData = ingredients
        .filter((ing) => ing.text.trim())
        .map((ing) => ({ text: ing.text.trim() }))

      // Upload step images and prepare steps data
      const stepsData = await Promise.all(
        steps
          .filter((step) => step.instruction.trim())
          .map(async (step) => {
            let stepImageUrl = step.image_url
            if (step.image_file) {
              stepImageUrl = await uploadImage(step.image_file, user.id)
            }
            return {
              instruction: step.instruction.trim(),
              image_url: stepImageUrl,
            }
          })
      )

      // Call RPC function for atomic insert
      const { data: recipeId, error: rpcError } = await supabase.rpc(
        'create_recipe_atomic',
        {
          p_title: title,
          p_description: description || null,
          p_image_url: finalImageUrl,
          p_prep_time_minutes: prepTime ? parseInt(prepTime) : null,
          p_cook_time_minutes: cookTime ? parseInt(cookTime) : null,
          p_servings: servings ? parseInt(servings) : null,
          p_difficulty: difficulty,
          p_ingredients: ingredientsData,
          p_steps: stepsData,
        }
      )

      if (rpcError) throw rpcError

      // Redirect to recipe page
      router.push(`/recipes/${recipeId}`)
    } catch (err: any) {
      console.error('Error creating recipe:', err)
      setError(err.message || 'Failed to create recipe')
      setLoading(false)
    }
  }

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
            <Link
              href="/feed"
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Cancel
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Create New Recipe
        </h1>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Info */}
          <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Basic Information
            </h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                maxLength={150}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900"
                placeholder="My Amazing Recipe"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={500}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900"
                placeholder="A brief description of your recipe..."
              />
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Recipe Image
              </label>
              {imageUrl ? (
                <div className="relative">
                  <img
                    src={imageUrl}
                    alt="Recipe preview"
                    className="w-full h-64 object-cover rounded-md"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImageUrl(null)
                      setImageFile(null)
                    }}
                    className="absolute top-2 right-2 bg-red-600 text-white px-3 py-1 rounded-md text-sm hover:bg-red-700"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-300 rounded-md p-8 text-center cursor-pointer hover:border-gray-400 transition-colors"
                >
                  <p className="text-gray-600">
                    Drag and drop an image, or click to select
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>
              )}
            </div>

            {/* Time and Servings */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prep Time (min)
                </label>
                <input
                  type="number"
                  value={prepTime}
                  onChange={(e) => setPrepTime(e.target.value)}
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cook Time (min)
                </label>
                <input
                  type="number"
                  value={cookTime}
                  onChange={(e) => setCookTime(e.target.value)}
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Servings
                </label>
                <input
                  type="number"
                  value={servings}
                  onChange={(e) => setServings(e.target.value)}
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
              </div>
            </div>

            {/* Difficulty */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Difficulty
              </label>
              <select
                value={difficulty}
                onChange={(e) =>
                  setDifficulty(e.target.value as 'easy' | 'medium' | 'hard')
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
          </div>

          {/* Ingredients */}
          <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                Ingredients
              </h2>
              <button
                type="button"
                onClick={addIngredient}
                className="text-sm text-gray-900 hover:text-gray-700 font-medium"
              >
                + Add
              </button>
            </div>

            <div className="space-y-2">
              {ingredients.map((ingredient, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={ingredient.text}
                    onChange={(e) => updateIngredient(index, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900"
                    placeholder="1 cup flour"
                  />
                  <button
                    type="button"
                    onClick={() => moveIngredient(index, 'up')}
                    disabled={index === 0}
                    className="px-2 py-2 text-gray-600 hover:text-gray-900 disabled:opacity-30"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => moveIngredient(index, 'down')}
                    disabled={index === ingredients.length - 1}
                    className="px-2 py-2 text-gray-600 hover:text-gray-900 disabled:opacity-30"
                  >
                    ↓
                  </button>
                  {ingredients.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeIngredient(index)}
                      className="px-2 py-2 text-red-600 hover:text-red-700"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Steps */}
          <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Steps</h2>
              <button
                type="button"
                onClick={addStep}
                className="text-sm text-gray-900 hover:text-gray-700 font-medium"
              >
                + Add
              </button>
            </div>

            <div className="space-y-4">
              {steps.map((step, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-md p-4 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">
                      Step {index + 1}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => moveStep(index, 'up')}
                        disabled={index === 0}
                        className="px-2 py-1 text-gray-600 hover:text-gray-900 disabled:opacity-30"
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        onClick={() => moveStep(index, 'down')}
                        disabled={index === steps.length - 1}
                        className="px-2 py-1 text-gray-600 hover:text-gray-900 disabled:opacity-30"
                      >
                        ↓
                      </button>
                      {steps.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeStep(index)}
                          className="px-2 py-1 text-red-600 hover:text-red-700"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>
                  <textarea
                    value={step.instruction}
                    onChange={(e) => updateStep(index, e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900"
                    placeholder="Describe this step..."
                  />

                  {/* Step Image Upload */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Step Image (optional)
                    </label>
                    {step.image_preview ? (
                      <div className="relative">
                        <img
                          src={step.image_preview}
                          alt={`Step ${index + 1} preview`}
                          className="w-full max-w-xs h-32 object-cover rounded-md"
                        />
                        <button
                          type="button"
                          onClick={() => removeStepImage(index)}
                          className="absolute top-1 right-1 bg-red-600 text-white px-2 py-1 rounded text-xs hover:bg-red-700"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <div>
                        <input
                          ref={(el) => {
                            stepFileInputRefs.current[index] = el
                          }}
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) updateStepImage(index, file)
                          }}
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={() => stepFileInputRefs.current[index]?.click()}
                          className="text-sm text-gray-600 hover:text-gray-900 underline"
                        >
                          + Add image
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-4">
            <Link
              href="/feed"
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading || !title}
              className="px-6 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create Recipe'}
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}
