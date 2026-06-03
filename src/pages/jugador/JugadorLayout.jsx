import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { User, CreditCard, BarChart2, History, LogOut } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useClub } from '../../context/ClubContext'
import { ClubLogo } from '../../components/ClubLogo'
import { cn } from '../../lib/utils'

const links = [
  { to: '/jugador/perfil',        icon: User,       label: 'Mi Perfil' },
  { to: '/jugador/pagos',         icon: CreditCard,  label: 'Mis Pagos' },
  { to: '/jugador/estadisticas',  icon: BarChart2,   label: 'Estadísticas' },
  { to: '/jugador/partidos',      icon: History,     label: 'Partidos' },
]

export default function JugadorLayout() {
  const { profile, signOut } = useAuth()
  const { settings }         = useClub()
  const navigate             = useNavigate()

  async function handleLogout() {
    await signOut()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">

      {/* Header con degradado sutil del color del club */}
      <header
        className="border-b border-slate-700/60 px-4 py-3 flex items-center justify-between sticky top-0 z-20 backdrop-blur-sm"
        style={{
          background: `linear-gradient(135deg, rgba(var(--club-primary-rgb), 0.10) 0%, #0f172a 55%)`,
        }}
      >
        {/* Logo + nombre del club */}
        <div className="flex items-center gap-3">
          {/* Badge con glow */}
          <div className="relative shrink-0">
            <div
              className="absolute inset-0 rounded-xl blur-sm opacity-50"
              style={{ backgroundColor: 'var(--club-primary)' }}
            />
            <div
              className="relative rounded-xl flex items-center justify-center club-bg-soft p-1.5"
              style={{ border: '1px solid rgba(var(--club-primary-rgb), 0.25)' }}
            >
              <ClubLogo size={26} />
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold leading-none tracking-wide" style={{ color: 'var(--club-primary)' }}>
              {settings?.nombre_club || 'Club Manager'}
            </p>
            <p className="text-sm font-semibold text-white leading-tight mt-0.5">
              {profile?.nombre} {profile?.apellido}
            </p>
          </div>
        </div>

        {/* Info jugador + logout */}
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-xs text-slate-400">
              {profile?.posicion || 'Jugador'}
              {profile?.numero_camiseta ? ` · #${profile.numero_camiseta}` : ''}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="text-slate-400 hover:text-red-400 transition-colors p-1.5 rounded-lg hover:bg-red-400/10"
          >
            <LogOut size={18} />
          </button>
        </div>
      </header>

      {/* Contenido */}
      <main className="flex-1 overflow-auto pb-20">
        <Outlet />
      </main>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur border-t border-slate-700/60 flex z-20">
        {links.map(({ to, icon: Icon, label }) => (
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
                {/* Indicador superior activo */}
                <div
                  className="absolute top-0 left-1/2 -translate-x-1/2 rounded-full transition-all duration-200"
                  style={{
                    width: isActive ? 28 : 0,
                    height: 2,
                    backgroundColor: 'var(--club-primary)',
                    opacity: isActive ? 1 : 0,
                  }}
                />

                <div
                  className={cn(
                    'rounded-xl p-1.5 transition-all',
                    isActive ? 'club-bg-soft' : ''
                  )}
                >
                  <Icon
                    size={20}
                    style={isActive ? { color: 'var(--club-primary)' } : {}}
                  />
                </div>
                <span
                  className="text-xs"
                  style={isActive ? { color: 'var(--club-primary)', fontWeight: 600 } : {}}
                >
                  {label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
