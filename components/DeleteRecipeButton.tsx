'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import Button from '@/components/ui/Button'

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
        <div className="bg-surface rounded-2xl p-8 max-w-sm w-full shadow-apple-xl border border-border">
          <h3 className="text-xl font-bold text-text-primary mb-3">
            Delete Recipe?
          </h3>
          <p className="text-base text-text-secondary mb-8">
            This action cannot be undone. The recipe and all its data will be
            permanently deleted.
          </p>
          <div className="flex gap-3 justify-end">
            <Button
              onClick={() => setShowConfirm(false)}
              disabled={deleting}
              variant="outline"
              size="md"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDelete}
              disabled={deleting}
              variant="destructive"
              size="md"
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <Button
      onClick={() => setShowConfirm(true)}
      variant="destructive"
      size="sm"
    >
      Delete
    </Button>
  )
}
