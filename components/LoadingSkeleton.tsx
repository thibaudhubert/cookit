export function RecipeCardSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden animate-pulse">
      {/* Header skeleton */}
      <div className="p-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gray-200"></div>
        <div className="flex-1">
          <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-16"></div>
        </div>
      </div>

      {/* Image skeleton */}
      <div className="w-full h-80 bg-gray-200"></div>

      {/* Content skeleton */}
      <div className="p-4">
        <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-full mb-1"></div>
        <div className="h-4 bg-gray-200 rounded w-2/3 mb-4"></div>

        {/* Pills skeleton */}
        <div className="flex gap-2 mb-4">
          <div className="h-6 bg-gray-200 rounded-full w-20"></div>
          <div className="h-6 bg-gray-200 rounded-full w-24"></div>
          <div className="h-6 bg-gray-200 rounded-full w-16"></div>
        </div>

        {/* Actions skeleton */}
        <div className="flex items-center gap-6 pt-3 border-t border-gray-100">
          <div className="h-8 bg-gray-200 rounded w-16"></div>
          <div className="h-8 bg-gray-200 rounded w-20"></div>
          <div className="h-8 bg-gray-200 rounded w-20"></div>
        </div>
      </div>
    </div>
  )
}

export function RecipeGridSkeleton() {
  return (
    <>
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="bg-white rounded-lg overflow-hidden shadow-sm animate-pulse">
          <div className="aspect-square w-full bg-gray-200"></div>
          <div className="p-4">
            <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="flex items-center gap-4">
              <div className="h-4 bg-gray-200 rounded w-12"></div>
              <div className="h-4 bg-gray-200 rounded w-12"></div>
            </div>
          </div>
        </div>
      ))}
    </>
  )
}

export function ProfileHeaderSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="p-8 animate-pulse">
        <div className="flex flex-col sm:flex-row items-start gap-6">
          <div className="w-32 h-32 rounded-full bg-gray-200"></div>
          <div className="flex-1">
            <div className="h-8 bg-gray-200 rounded w-48 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-32 mb-4"></div>
            <div className="flex items-center gap-6 mb-4">
              <div className="h-6 bg-gray-200 rounded w-24"></div>
              <div className="h-6 bg-gray-200 rounded w-24"></div>
            </div>
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4 mt-2"></div>
          </div>
        </div>
      </div>
      <div className="border-t border-gray-200">
        <div className="flex">
          <div className="flex-1 h-14 bg-gray-100"></div>
          <div className="flex-1 h-14 bg-gray-50"></div>
          <div className="flex-1 h-14 bg-gray-50"></div>
        </div>
      </div>
    </div>
  )
}

export function NotificationSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-sm divide-y divide-gray-200">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex items-start gap-4 p-4 animate-pulse">
          <div className="w-12 h-12 rounded-full bg-gray-200 flex-shrink-0"></div>
          <div className="flex-1">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-20"></div>
          </div>
        </div>
      ))}
    </div>
  )
}

export function PeopleListSkeleton() {
  return (
    <>
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className="flex items-center gap-4 p-4 bg-white rounded-lg shadow-sm animate-pulse"
        >
          <div className="w-16 h-16 rounded-full bg-gray-200"></div>
          <div className="flex-1">
            <div className="h-5 bg-gray-200 rounded w-32 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-full"></div>
          </div>
        </div>
      ))}
    </>
  )
}
