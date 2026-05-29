import { useEffect, useState } from 'react'
import { api } from '../../lib/api'
import { Card } from '../../components/Card'
import { Badge } from '../../components/Badge'
import { EmptyState } from '../../components/EmptyState'
import { formatDate } from '../../lib/utils'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { Users, Star, Activity, Clock, Target, ThumbsUp, ThumbsDown } from 'lucide-react'

export default function JugadoresReporte() {
  const [jugadores, setJugadores] = useState([])
  const [selected, setSelected] = useState(null)
  const [reporte, setReporte] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/api/tecnico/jugadores').then(setJugadores).finally(() => setLoading(false))
  }, [])

  async function loadReporte(jugador) {
    setSelected(jugador)
    setReporte(null)
    const { asistencias, participaciones } = await api.get(`/api/tecnico/jugadores/${jugador.id}/reporte`)

    const totalEntrenos = asistencias.length
    const asistio = asistencias.filter(a => a.asistio).length
    const pctAsistencia = totalEntrenos > 0 ? Math.round((asistio / totalEntrenos) * 100) : 0
    const jugados = participaciones.filter(p => p.minutos_jugados > 0)
    const totalMinutos = jugados.reduce((s, p) => s + (p.minutos_jugados || 0), 0)
    const punts = participaciones.filter(p => p.puntuacion).map(p => parseFloat(p.puntuacion))
    const avgPunt = punts.length ? (punts.reduce((a,b)=>a+b,0)/punts.length).toFixed(1) : '-'
    const chartData = participaciones.filter(p => p.puntuacion && p.fecha).slice(0,10).reverse().map(p => ({ fecha: formatDate(p.fecha), puntuacion: parseFloat(p.puntuacion) }))

    setReporte({ pctAsistencia, totalEntrenos, asistio, totalPartidos: participaciones.length, partidosJugados: jugados.length, totalMinutos, avgPunt, chartData, fuertes: participaciones.filter(p => p.puntos_fuertes).slice(0,5), debiles: participaciones.filter(p => p.puntos_debiles).slice(0,5) })
  }

  if (selected && reporte) {
    return (
      <div className="p-4 lg:p-6 space-y-5 max-w-3xl">
        <button onClick={() => { setSelected(null); setReporte(null) }} className="text-sm text-blue-400 hover:underline">← Volver</button>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 text-xl font-bold">{selected.nombre?.[0]?.toUpperCase()}</div>
          <div><h1 className="text-xl font-bold text-white">{selected.nombre} {selected.apellido}</h1><p className="text-slate-400 text-sm">{selected.posicion || 'Sin posición'}{selected.numero_camiseta ? ` · #${selected.numero_camiseta}` : ''}</p></div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Asistencia', value: `${reporte.pctAsistencia}%`, sub: `${reporte.asistio}/${reporte.totalEntrenos}`, icon: Activity },
            { label: 'Puntuación', value: reporte.avgPunt, sub: 'promedio', icon: Star },
            { label: 'Partidos', value: reporte.partidosJugados, sub: 'jugados', icon: Target },
            { label: 'Minutos', value: reporte.totalMinutos, sub: 'totales', icon: Clock },
          ].map((s, i) => (
            <Card key={i} className="flex items-center gap-3 p-4">
              <s.icon size={18} className="text-blue-400 shrink-0" />
              <div><p className="text-xs text-slate-500">{s.label}</p><p className="text-lg font-bold text-white">{s.value}</p><p className="text-xs text-slate-600">{s.sub}</p></div>
            </Card>
          ))}
        </div>

        {reporte.chartData.length > 0 && (
          <Card>
            <h2 className="text-sm font-semibold text-white mb-4">Evolución de puntuación</h2>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={reporte.chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="fecha" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <YAxis domain={[0,10]} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8 }} itemStyle={{ color: '#3b82f6' }} />
                <Line type="monotone" dataKey="puntuacion" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        )}

        {reporte.fuertes.length > 0 && (
          <Card>
            <h2 className="text-sm font-semibold text-white mb-3 flex items-center gap-2"><ThumbsUp size={14} className="text-green-400" />Puntos fuertes</h2>
            <ul className="space-y-2">{reporte.fuertes.map((p,i) => <li key={i} className="text-sm text-slate-300 bg-green-500/5 border border-green-500/20 rounded-lg px-3 py-2">{p.puntos_fuertes}<span className="text-xs text-slate-500 block">vs {p.rival} · {formatDate(p.fecha)}</span></li>)}</ul>
          </Card>
        )}

        {reporte.debiles.length > 0 && (
          <Card>
            <h2 className="text-sm font-semibold text-white mb-3 flex items-center gap-2"><ThumbsDown size={14} className="text-yellow-400" />A mejorar</h2>
            <ul className="space-y-2">{reporte.debiles.map((p,i) => <li key={i} className="text-sm text-slate-300 bg-yellow-500/5 border border-yellow-500/20 rounded-lg px-3 py-2">{p.puntos_debiles}<span className="text-xs text-slate-500 block">vs {p.rival} · {formatDate(p.fecha)}</span></li>)}</ul>
          </Card>
        )}
      </div>
    )
  }

  if (selected && !reporte) return <div className="p-6 text-slate-400">Cargando reporte...</div>

  if (loading) return <div className="p-6 text-slate-400">Cargando...</div>

  return (
    <div className="p-4 lg:p-6 space-y-5">
      <h1 className="text-2xl font-bold text-white">Jugadores</h1>
      {jugadores.length === 0 ? <EmptyState icon={Users} title="Sin jugadores" /> : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {jugadores.map(j => (
            <Card key={j.id} className="cursor-pointer hover:border-blue-500/50 transition-colors" onClick={() => loadReporte(j)}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold shrink-0">{j.nombre?.[0]?.toUpperCase()}</div>
                <div className="flex-1 min-w-0"><p className="font-semibold text-white truncate">{j.nombre} {j.apellido}</p><p className="text-xs text-slate-400">{j.posicion || 'Sin posición'}{j.numero_camiseta ? ` · #${j.numero_camiseta}` : ''}</p></div>
                <Badge variant="blue">Ver</Badge>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
