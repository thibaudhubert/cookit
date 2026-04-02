'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useDebounce } from '@/lib/hooks/useDebounce'

interface SearchBarProps {
  initialQuery?: string
}

export default function SearchBar({ initialQuery = '' }: SearchBarProps) {
  const [query, setQuery] = useState(initialQuery)
  const [isSearching, setIsSearching] = useState(false)
  const debouncedQuery = useDebounce(query, 400)
  const router = useRouter()
  const searchParams = useSearchParams()
  const mode = searchParams.get('mode') || 'recipes'

  // Auto-search when debounced query changes
  useEffect(() => {
    if (debouncedQuery !== initialQuery) {
      setIsSearching(false)
      if (debouncedQuery.trim()) {
        router.push(`/explore?mode=${mode}&q=${encodeURIComponent(debouncedQuery.trim())}`)
      } else if (initialQuery) {
        // Clear search if query is now empty
        router.push(`/explore?mode=${mode}`)
      }
    }
  }, [debouncedQuery, initialQuery, mode, router])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value)
    setIsSearching(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/explore?mode=${mode}&q=${encodeURIComponent(query.trim())}`)
    } else {
      router.push(`/explore?mode=${mode}`)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          placeholder="Search recipes..."
          className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2">
          {isSearching ? (
            <div className="animate-spin h-4 w-4 border-2 border-gray-300 border-t-gray-900 rounded-full" />
          ) : (
            <button
              type="submit"
              className="text-gray-600 hover:text-gray-900 transition-colors"
              aria-label="Search"
            >
              🔍
            </button>
          )}
        </div>
      </div>
    </form>
  )
}
