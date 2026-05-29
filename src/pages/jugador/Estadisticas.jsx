import { useEffect, useState } from 'react'
import { api } from '../../lib/api'
import { Card, StatCard } from '../../components/Card'
import { Skeleton } from '../../components/Skeleton'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { Activity, Target, Clock, TrendingUp, Star, ThumbsUp, ThumbsDown } from 'lucide-react'
import { formatDateShort } from '../../lib/utils'

export default function Estadisticas() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/api/jugador/estadisticas').then(({ asistencias, participaciones }) => {
      const totalEntrenos = asistencias.length
      const asistio = asistencias.filter(a => a.asistio).length
      const pctAsistencia = totalEntrenos > 0 ? Math.round((asistio / totalEntrenos) * 100) : 0

      const jugados = participaciones.filter(p => p.minutos_jugados > 0)
      const totalMinutos = jugados.reduce((s, p) => s + (p.minutos_jugados || 0), 0)
      const punts = participaciones.filter(p => p.puntuacion).map(p => parseFloat(p.puntuacion))
      const avgPuntuacion = punts.length ? (punts.reduce((a, b) => a + b, 0) / punts.length).toFixed(1) : '-'

      const chartData = participaciones
        .filter(p => p.puntuacion && p.fecha)
        .slice(0, 10).reverse()
        .map(p => ({ fecha: formatDateShort(p.fecha), puntuacion: parseFloat(p.puntuacion) }))

      const puntFuertes = participaciones.filter(p => p.puntos_fuertes).slice(0, 5)
      const puntDebiles = participaciones.filter(p => p.puntos_debiles).slice(0, 5)

      setStats({ totalEntrenos, asistio, pctAsistencia, totalPartidos: participaciones.length, partidosJugados: jugados.length, totalMinutos, avgPuntuacion, chartData, puntFuertes, puntDebiles })
    }).finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="p-4 space-y-4">
      <Skeleton className="h-7 w-40 mt-2" />
      <div className="grid grid-cols-2 gap-3">{[1,2,3,4].map(i => <Skeleton key={i} className="h-24 rounded-xl" />)}</div>
    </div>
  )

  if (!stats) return null

  return (
    <div className="p-4 space-y-4 max-w-lg mx-auto">
      <h1 className="text-xl font-bold text-white pt-2">Mis Estadísticas</h1>

      <div className="grid grid-cols-2 gap-3">
        <StatCard label="Asistencia" value={`${stats.pctAsistencia}%`} icon={Activity} color="green" sub={`${stats.asistio}/${stats.totalEntrenos} entrenos`} />
        <StatCard label="Puntuación prom." value={stats.avgPuntuacion} icon={Star} color="yellow" sub="en partidos" />
        <StatCard label="Partidos" value={stats.partidosJugados} icon={Target} color="blue" sub="jugados" />
        <StatCard label="Minutos" value={stats.totalMinutos} icon={Clock} color="purple" sub="en cancha" />
      </div>

      {stats.chartData.length > 0 && (
        <Card>
          <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2"><TrendingUp size={16} className="text-green-400" />Evolución de puntuación</h2>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={stats.chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="fecha" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <YAxis domain={[0, 10]} tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8 }} itemStyle={{ color: '#22c55e' }} />
              <Line type="monotone" dataKey="puntuacion" stroke="#22c55e" strokeWidth={2} dot={{ fill: '#22c55e', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      )}

      {stats.puntFuertes.length > 0 && (
        <Card>
          <h2 className="text-sm font-semibold text-white mb-3 flex items-center gap-2"><ThumbsUp size={16} className="text-green-400" />Puntos fuertes</h2>
          <ul className="space-y-2">
            {stats.puntFuertes.map((p, i) => (
              <li key={i} className="text-sm text-slate-300 bg-green-500/5 border border-green-500/20 rounded-lg px-3 py-2">
                {p.puntos_fuertes}
                {p.rival && <span className="text-xs text-slate-500 block mt-0.5">vs {p.rival}</span>}
              </li>
            ))}
          </ul>
        </Card>
      )}

      {stats.puntDebiles.length > 0 && (
        <Card>
          <h2 className="text-sm font-semibold text-white mb-3 flex items-center gap-2"><ThumbsDown size={16} className="text-yellow-400" />A mejorar</h2>
          <ul className="space-y-2">
            {stats.puntDebiles.map((p, i) => (
              <li key={i} className="text-sm text-slate-300 bg-yellow-500/5 border border-yellow-500/20 rounded-lg px-3 py-2">
                {p.puntos_debiles}
                {p.rival && <span className="text-xs text-slate-500 block mt-0.5">vs {p.rival}</span>}
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  )
}
