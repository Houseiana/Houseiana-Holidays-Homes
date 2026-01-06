
export default function Loading() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header Skeleton */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gray-200 rounded-xl animate-pulse" />
              <div className="h-6 w-24 bg-gray-200 rounded animate-pulse hidden sm:block" />
            </div>

            {/* Search Bar Skeleton */}
            <div className="hidden md:flex items-center border border-gray-200 rounded-full shadow-sm px-2 py-2 gap-4">
              <div className="h-4 w-20 bg-gray-200 rounded animate-pulse ml-4" />
              <div className="h-6 w-px bg-gray-200" />
              <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
              <div className="h-6 w-px bg-gray-200" />
              <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
              <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
            </div>

            {/* Right Menu Skeleton */}
            <div className="flex items-center gap-2">
              <div className="h-10 w-28 bg-gray-200 rounded-full animate-pulse hidden md:block" />
              <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse" />
              <div className="w-20 h-10 bg-gray-200 rounded-full animate-pulse" />
            </div>
          </div>
        </div>
        
        {/* Categories Skeleton */}
        <div className="border-t border-gray-100">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center gap-8 overflow-hidden">
               {[...Array(10)].map((_, i) => (
                 <div key={i} className="flex flex-col items-center gap-2 min-w-[60px]">
                   <div className="w-6 h-6 bg-gray-200 rounded animate-pulse" />
                   <div className="w-12 h-3 bg-gray-200 rounded animate-pulse" />
                 </div>
               ))}
            </div>
          </div>
        </div>
      </div>

      {/* Grid Skeleton */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="space-y-3">
              <div className="aspect-square bg-gray-200 rounded-2xl animate-pulse" />
              <div className="space-y-2">
                <div className="flex justify-between">
                  <div className="h-4 w-2/3 bg-gray-200 rounded animate-pulse" />
                  <div className="h-4 w-10 bg-gray-200 rounded animate-pulse" />
                </div>
                <div className="h-4 w-1/2 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-1/3 bg-gray-200 rounded animate-pulse pt-2" />
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
