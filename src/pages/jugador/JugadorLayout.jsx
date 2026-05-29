import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { User, CreditCard, BarChart2, History, LogOut } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { cn } from '../../lib/utils'

const links = [
  { to: '/jugador/perfil', icon: User, label: 'Mi Perfil' },
  { to: '/jugador/pagos', icon: CreditCard, label: 'Mis Pagos' },
  { to: '/jugador/estadisticas', icon: BarChart2, label: 'Estadísticas' },
  { to: '/jugador/partidos', icon: History, label: 'Partidos' },
]

export default function JugadorLayout() {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await signOut()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      {/* Top header */}
      <header className="bg-slate-900 border-b border-slate-700 px-4 py-3 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 font-bold text-sm">
            {profile?.nombre?.[0]?.toUpperCase() || '?'}
          </div>
          <div>
            <p className="text-sm font-semibold text-white leading-tight">
              {profile?.nombre} {profile?.apellido}
            </p>
            <p className="text-xs text-slate-400">
              {profile?.posicion || 'Jugador'}
              {profile?.numero_camiseta ? ` · #${profile.numero_camiseta}` : ''}
            </p>
          </div>
        </div>
        <button onClick={handleLogout} className="text-slate-400 hover:text-red-400 transition-colors">
          <LogOut size={18} />
        </button>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-auto pb-20">
        <Outlet />
      </main>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-700 flex z-20">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'flex-1 flex flex-col items-center justify-center py-2.5 gap-0.5 text-xs transition-colors',
                isActive ? 'text-green-400' : 'text-slate-500 hover:text-slate-300'
              )
            }
          >
            <Icon size={20} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
