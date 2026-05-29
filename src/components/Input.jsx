import { cn } from '../lib/utils'

export function Input({ label, error, className, ...props }) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-sm text-slate-300">{label}</label>}
      <input
        className={cn(
          'bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-slate-500',
          'focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500',
          'disabled:opacity-50',
          error && 'border-red-500',
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  )
}

export function Select({ label, error, className, children, ...props }) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-sm text-slate-300">{label}</label>}
      <select
        className={cn(
          'bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white',
          'focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500',
          error && 'border-red-500',
          className
        )}
        {...props}
      >
        {children}
      </select>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  )
}

export function Textarea({ label, error, className, ...props }) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-sm text-slate-300">{label}</label>}
      <textarea
        className={cn(
          'bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-slate-500',
          'focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500',
          'resize-none',
          error && 'border-red-500',
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  )
}
