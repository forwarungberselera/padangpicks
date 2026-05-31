function CardSkeleton() {
  return (
    <div className="bg-white rounded-[22px] shadow-md overflow-hidden animate-pulse">
      <div className="h-44 bg-gray-200" />
      <div className="p-4 space-y-3">
        <div className="h-5 bg-gray-200 rounded-full w-3/4" />
        <div className="h-4 bg-gray-100 rounded-full w-1/2" />
        <div className="flex gap-2">
          <div className="h-6 bg-gray-100 rounded-full w-16" />
          <div className="h-6 bg-gray-100 rounded-full w-20" />
        </div>
        <div className="h-4 bg-gray-100 rounded-full w-2/3" />
      </div>
    </div>
  );
}

function PageSkeleton({ count = 6 }) {
  return (
    <div className="max-w-7xl mx-auto px-4 pt-6 pb-12">
      {/* Header skeleton */}
      <div className="mb-8 animate-pulse">
        <div className="h-8 bg-gray-200 rounded-full w-48 mb-3" />
        <div className="h-4 bg-gray-100 rounded-full w-72" />
      </div>
      {/* Filter bar skeleton */}
      <div className="flex gap-3 mb-6 animate-pulse">
        <div className="h-10 bg-gray-100 rounded-full w-48" />
        <div className="h-10 bg-gray-100 rounded-full w-32" />
        <div className="h-10 bg-gray-100 rounded-full w-32" />
      </div>
      {/* Grid skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: count }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

export { CardSkeleton, PageSkeleton };
export default PageSkeleton;
