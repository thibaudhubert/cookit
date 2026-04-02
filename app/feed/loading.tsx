import Layout from '@/components/ui/Layout'

export default function FeedLoading() {
  return (
    <Layout maxWidth="md" header={<div className="h-16" />}>
      {/* Page Header Skeleton */}
      <div className="flex items-center justify-between mb-10">
        <div className="h-10 w-32 bg-gray-200 rounded animate-pulse" />
        <div className="h-10 w-24 bg-gray-200 rounded animate-pulse" />
      </div>

      {/* Recipe Card Skeletons */}
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-surface rounded-2xl shadow-apple overflow-hidden border border-border"
          >
            {/* Author Header Skeleton */}
            <div className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse" />
              <div className="flex-1">
                <div className="h-4 w-32 bg-gray-200 rounded animate-pulse mb-2" />
                <div className="h-3 w-20 bg-gray-200 rounded animate-pulse" />
              </div>
            </div>

            {/* Image Skeleton */}
            <div className="w-full h-80 bg-gray-200 animate-pulse" />

            {/* Content Skeleton */}
            <div className="p-4">
              <div className="h-6 w-3/4 bg-gray-200 rounded animate-pulse mb-3" />
              <div className="h-4 w-full bg-gray-200 rounded animate-pulse mb-2" />
              <div className="h-4 w-2/3 bg-gray-200 rounded animate-pulse mb-4" />

              {/* Action Buttons Skeleton */}
              <div className="flex items-center gap-6 pt-3 border-t border-border">
                <div className="h-8 w-20 bg-gray-200 rounded animate-pulse" />
                <div className="h-8 w-24 bg-gray-200 rounded animate-pulse" />
                <div className="h-8 w-24 bg-gray-200 rounded animate-pulse" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </Layout>
  )
}
