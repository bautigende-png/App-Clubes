import { cn } from '../lib/utils'

const variants = {
  green: 'bg-green-400/15 text-green-400',
  red: 'bg-red-400/15 text-red-400',
  yellow: 'bg-yellow-400/15 text-yellow-400',
  blue: 'bg-blue-400/15 text-blue-400',
  slate: 'bg-slate-600/50 text-slate-300',
  purple: 'bg-purple-400/15 text-purple-400',
}

export function Badge({ children, variant = 'slate', className }) {
  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium', variants[variant], className)}>
      {children}
    </span>
  )
}
