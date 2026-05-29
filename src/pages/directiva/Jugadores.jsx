import { useEffect, useState } from 'react'
import { api } from '../../lib/api'
import { Card } from '../../components/Card'
import { Badge } from '../../components/Badge'
import { EmptyState } from '../../components/EmptyState'
import { Skeleton } from '../../components/Skeleton'
import { formatCurrency, formatDate, monthName, calcAge, getCurrentMonthYear } from '../../lib/utils'
import { Users, Phone, Calendar, Hash, Activity, Star, AlertTriangle, CheckCircle2, Clock, ChevronRight } from 'lucide-react'

const mesesGrid = () => {
  const { mes, anio } = getCurrentMonthYear()
  const result = []
  for (let i = 11; i >= 0; i--) {
    let m = mes - i
    let a = anio
    if (m <= 0) { m += 12; a -= 1 }
    result.push({ mes: m, anio: a })
  }
  return result
}

const estadoCell = {
  pagado:   { bg: 'bg-green-500/20',  border: 'border-green-500/40',  text: 'text-green-400',  icon: CheckCircle2 },
  pendiente:{ bg: 'bg-yellow-500/20', border: 'border-yellow-500/40', text: 'text-yellow-400', icon: Clock },
  vencido:  { bg: 'bg-red-500/20',    border: 'border-red-500/40',    text: 'text-red-400',    icon: AlertTriangle },
}

