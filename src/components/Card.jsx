import { cn } from '../lib/utils'

export function Card({ children, className, ...props }) {
  return (
    <div className={cn('bg-slate-800 rounded-xl p-5 border border-slate-700', className)} {...props}>
      {children}
    </div>
  )
}

export function StatCard({ label, value, icon: Icon, color = 'green', sub }) {
  const colors = {
    green: 'text-green-400 bg-green-400/10',
    yellow: 'text-yellow-400 bg-yellow-400/10',
    red: 'text-red-400 bg-red-400/10',
    blue: 'text-blue-400 bg-blue-400/10',
    purple: 'text-purple-400 bg-purple-400/10',
  }
  return (
    <Card className="flex items-center gap-4">
      {Icon && (
        <div className={`rounded-xl p-3 ${colors[color]}`}>
          <Icon size={22} />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-slate-400 text-xs uppercase tracking-wider truncate">{label}</p>
        <p className="text-2xl font-bold text-white mt-0.5">{value}</p>
        {sub && <p className="text-xs text-slate-500 mt-0.5">{sub}</p>}
      </div>
    </Card>
  )
}
