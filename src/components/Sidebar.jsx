import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { LogOut, Menu, X, Shield } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { cn } from '../lib/utils'

export function Sidebar({ links, title, color = 'green' }) {
  const [open, setOpen] = useState(false)
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await signOut()
    navigate('/login')
  }

  const accent = color === 'blue' ? 'text-blue-400 bg-blue-400/10' : 'text-green-400 bg-green-400/10'
  const activeClass = color === 'blue'
    ? 'bg-blue-500/15 text-blue-400 border-blue-400'
    : 'bg-green-500/15 text-green-400 border-green-400'

  return (
    <>
      {/* Mobile top bar */}
      <div className="lg:hidden flex items-center justify-between px-4 py-3 bg-slate-900 border-b border-slate-700 sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <div className={`rounded-lg p-1.5 ${accent}`}>
            <Shield size={18} />
          </div>
          <span className="font-bold text-white text-sm">{title}</span>
        </div>
        <button onClick={() => setOpen(true)} className="text-slate-400">
          <Menu size={22} />
        </button>
      </div>

      {/* Mobile drawer overlay */}
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-72 bg-slate-900 border-r border-slate-700 flex flex-col">
            <SidebarContent
              links={links}
              title={title}
              profile={profile}
              accent={accent}
              activeClass={activeClass}
              onLogout={handleLogout}
              onClose={() => setOpen(false)}
              mobile
            />
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-64 min-h-screen bg-slate-900 border-r border-slate-700 shrink-0">
        <SidebarContent
          links={links}
          title={title}
          profile={profile}
          accent={accent}
          activeClass={activeClass}
          onLogout={handleLogout}
        />
      </aside>
    </>
  )
}

function SidebarContent({ links, title, profile, accent, activeClass, onLogout, onClose, mobile }) {
  return (
    <>
      <div className="p-5 border-b border-slate-700 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`rounded-lg p-1.5 ${accent}`}>
            <Shield size={18} />
          </div>
          <span className="font-bold text-white text-sm">{title}</span>
        </div>
        {mobile && (
          <button onClick={onClose} className="text-slate-400">
            <X size={20} />
          </button>
        )}
      </div>

      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {links.map(({ to, icon: Icon, label, badge, badgeVariant }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onClose}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all border-l-2',
                isActive
                  ? `${activeClass} border-current`
                  : 'text-slate-400 hover:text-white hover:bg-slate-800 border-transparent'
              )
            }
          >
            <Icon size={18} />
            <span className="flex-1">{label}</span>
            {badge != null && (
              <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center leading-none ${
                badgeVariant === 'red'    ? 'bg-red-500/30 text-red-400' :
                badgeVariant === 'yellow' ? 'bg-yellow-500/30 text-yellow-400' :
                'bg-slate-600 text-slate-300'
              }`}>
                {badge}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="p-3 border-t border-slate-700">
        <div className="flex items-center gap-3 px-3 py-2 mb-2">
          <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-sm font-bold text-white shrink-0">
            {profile?.nombre?.[0]?.toUpperCase() || '?'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-white font-medium truncate">
              {profile?.nombre} {profile?.apellido}
            </p>
            <p className="text-xs text-slate-500 capitalize">{profile?.role}</p>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-red-400 hover:bg-red-400/10 transition-colors"
        >
          <LogOut size={16} />
          Cerrar sesión
        </button>
      </div>
    </>
  )
}

export function SidebarLayout({ sidebar, children }) {
  return (
    <div className="flex min-h-screen bg-slate-900">
      {sidebar}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}
