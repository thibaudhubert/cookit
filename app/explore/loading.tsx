import Layout from '@/components/ui/Layout'

export default function ExploreLoading() {
  return (
    <Layout maxWidth="md" header={<div className="h-16" />}>
      {/* Header Skeleton */}
      <div className="mb-8">
        <div className="h-10 w-48 bg-gray-200 rounded animate-pulse mb-6" />

        {/* Mode Toggle Skeleton */}
        <div className="flex gap-3 mb-6">
          <div className="h-11 w-24 bg-gray-200 rounded-xl animate-pulse" />
          <div className="h-11 w-24 bg-gray-200 rounded-xl animate-pulse" />
        </div>

        {/* Search Bar Skeleton */}
        <div className="h-12 w-full bg-gray-200 rounded-lg animate-pulse" />
      </div>

      {/* Trending Section Skeleton */}
      <div className="mb-10">
        <div className="h-8 w-64 bg-gray-200 rounded animate-pulse mb-6" />
        <div className="overflow-x-auto pb-4">
          <div className="flex gap-5">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="w-[220px] flex-shrink-0">
                <div className="bg-surface rounded-2xl overflow-hidden shadow-apple border border-border">
                  <div className="aspect-square w-full bg-gray-200 animate-pulse" />
                  <div className="p-4">
                    <div className="h-5 w-full bg-gray-200 rounded animate-pulse mb-3" />
                    <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recipe Cards Skeleton */}
      <div className="space-y-6">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="bg-surface rounded-2xl shadow-apple overflow-hidden border border-border"
          >
            <div className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse" />
              <div className="flex-1">
                <div className="h-4 w-32 bg-gray-200 rounded animate-pulse mb-2" />
                <div className="h-3 w-20 bg-gray-200 rounded animate-pulse" />
              </div>
            </div>
            <div className="w-full h-80 bg-gray-200 animate-pulse" />
            <div className="p-4">
              <div className="h-6 w-3/4 bg-gray-200 rounded animate-pulse mb-3" />
              <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </Layout>
  )
}
