import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { LogOut, X, MoreHorizontal } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useClub } from '../context/ClubContext'
import { ClubLogo } from './ClubLogo'
import { cn } from '../lib/utils'

const MOBILE_NAV_MAX = 4

export function Sidebar({ links, title }) {
  const [moreOpen, setMoreOpen] = useState(false)
  const { profile, signOut } = useAuth()
  const { settings } = useClub()
  const navigate = useNavigate()

  async function handleLogout() {
    await signOut()
    navigate('/login')
  }

  const mainLinks  = links.slice(0, MOBILE_NAV_MAX)
  const extraLinks = links.slice(MOBILE_NAV_MAX)
  const hasMore    = extraLinks.length > 0

  return (
    <>
      {/* ── Mobile top bar (sin hamburger) ── */}
      <div
        className="lg:hidden flex items-center justify-between px-4 py-3 bg-slate-900 border-b border-slate-700 z-30 shrink-0"
        style={{ paddingTop: 'calc(0.75rem + env(safe-area-inset-top))' }}
      >
        <div className="flex items-center gap-2.5">
          <div className="club-bg-soft rounded-xl p-1.5 shrink-0">
            <ClubLogo size={20} />
          </div>
          <div>
            <p className="text-xs club-text leading-none font-medium">{settings?.nombre_club || 'Club'}</p>
            <p className="font-bold text-white text-sm leading-tight">{title}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="text-slate-400 hover:text-red-400 transition-colors p-1.5 rounded-lg hover:bg-red-400/10"
        >
          <LogOut size={18} />
        </button>
      </div>

      {/* ── Desktop sidebar ── */}
      <aside className="hidden lg:flex flex-col w-64 min-h-screen bg-slate-900 border-r border-slate-700 shrink-0">
        <SidebarContent
          links={links} title={title} profile={profile} settings={settings}
          onLogout={handleLogout}
        />
      </aside>

      {/* ── Mobile bottom nav ── */}
      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-sm border-t border-slate-700/60 flex z-30"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        {mainLinks.map(({ to, icon: Icon, label, badge }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'flex-1 flex flex-col items-center justify-center py-2 gap-0.5 text-xs transition-colors relative',
                isActive ? 'text-slate-100' : 'text-slate-500 hover:text-slate-300'
              )
            }
          >
            {({ isActive }) => (
              <>
                <div
                  className="absolute top-0 left-1/2 -translate-x-1/2 rounded-full transition-all duration-200"
                  style={{
                    width: isActive ? 28 : 0,
                    height: 2,
                    backgroundColor: 'var(--club-primary)',
                    opacity: isActive ? 1 : 0,
                  }}
                />
                <div className={cn('rounded-xl p-1.5 transition-all relative', isActive ? 'club-bg-soft' : '')}>
                  <Icon size={20} style={isActive ? { color: 'var(--club-primary)' } : {}} />
                  {badge != null && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 flex items-center justify-center rounded-full text-[10px] font-bold bg-red-500 text-white px-1 leading-none">
                      {badge}
                    </span>
                  )}
                </div>
                <span className="text-xs" style={isActive ? { color: 'var(--club-primary)', fontWeight: 600 } : {}}>
                  {label}
                </span>
              </>
            )}
          </NavLink>
        ))}

        {hasMore && (
          <button
            onClick={() => setMoreOpen(true)}
            className="flex-1 flex flex-col items-center justify-center py-2 gap-0.5 text-xs text-slate-500 hover:text-slate-300 transition-colors"
          >
            <div className="rounded-xl p-1.5">
              <MoreHorizontal size={20} />
            </div>
            <span>Más</span>
          </button>
        )}
      </nav>

      {/* ── More sheet (overlay) ── */}
      {moreOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMoreOpen(false)} />
          <div
            className="absolute bottom-0 left-0 right-0 bg-slate-800 rounded-t-3xl border-t border-slate-700"
            style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-700/50">
              <span className="text-sm font-semibold text-white">Más secciones</span>
              <button onClick={() => setMoreOpen(false)} className="text-slate-400 hover:text-white">
                <X size={20} />
              </button>
            </div>
            <div className="p-3 space-y-1">
              {extraLinks.map(({ to, icon: Icon, label, badge }) => (
                <NavLink
                  key={to}
                  to={to}
                  onClick={() => setMoreOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all',
                      isActive ? 'club-bg-soft club-text' : 'text-slate-300 hover:bg-slate-700/60'
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon size={20} style={isActive ? { color: 'var(--club-primary)' } : {}} />
                      <span className="flex-1">{label}</span>
                      {badge != null && (
                        <span className="text-xs font-bold px-1.5 py-0.5 rounded-full bg-red-500/30 text-red-400">
                          {badge}
                        </span>
                      )}
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

function SidebarContent({ links, title, profile, settings, onLogout }) {
  return (
    <>
      <div className="p-5 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className="club-bg-soft rounded-xl p-2 shrink-0">
            <ClubLogo size={22} />
          </div>
          <div className="min-w-0">
            <p className="text-xs club-text font-medium leading-none truncate">
              {settings?.nombre_club || 'Club Manager'}
            </p>
            <p className="font-bold text-white text-sm leading-tight mt-0.5 truncate">{title}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {links.map(({ to, icon: Icon, label, badge, badgeVariant }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all border-l-2',
                isActive
                  ? 'club-nav-active'
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
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0 club-bg-medium">
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
    <div className="flex flex-col lg:flex-row min-h-screen min-h-dvh bg-slate-900">
      {sidebar}
      <main className="flex-1 overflow-auto pb-nav-safe lg:pb-0">
        {children}
      </main>
    </div>
  )
}