export default function Jugadores() {
  const [jugadores, setJugadores] = useState([])
  const [cuotas, setCuotas] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [detalle, setDetalle] = useState(null)
  const [loadingDetalle, setLoadingDetalle] = useState(false)
  const [filtro, setFiltro] = useState('todos') // todos | deudores

  const meses = mesesGrid()

  useEffect(() => { loadAll() }, [])

  async function loadAll() {
    const [j, c] = await Promise.all([
      api.get('/api/directiva/jugadores'),
      api.get('/api/directiva/cuotas'),
    ])
    setJugadores(j)
    setCuotas(c)
    setLoading(false)
  }

  function getCuota(jugadorId, mes, anio) {
    return cuotas.find(c => c.jugador_id === jugadorId && c.mes === mes && c.anio === anio) || null
  }

  function calcDeuda(jugadorId) {
    return cuotas.filter(c => c.jugador_id === jugadorId && c.estado !== 'pagado').length
  }

  async function openDetalle(jugador) {
    setSelected(jugador)
    setLoadingDetalle(true)
    const data = await api.get(`/api/directiva/jugadores/${jugador.id}`)
    setDetalle(data)
    setLoadingDetalle(false)
  }

  const jugadoresFiltrados = filtro === 'deudores'
    ? jugadores.filter(j => calcDeuda(j.id) >= 2)
    : jugadores

  // ── DETALLE ─────────────────────────────────────────────────
  if (selected) {
    const d = detalle
    return (
      <div className="p-4 lg:p-6 space-y-5 max-w-4xl">
        <button onClick={() => { setSelected(null); setDetalle(null) }} className="text-sm text-green-400 hover:underline">← Volver</button>

        {loadingDetalle ? (
          <div className="space-y-4">
            <Skeleton className="h-24 rounded-xl" />
            <Skeleton className="h-48 rounded-xl" />
          </div>
        ) : d && (
          <>
            {/* Header jugador */}
            <Card className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 text-2xl font-bold shrink-0">
                {selected.nombre?.[0]?.toUpperCase()}
              </div>
              <div className="flex-1">
                <h1 className="text-xl font-bold text-white">{selected.nombre} {selected.apellido}</h1>
                <div className="flex flex-wrap gap-3 mt-1 text-sm text-slate-400">
                  {selected.posicion && <span>{selected.posicion}</span>}
                  {selected.numero_camiseta && <span className="flex items-center gap-1"><Hash size={12} />#{selected.numero_camiseta}</span>}
                  {selected.telefono && <span className="flex items-center gap-1"><Phone size={12} />{selected.telefono}</span>}
                  {selected.fecha_nacimiento && <span className="flex items-center gap-1"><Calendar size={12} />{calcAge(selected.fecha_nacimiento)} años</span>}
                </div>
              </div>
              <div className="text-right space-y-1">
                {d.pctAsistencia !== null && (
                  <div className="flex items-center gap-1 justify-end">
                    <Activity size={14} className="text-blue-400" />
                    <span className="text-sm text-white font-semibold">{d.pctAsistencia}%</span>
                    <span className="text-xs text-slate-500">asistencia</span>
                  </div>
                )}
                {d.partidos?.length > 0 && (
                  <div className="flex items-center gap-1 justify-end">
                    <Star size={14} className="text-yellow-400" />
                    <span className="text-sm text-white font-semibold">
                      {(d.partidos.filter(p => p.puntuacion).reduce((s, p) => s + parseFloat(p.puntuacion), 0) / (d.partidos.filter(p => p.puntuacion).length || 1)).toFixed(1)}
                    </span>
                    <span className="text-xs text-slate-500">prom.</span>
                  </div>
                )}
              </div>
            </Card>

            {/* Grilla de cuotas 12 meses */}
            <Card>
              <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                Historial de cuotas
                {calcDeuda(selected.id) >= 2 && (
                  <Badge variant="red">{calcDeuda(selected.id)} meses sin pagar</Badge>
                )}
              </h2>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                {meses.map(({ mes: m, anio: a }) => {
                  const c = getCuota(selected.id, m, a)
                  const st = c ? estadoCell[c.estado] : null
                  return (
                    <div
                      key={`${a}-${m}`}
                      className={`rounded-lg border p-2.5 text-center ${st ? `${st.bg} ${st.border}` : 'bg-slate-700/20 border-slate-700'}`}
                    >
                      <p className="text-xs text-slate-400">{monthName(m).slice(0, 3)}</p>
                      <p className="text-xs text-slate-500">{a}</p>
                      {c ? (
                        <>
                          <p className={`text-xs font-semibold mt-1 ${st.text}`}>
                            {c.estado === 'pagado' ? '✓' : c.estado === 'vencido' ? '✗' : '…'}
                          </p>
                          {c.monto && <p className="text-xs text-slate-400 mt-0.5">{formatCurrency(c.monto)}</p>}
                        </>
                      ) : (
                        <p className="text-xs text-slate-600 mt-1">—</p>
                      )}
                    </div>
                  )
                })}
              </div>

              {/* Resumen financiero */}
              <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-slate-700">
                <div className="text-center">
                  <p className="text-lg font-bold text-green-400">{d.cuotas.filter(c => c.estado === 'pagado').length}</p>
                  <p className="text-xs text-slate-500">Pagadas</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-yellow-400">{d.cuotas.filter(c => c.estado === 'pendiente').length}</p>
                  <p className="text-xs text-slate-500">Pendientes</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-red-400">{formatCurrency(d.cuotas.filter(c => c.estado !== 'pagado').reduce((s, c) => s + Number(c.monto || 0), 0))}</p>
                  <p className="text-xs text-slate-500">Deuda total</p>
                </div>
              </div>
            </Card>

            {/* Últimos partidos */}
            {d.partidos?.length > 0 && (
              <Card>
                <h2 className="text-sm font-semibold text-white mb-3">Últimos partidos</h2>
                <div className="space-y-2">
                  {d.partidos.slice(0, 8).map((p, i) => (
                    <div key={i} className="flex items-center justify-between py-1.5 border-b border-slate-700/50 last:border-0">
                      <div>
                        <p className="text-sm text-white">vs {p.rival}</p>
                        <p className="text-xs text-slate-500">{formatDate(p.fecha)} · {p.minutos_jugados || 0} min</p>
                      </div>
                      {p.puntuacion && (
                        <div className="flex items-center gap-1 text-yellow-400 text-sm font-semibold">
                          <Star size={12} />{p.puntuacion}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </>
        )}
      </div>
    )
  }

  // ── LISTADO ─────────────────────────────────────────────────
  if (loading) return (
    <div className="p-6 space-y-4">
      <Skeleton className="h-8 w-40" />
      <div className="grid md:grid-cols-2 gap-3">{[1,2,3,4].map(i => <Skeleton key={i} className="h-20 rounded-xl" />)}</div>
    </div>
  )

  return (
    <div className="p-4 lg:p-6 space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Jugadores</h1>
          <p className="text-slate-400 text-sm mt-0.5">{jugadores.length} jugadores registrados</p>
        </div>
        <div className="flex gap-2">
          {[{ key: 'todos', label: 'Todos' }, { key: 'deudores', label: `Con deuda (${jugadores.filter(j => calcDeuda(j.id) >= 2).length})` }].map(f => (
            <button
              key={f.key}
              onClick={() => setFiltro(f.key)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filtro === f.key ? 'bg-green-500/20 text-green-400 border border-green-500/40' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {jugadoresFiltrados.length === 0 ? (
        <EmptyState icon={Users} title={filtro === 'deudores' ? 'Ningún jugador con deuda' : 'Sin jugadores registrados'} />
      ) : (
        <div className="grid md:grid-cols-2 gap-3">
          {jugadoresFiltrados.map(j => {
            const deuda = calcDeuda(j.id)
            const { mes, anio } = getCurrentMonthYear()
            const cuotaActual = getCuota(j.id, mes, anio)
            return (
              <Card
                key={j.id}
                className="cursor-pointer hover:border-slate-500 transition-colors"
                onClick={() => openDetalle(j)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-white font-bold shrink-0">
                    {j.nombre?.[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white truncate">{j.nombre} {j.apellido}</p>
                    <p className="text-xs text-slate-400">
                      {j.posicion || 'Sin posición'}
                      {j.numero_camiseta ? ` · #${j.numero_camiseta}` : ''}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    {deuda >= 2 && <Badge variant="red">{deuda} meses</Badge>}
                    {cuotaActual ? (
                      <Badge variant={cuotaActual.estado === 'pagado' ? 'green' : cuotaActual.estado === 'vencido' ? 'red' : 'yellow'}>
                        {monthName(mes).slice(0, 3)}: {cuotaActual.estado}
                      </Badge>
                    ) : (
                      <Badge variant="slate">{monthName(mes).slice(0, 3)}: sin reg.</Badge>
                    )}
                  </div>
                  <ChevronRight size={16} className="text-slate-500 shrink-0" />
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
