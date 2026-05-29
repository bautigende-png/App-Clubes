import { useEffect, useState } from 'react'
import { api } from '../../lib/api'
import { Card } from '../../components/Card'
import { Badge } from '../../components/Badge'
import { Skeleton } from '../../components/Skeleton'
import { EmptyState } from '../../components/EmptyState'
import { formatDate } from '../../lib/utils'
import { History, Star, Clock, ThumbsUp, ThumbsDown, MapPin } from 'lucide-react'

const tipoBadge = { amistoso: 'slate', liga: 'blue', copa: 'purple', torneo: 'yellow' }

export default function PartidosJugador() {
  const [partidos, setPartidos] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    api.get('/api/jugador/estadisticas')
      .then(({ participaciones }) => setPartidos(participaciones || []))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="p-4 space-y-3">
      <Skeleton className="h-7 w-40 mt-2" />
      {[1,2,3].map(i => <Skeleton key={i} className="h-24 rounded-xl" />)}
    </div>
  )

  if (selected) {
    return (
      <div className="p-4 space-y-4 max-w-lg mx-auto">
        <button onClick={() => setSelected(null)} className="text-sm text-green-400 hover:underline">← Volver</button>
        <Card>
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-white">vs {selected.rival}</h2>
              <p className="text-sm text-slate-400">{formatDate(selected.fecha)}</p>
            </div>
            {selected.resultado_propio !== null && (
              <p className="text-2xl font-bold text-white">{selected.resultado_propio} - {selected.resultado_rival}</p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4 py-4 border-t border-b border-slate-700">
            <div className="text-center">
              <p className="text-xs text-slate-500">Minutos</p>
              <p className="text-2xl font-bold text-white">{selected.minutos_jugados || 0}'</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-slate-500">Puntuación</p>
              <p className="text-2xl font-bold text-yellow-400">{selected.puntuacion || '-'}</p>
            </div>
          </div>
          {selected.puntos_fuertes && (
            <div className="mt-4">
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1"><ThumbsUp size={12} className="text-green-400" />Puntos fuertes</p>
              <p className="text-sm text-slate-300 bg-green-500/5 border border-green-500/20 rounded-lg p-3">{selected.puntos_fuertes}</p>
            </div>
          )}
          {selected.puntos_debiles && (
            <div className="mt-3">
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1"><ThumbsDown size={12} className="text-yellow-400" />A mejorar</p>
              <p className="text-sm text-slate-300 bg-yellow-500/5 border border-yellow-500/20 rounded-lg p-3">{selected.puntos_debiles}</p>
            </div>
          )}
        </Card>
      </div>
    )
  }

  return (
    <div className="p-4 space-y-4 max-w-lg mx-auto">
      <h1 className="text-xl font-bold text-white pt-2">Historial de Partidos</h1>
      {partidos.length === 0 ? (
        <EmptyState icon={History} title="Sin partidos registrados" />
      ) : (
        <div className="space-y-3">
          {partidos.map(p => (
            <Card key={p.id} className="cursor-pointer hover:border-slate-500 transition-colors" onClick={() => setSelected(p)}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">{formatDate(p.fecha)}</p>
                  <p className="font-semibold text-white">vs {p.rival}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-slate-500 flex items-center gap-1"><Clock size={11} />{p.minutos_jugados || 0}'</span>
                    {p.puntuacion && <span className="text-xs text-yellow-400 flex items-center gap-1"><Star size={11} />{p.puntuacion}</span>}
                  </div>
                </div>
                <div className="text-right">
                  {p.resultado_propio !== null
                    ? <p className="font-bold text-white">{p.resultado_propio} - {p.resultado_rival}</p>
                    : <Badge variant="slate">Sin resultado</Badge>
                  }
                  <Badge variant={tipoBadge[p.tipo] || 'slate'} className="mt-1">{p.tipo || '-'}</Badge>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
