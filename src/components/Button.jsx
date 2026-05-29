import { cn } from '../lib/utils'

const variants = {
  primary: 'bg-green-500 hover:bg-green-600 text-white',
  secondary: 'bg-slate-700 hover:bg-slate-600 text-slate-100',
  danger: 'bg-red-600 hover:bg-red-700 text-white',
  ghost: 'hover:bg-slate-700 text-slate-300',
  outline: 'border border-slate-600 hover:bg-slate-700 text-slate-300',
}

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-5 py-2.5 text-base',
}

export function Button({ children, variant = 'primary', size = 'md', className, disabled, loading, ...props }) {
  return (
    <button
      className={cn(
        'inline-flex items-center gap-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer',
        variants[variant],
        sizes[size],
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-current" />}
      {children}
    </button>
  )
}
