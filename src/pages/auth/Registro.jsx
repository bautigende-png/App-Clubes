import { Link } from 'react-router-dom'
import { Shield, Users, Dumbbell, Trophy } from 'lucide-react'

const roles = [
  {
    to: '/registro/jugador',
    icon: Trophy,
    label: 'Jugador',
    description: 'Accedé a tus estadísticas, asistencias y pagos de cuota.',
    color: 'green',
    border: 'hover:border-green-500/60',
    iconBg: 'bg-green-500/10 text-green-400',
    badge: 'Registro abierto',
    badgeColor: 'bg-green-500/15 text-green-400',
  },
  {
    to: '/registro/tecnico',
    icon: Dumbbell,
    label: 'Cuerpo Técnico',
    description: 'Gestioná entrenamientos, planillas de partidos y reportes de jugadores.',
    color: 'blue',
    border: 'hover:border-blue-500/60',
    iconBg: 'bg-blue-500/10 text-blue-400',
    badge: 'Requiere código',
    badgeColor: 'bg-blue-500/15 text-blue-400',
  },
  {
    to: '/registro/directiva',
    icon: Users,
    label: 'Comisión Directiva',
    description: 'Administrá finanzas, inventario, sponsors y cuotas del club.',
    color: 'purple',
    border: 'hover:border-purple-500/60',
    iconBg: 'bg-purple-500/10 text-purple-400',
    badge: 'Requiere código',
    badgeColor: 'bg-purple-500/15 text-purple-400',
  },
]

export default function Registro() {
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">

        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500/10 rounded-2xl mb-4">
            <Shield size={32} className="text-green-400" />
          </div>
          <h1 className="text-2xl font-bold text-white">Crear cuenta</h1>
          <p className="text-slate-400 text-sm mt-2">¿Cuál es tu rol en el club?</p>
        </div>

        <div className="space-y-3">
          {roles.map(r => (
            <Link
              key={r.to}
              to={r.to}
              className={`flex items-center gap-4 p-5 bg-slate-800 border border-slate-700 rounded-2xl transition-all ${r.border} hover:bg-slate-750 group`}
            >
              <div className={`rounded-xl p-3 shrink-0 ${r.iconBg}`}>
                <r.icon size={24} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="font-semibold text-white">{r.label}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${r.badgeColor}`}>
                    {r.badge}
                  </span>
                </div>
                <p className="text-sm text-slate-400 leading-snug">{r.description}</p>
              </div>
              <span className="text-slate-600 group-hover:text-slate-400 transition-colors text-lg">›</span>
            </Link>
          ))}
        </div>

        <p className="text-center text-slate-500 text-sm mt-6">
          ¿Ya tenés cuenta?{' '}
          <Link to="/login" className="text-green-400 hover:underline">Iniciá sesión</Link>
        </p>
      </div>
    </div>
  )
}
