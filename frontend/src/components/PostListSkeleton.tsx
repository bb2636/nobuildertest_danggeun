export default function PostListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <ul className="space-y-0 divide-y divide-gray-10 bg-white rounded-xl overflow-hidden border border-gray-10">
      {Array.from({ length: count }).map((_, i) => (
        <li key={i} className="flex gap-3 p-4 animate-pulse">
          <div className="flex-shrink-0 w-24 h-24 rounded-lg bg-gray-10" />
          <div className="flex-1 min-w-0 space-y-2">
            <div className="h-4 bg-gray-10 rounded w-3/4" />
            <div className="h-4 bg-gray-10 rounded w-1/3" />
            <div className="h-3 bg-gray-10 rounded w-1/2" />
          </div>
        </li>
      ))}
    </ul>
  )
}
