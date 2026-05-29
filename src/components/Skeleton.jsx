import { cn } from '../lib/utils'

export function Skeleton({ className }) {
  return <div className={cn('animate-pulse bg-slate-700 rounded', className)} />
}

export function SkeletonCard() {
  return (
    <div className="bg-slate-800 rounded-xl p-5 border border-slate-700 space-y-3">
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-8 w-1/2" />
      <Skeleton className="h-3 w-1/4" />
    </div>
  )
}

export function SkeletonTable({ rows = 5, cols = 4 }) {
  return (
    <div className="rounded-xl border border-slate-700 overflow-hidden">
      <div className="bg-slate-900/50 px-4 py-3 flex gap-4 border-b border-slate-700">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} className="h-4 w-24" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="px-4 py-3 flex gap-4 border-b border-slate-700/50">
          {Array.from({ length: cols }).map((_, j) => (
            <Skeleton key={j} className="h-4 flex-1" />
          ))}
        </div>
      ))}
    </div>
  )
}
