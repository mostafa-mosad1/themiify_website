export default function ThemeDetailLoading() {
  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      {/* Header Skeleton */}
      <div className="mb-[14px] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-6 w-24 bg-gray-200 rounded animate-pulse"></div>
          <span className="text-gray-400">/</span>
          <div className="h-8 w-32 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="h-10 w-28 bg-gray-200 rounded-full animate-pulse"></div>
      </div>

      {/* Main Content Skeleton */}
      <div className="bg-[var(--glass-bg)] border border-[var(--glass-border)] p-5 rounded-3xl flex items-center justify-center flex-col gap-6">
        {/* Banner Skeleton */}
        <div className="w-full h-16 rounded-2xl bg-gray-200 animate-pulse"></div>

        <div className="flex items-start justify-center gap-5 w-full h-full">
          {/* Left Section - Media Slider Skeleton */}
          <div className="w-[45%] h-[260px]">
            <div className="w-full h-full bg-gray-200 rounded-2xl animate-pulse"></div>
          </div>

          {/* Right Section - Information Skeleton */}
          <div className="w-[55%] h-full flex flex-col gap-2">
            <div className="h-7 w-3/4 bg-gray-200 rounded animate-pulse mb-2"></div>
            <div className="h-20 w-full bg-gray-200 rounded animate-pulse mb-4"></div>

            <div className="flex items-center gap-2 justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse"></div>
                <div className="h-5 w-20 bg-gray-200 rounded animate-pulse"></div>
              </div>

              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full">
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-3 w-3 bg-gray-200 rounded animate-pulse"></div>
                  ))}
                </div>
                <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>

            <div className="h-10 w-1/2 bg-gray-200 rounded-full animate-pulse mt-4"></div>
          </div>
        </div>
      </div>

      {/* Additional Content Skeleton */}
      <div className="mt-6">
        <div className="bg-[var(--glass-bg)] border border-[var(--glass-border)] p-5 rounded-3xl">
          <div className="h-6 w-40 bg-gray-200 rounded animate-pulse mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-gray-200 rounded-lg p-4 animate-pulse">
                <div className="h-4 w-3/4 bg-gray-300 rounded mb-2"></div>
                <div className="h-3 w-full bg-gray-300 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
