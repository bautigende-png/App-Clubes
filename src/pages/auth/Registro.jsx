import { Link } from 'react-router-dom'
import { Users, Dumbbell, Trophy } from 'lucide-react'
import { useClub } from '../../context/ClubContext'
import { ClubLogoBadge } from '../../components/ClubLogo'

const roles = [
  {
    to: '/registro/jugador',
    icon: Trophy,
    label: 'Jugador',
    description: 'Accedé a tus estadísticas, asistencias y pagos de cuota.',
    border: 'hover:club-border',
    iconBg: 'club-bg-soft club-text',
    badge: 'Registro abierto',
    badgeStyle: true,
  },
  {
    to: '/registro/tecnico',
    icon: Dumbbell,
    label: 'Cuerpo Técnico',
    description: 'Gestioná entrenamientos, planillas de partidos y reportes de jugadores.',
    border: 'hover:border-blue-500/60',
    iconBg: 'bg-blue-500/10 text-blue-400',
    badge: 'Requiere código',
    badgeStyle: false,
  },
  {
    to: '/registro/directiva',
    icon: Users,
    label: 'Comisión Directiva',
    description: 'Administrá finanzas, inventario, sponsors y cuotas del club.',
    border: 'hover:border-purple-500/60',
    iconBg: 'bg-purple-500/10 text-purple-400',
    badge: 'Requiere código',
    badgeStyle: false,
  },
]

export default function Registro() {
  const { settings } = useClub()

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      {/* Franja superior */}
      <div className="fixed top-0 left-0 right-0 h-1" style={{ backgroundColor: 'var(--club-primary)' }} />

      <div className="w-full max-w-lg">

        <div className="flex flex-col items-center mb-10 gap-3">
          <ClubLogoBadge size={48} />
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white">{settings?.nombre_club || 'Club Manager'}</h1>
            <p className="text-slate-400 text-sm mt-1">¿Cuál es tu rol en el club?</p>
          </div>
        </div>

        <div className="space-y-3">
          {roles.map((r, i) => (
            <Link
              key={r.to}
              to={r.to}
              className="flex items-center gap-4 p-5 bg-slate-800 border border-slate-700 rounded-2xl transition-all hover:border-slate-500 group"
            >
              <div
                className={`rounded-xl p-3 shrink-0 ${i === 0 ? 'club-bg-soft' : r.iconBg}`}
              >
                <r.icon size={24} className={i === 0 ? 'club-text' : ''} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="font-semibold text-white">{r.label}</p>
                  <span
                    className="text-xs px-2 py-0.5 rounded-full font-medium"
                    style={i === 0
                      ? { backgroundColor: 'rgba(var(--club-primary-rgb),0.15)', color: 'var(--club-primary)' }
                      : { backgroundColor: 'rgba(59,130,246,0.12)', color: '#93c5fd' }
                    }
                  >
                    {r.badge}
                  </span>
                </div>
                <p className="text-sm text-slate-400 leading-snug">{r.description}</p>
              </div>
              <span className="text-slate-600 group-hover:text-slate-300 transition-colors text-xl">›</span>
            </Link>
          ))}
        </div>

        <p className="text-center text-slate-500 text-sm mt-6">
          ¿Ya tenés cuenta?{' '}
          <Link to="/login" className="club-text hover:underline font-medium">Iniciá sesión</Link>
        </p>
      </div>
    </div>
  )
}
