'use client'

import { useRouter } from 'next/navigation'

interface LoadMoreButtonProps {
  currentPage: number
  totalPages: number
}

export default function LoadMoreButton({ currentPage, totalPages }: LoadMoreButtonProps) {
  const router = useRouter()

  const handleLoadMore = () => {
    router.push(`?page=${currentPage + 1}`)
  }

  return (
    <div className="flex flex-col items-center gap-3 py-6">
      <button
        onClick={handleLoadMore}
        className="px-8 py-3 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors font-medium"
      >
        Load More
      </button>
      <p className="text-sm text-gray-500">
        Page {currentPage} of {totalPages}
      </p>
    </div>
  )
}
