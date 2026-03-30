'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { timeAgo } from '@/lib/utils/timeAgo'
import Link from 'next/link'

interface Comment {
  id: string
  recipe_id: string
  author_id: string
  content: string
  created_at: string
  author: {
    username: string
    display_name: string | null
    avatar_url: string | null
  }
}

interface CommentSectionProps {
  recipeId: string
  recipeAuthorId: string
  currentUserId: string
  initialComments: Comment[]
}

export default function CommentSection({
  recipeId,
  recipeAuthorId,
  currentUserId,
  initialComments,
}: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>(initialComments)
  const [newComment, setNewComment] = useState('')
  const [isPosting, setIsPosting] = useState(false)

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newComment.trim() || isPosting) return

    setIsPosting(true)

    // Optimistic update
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setIsPosting(false)
      return
    }

    // Get current user's profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('username, display_name, avatar_url')
      .eq('id', user.id)
      .single()

    const optimisticComment: Comment = {
      id: `temp-${Date.now()}`,
      recipe_id: recipeId,
      author_id: user.id,
      content: newComment.trim(),
      created_at: new Date().toISOString(),
      author: profile || {
        username: 'unknown',
        display_name: null,
        avatar_url: null,
      },
    }

    setComments((prev) => [...prev, optimisticComment])
    setNewComment('')

    try {
      const { data, error } = await supabase
        .from('comments')
        .insert({
          recipe_id: recipeId,
          author_id: user.id,
          content: newComment.trim(),
        })
        .select(
          `
          *,
          author:profiles(username, display_name, avatar_url)
        `
        )
        .single()

      if (error) throw error

      // Replace optimistic comment with real one
      setComments((prev) =>
        prev.map((c) => (c.id === optimisticComment.id ? (data as any) : c))
      )
    } catch (error) {
      console.error('Error posting comment:', error)
      // Remove optimistic comment on error
      setComments((prev) => prev.filter((c) => c.id !== optimisticComment.id))
      setNewComment(newComment)
    } finally {
      setIsPosting(false)
    }
  }

  const handleDeleteComment = async (commentId: string) => {
    const commentToDelete = comments.find((c) => c.id === commentId)
    if (!commentToDelete) return

    // Optimistic update
    setComments((prev) => prev.filter((c) => c.id !== commentId))

    try {
      const supabase = createClient()
      const { error } = await supabase.from('comments').delete().eq('id', commentId)

      if (error) throw error
    } catch (error) {
      console.error('Error deleting comment:', error)
      // Restore comment on error
      setComments((prev) => [...prev, commentToDelete].sort((a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      ))
    }
  }

  const canDeleteComment = (comment: Comment) => {
    return comment.author_id === currentUserId || recipeAuthorId === currentUserId
  }

  return (
    <div id="comments" className="bg-white rounded-lg shadow-sm p-8 mt-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Comments ({comments.length})
      </h2>

      {/* Comments List */}
      <div className="space-y-6 mb-6">
        {comments.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            No comments yet. Be the first to comment!
          </p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="flex gap-3">
              {/* Avatar */}
              <Link href={`/profile/${comment.author.username}`}>
                {comment.author.avatar_url ? (
                  <img
                    src={comment.author.avatar_url}
                    alt={comment.author.display_name || comment.author.username}
                    className="w-10 h-10 rounded-full object-cover hover:opacity-80 transition-opacity"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition-colors">
                    <span className="text-lg">👤</span>
                  </div>
                )}
              </Link>

              {/* Comment Content */}
              <div className="flex-1 min-w-0">
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1">
                    <Link
                      href={`/profile/${comment.author.username}`}
                      className="font-semibold text-gray-900 hover:underline text-sm"
                    >
                      {comment.author.display_name || comment.author.username}
                    </Link>
                    <span className="text-xs text-gray-500">
                      {timeAgo(comment.created_at)}
                    </span>
                  </div>
                  <p className="text-gray-700 text-sm whitespace-pre-wrap break-words">
                    {comment.content}
                  </p>
                </div>

                {/* Delete Button */}
                {canDeleteComment(comment) && (
                  <button
                    onClick={() => handleDeleteComment(comment.id)}
                    className="text-xs text-red-600 hover:text-red-700 mt-1"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Comment Input */}
      <form onSubmit={handlePostComment} className="border-t border-gray-200 pt-6">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
          maxLength={1000}
          rows={3}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 resize-none"
        />
        <div className="flex items-center justify-between mt-3">
          <span className="text-sm text-gray-500">
            {newComment.length}/1000 characters
          </span>
          <button
            type="submit"
            disabled={!newComment.trim() || isPosting}
            className="px-6 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isPosting ? 'Posting...' : 'Post Comment'}
          </button>
        </div>
      </form>
    </div>
  )
}
