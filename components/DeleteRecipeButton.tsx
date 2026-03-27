'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface DeleteRecipeButtonProps {
  recipeId: string
}

export default function DeleteRecipeButton({
  recipeId,
}: DeleteRecipeButtonProps) {
  const router = useRouter()
  const [showConfirm, setShowConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    setDeleting(true)

    try {
      const supabase = createClient()

      // Delete recipe (cascade will handle ingredients and steps)
      const { error } = await supabase.from('recipes').delete().eq('id', recipeId)

      if (error) throw error

      // Redirect to feed
      router.push('/feed')
      router.refresh()
    } catch (err: any) {
      console.error('Error deleting recipe:', err)
      alert('Failed to delete recipe')
      setDeleting(false)
      setShowConfirm(false)
    }
  }

  if (showConfirm) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
        <div className="bg-white rounded-lg p-6 max-w-sm w-full">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Delete Recipe?
          </h3>
          <p className="text-gray-600 mb-6">
            This action cannot be undone. The recipe and all its data will be
            permanently deleted.
          </p>
          <div className="flex gap-3 justify-end">
            <button
              onClick={() => setShowConfirm(false)}
              disabled={deleting}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <button
      onClick={() => setShowConfirm(true)}
      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
    >
      Delete
    </button>
  )
}
