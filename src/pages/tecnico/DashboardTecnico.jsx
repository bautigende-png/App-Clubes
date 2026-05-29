import { useEffect, useState } from 'react'
import { api } from '../../lib/api'
import { Card, StatCard } from '../../components/Card'
import { Badge } from '../../components/Badge'
import { Skeleton } from '../../components/Skeleton'
import { formatDate } from '../../lib/utils'
import { Dumbbell, Trophy, Activity, AlertTriangle, Star } from 'lucide-react'

export default function DashboardTecnico() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/api/tecnico/dashboard').then(raw => {
      const { entrenos, proxEntreno, partidos, proxPartido, asistencias, jugadores, participaciones } = raw

      // Asistencia promedio últimos 5 entrenos
      const ids = entrenos.map(e => e.id)
      const relevant = asistencias.filter(a => ids.includes(a.entrenamiento_id))
      const pctAsistencia = relevant.length > 0 ? Math.round((relevant.filter(a => a.asistio).length / relevant.length) * 100) : null

      // Baja asistencia
      const jugadoresBaja = jugadores.filter(j => {
        const jA = relevant.filter(a => a.jugador_id === j.id)
        if (!jA.length) return false
        return Math.round((jA.filter(a => a.asistio).length / jA.length) * 100) < 60
      }).map(j => {
        const jA = relevant.filter(a => a.jugador_id === j.id)
        return { ...j, pct: Math.round((jA.filter(a => a.asistio).length / jA.length) * 100) }
      })

      // Top 5
      const map = {}
      for (const p of participaciones) {
        if (!map[p.jugador_id]) map[p.jugador_id] = { nombre: p.nombre, apellido: p.apellido, vals: [] }
        map[p.jugador_id].vals.push(parseFloat(p.puntuacion))
      }
      const top5 = Object.values(map).map(j => ({ ...j, avg: j.vals.reduce((a,b)=>a+b,0)/j.vals.length })).sort((a,b)=>b.avg-a.avg).slice(0,5)

      setData({ proxEntreno, proxPartido, ultPartidos: partidos, pctAsistencia, jugadoresBaja, top5 })
    }).finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="p-6 space-y-4">
      <Skeleton className="h-8 w-48" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">{[1,2,3,4].map(i => <Skeleton key={i} className="h-24 rounded-xl" />)}</div>
    </div>
  )

  return (
    <div className="p-4 lg:p-6 space-y-6">
      <h1 className="text-2xl font-bold text-white">Dashboard Técnico</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Próximo entreno" value={data.proxEntreno ? formatDate(data.proxEntreno.fecha) : 'Sin fecha'} icon={Dumbbell} color="blue" sub={data.proxEntreno?.horario || ''} />
        <StatCard label="Próximo partido" value={data.proxPartido ? `vs ${data.proxPartido.rival}` : 'Sin partido'} icon={Trophy} color="green" sub={data.proxPartido ? formatDate(data.proxPartido.fecha) : ''} />
        <StatCard label="Asistencia prom." value={data.pctAsistencia !== null ? `${data.pctAsistencia}%` : '-'} icon={Activity} color="yellow" sub="últimos 5 entrenos" />
        <StatCard label="Baja asistencia" value={data.jugadoresBaja.length} icon={AlertTriangle} color="red" sub="jugadores < 60%" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2"><Trophy size={14} className="text-green-400" />Últimos partidos</h2>
          {data.ultPartidos.length === 0 ? <p className="text-slate-500 text-sm py-4 text-center">Sin partidos</p> : (
            <div className="space-y-2">
              {data.ultPartidos.map(p => (
                <div key={p.id} className="flex items-center justify-between py-2 border-b border-slate-700/50 last:border-0">
                  <div><p className="text-sm font-medium text-white">vs {p.rival}</p><p className="text-xs text-slate-500">{formatDate(p.fecha)} · {p.tipo}</p></div>
                  {p.resultado_propio !== null
                    ? <span className={`font-bold text-sm ${p.resultado_propio > p.resultado_rival ? 'text-green-400' : p.resultado_propio < p.resultado_rival ? 'text-red-400' : 'text-yellow-400'}`}>{p.resultado_propio} - {p.resultado_rival}</span>
                    : <Badge variant="slate">Sin resultado</Badge>
                  }
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2"><Star size={14} className="text-yellow-400" />Top 5 jugadores</h2>
          {data.top5.length === 0 ? <p className="text-slate-500 text-sm py-4 text-center">Sin datos</p> : (
            <div className="space-y-2">
              {data.top5.map((j, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-slate-700/50 last:border-0">
                  <div className="flex items-center gap-3"><span className="text-slate-500 text-sm font-mono w-4">{i+1}</span><p className="text-sm font-medium text-white">{j.nombre} {j.apellido}</p></div>
                  <div className="flex items-center gap-1 text-yellow-400 font-bold text-sm"><Star size={12} />{j.avg.toFixed(1)}</div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {data.jugadoresBaja.length > 0 && (
        <Card className="border-yellow-500/30">
          <h2 className="text-sm font-semibold text-yellow-400 uppercase tracking-wider mb-3 flex items-center gap-2"><AlertTriangle size={14} />Jugadores con baja asistencia</h2>
          <div className="flex flex-wrap gap-2">
            {data.jugadoresBaja.map(j => (
              <div key={j.id} className="flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/20 rounded-lg px-3 py-1.5">
                <span className="text-sm text-white">{j.nombre} {j.apellido}</span>
                <Badge variant="yellow">{j.pct}%</Badge>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
