import Layout from '@/components/ui/Layout'

export default function RecipeLoading() {
  return (
    <Layout maxWidth="lg" header={<div className="h-16" />}>
      {/* Hero Image Skeleton */}
      <div className="mb-10">
        <div className="w-full h-96 bg-gray-200 rounded-2xl animate-pulse" />
      </div>

      {/* Recipe Header Skeleton */}
      <div className="bg-surface rounded-2xl shadow-apple p-10 mb-8 border border-border">
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <div className="h-10 w-3/4 bg-gray-200 rounded animate-pulse mb-3" />
            <div className="h-6 w-1/2 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>

        {/* Author Info Skeleton */}
        <div className="flex items-center gap-4 mb-8 pb-8 border-b border-border">
          <div className="w-12 h-12 rounded-full bg-gray-200 animate-pulse" />
          <div>
            <div className="h-4 w-32 bg-gray-200 rounded animate-pulse mb-2" />
            <div className="h-3 w-24 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>

        {/* Metadata Skeleton */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i}>
              <div className="h-4 w-20 bg-gray-200 rounded animate-pulse mb-2" />
              <div className="h-6 w-16 bg-gray-200 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>

      {/* Ingredients Skeleton */}
      <div className="bg-white rounded-lg shadow-sm p-8 mb-6">
        <div className="h-8 w-32 bg-gray-200 rounded animate-pulse mb-4" />
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-4 w-full bg-gray-200 rounded animate-pulse" />
          ))}
        </div>
      </div>

      {/* Steps Skeleton */}
      <div className="bg-white rounded-lg shadow-sm p-8">
        <div className="h-8 w-32 bg-gray-200 rounded animate-pulse mb-6" />
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse flex-shrink-0" />
              <div className="flex-1">
                <div className="h-4 w-full bg-gray-200 rounded animate-pulse mb-2" />
                <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  )
}
