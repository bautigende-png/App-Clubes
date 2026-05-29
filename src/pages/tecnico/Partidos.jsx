import { useEffect, useState } from 'react'
import { api } from '../../lib/api'
import { Button } from '../../components/Button'
import { Card } from '../../components/Card'
import { Modal } from '../../components/Modal'
import { Input, Select, Textarea } from '../../components/Input'
import { Badge } from '../../components/Badge'
import { EmptyState } from '../../components/EmptyState'
import { formatDate } from '../../lib/utils'
import { Plus, Trophy, ChevronRight, Star, Clock } from 'lucide-react'
import { toast } from 'sonner'

const tipoBadge = { amistoso: 'slate', liga: 'blue', copa: 'purple', torneo: 'yellow' }

export default function Partidos() {
  const [partidos, setPartidos] = useState([])
  const [jugadores, setJugadores] = useState([])
  const [loading, setLoading] = useState(true)
  const [newModal, setNewModal] = useState(false)
  const [planilla, setPlanilla] = useState(null)
  const [participaciones, setParticipaciones] = useState({})
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ rival: '', fecha: '', hora: '', lugar: '', es_local: true, tipo: 'liga', resultado_propio: '', resultado_rival: '', notas: '' })

  useEffect(() => { loadAll() }, [])

  async function loadAll() {
    const [p, j] = await Promise.all([api.get('/api/tecnico/partidos'), api.get('/api/tecnico/jugadores')])
    setPartidos(p); setJugadores(j); setLoading(false)
  }

  async function openPlanilla(partido) {
    const data = await api.get(`/api/tecnico/partidos/${partido.id}/participaciones`)
    const map = {}
    for (const j of jugadores) {
      const found = data.find(p => p.jugador_id === j.id)
      map[j.id] = found
        ? { ...found, jugo: (found.minutos_jugados || 0) > 0, categoria_pago: found.categoria_pago || 'completo' }
        : { jugador_id: j.id, minutos_jugados: 0, puntuacion: '', puntos_fuertes: '', puntos_debiles: '', notas: '', jugo: false, categoria_pago: 'completo' }
    }
    setParticipaciones(map)
    setPlanilla({ ...partido })
  }

  async function savePlanilla() {
    setSaving(true)
    try {
      await api.put(`/api/tecnico/partidos/${planilla.id}`, { resultado_propio: planilla.resultado_propio !== '' ? parseInt(planilla.resultado_propio) : null, resultado_rival: planilla.resultado_rival !== '' ? parseInt(planilla.resultado_rival) : null, notas: planilla.notas })
      await api.put(`/api/tecnico/partidos/${planilla.id}/participaciones`, { participaciones: Object.values(participaciones).filter(p => p.jugo).map(p => ({ jugador_id: p.jugador_id, minutos_jugados: p.minutos_jugados || 0, puntuacion: p.puntuacion ? parseFloat(p.puntuacion) : null, puntos_fuertes: p.puntos_fuertes || null, puntos_debiles: p.puntos_debiles || null, notas: p.notas || null, categoria_pago: p.categoria_pago || 'completo' })) })
      toast.success('Planilla guardada')
      setPlanilla(null)
      loadAll()
    } catch { toast.error('Error al guardar') }
    setSaving(false)
  }

  async function createPartido() {
    if (!form.rival || !form.fecha) { toast.error('Rival y fecha requeridos'); return }
    setSaving(true)
    try { await api.post('/api/tecnico/partidos', { ...form, resultado_propio: form.resultado_propio !== '' ? parseInt(form.resultado_propio) : null, resultado_rival: form.resultado_rival !== '' ? parseInt(form.resultado_rival) : null }); toast.success('Partido creado'); setNewModal(false); setForm({ rival: '', fecha: '', hora: '', lugar: '', es_local: true, tipo: 'liga', resultado_propio: '', resultado_rival: '', notas: '' }); loadAll() }
    catch { toast.error('Error') }
    setSaving(false)
  }

  const today = new Date().toISOString().split('T')[0]

  if (loading) return <div className="p-6 text-slate-400">Cargando...</div>

  return (
    <div className="p-4 lg:p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Partidos</h1>
        <Button onClick={() => setNewModal(true)}><Plus size={16} /> Nuevo</Button>
      </div>

      {partidos.length === 0 ? <EmptyState icon={Trophy} title="Sin partidos" action={<Button onClick={() => setNewModal(true)}>Crear partido</Button>} /> : (
        <div className="space-y-3">
          {partidos.map(p => {
            const isPast = p.fecha <= today
            return (
              <Card key={p.id} className={`transition-colors ${isPast ? 'cursor-pointer hover:border-slate-500' : ''}`} onClick={() => isPast ? openPlanilla(p) : null}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-white">vs {p.rival}</p>
                      <Badge variant={tipoBadge[p.tipo] || 'slate'}>{p.tipo}</Badge>
                      <Badge variant={p.es_local ? 'green' : 'slate'}>{p.es_local ? 'Local' : 'Visit.'}</Badge>
                    </div>
                    <p className="text-sm text-slate-400">{formatDate(p.fecha)}{p.hora && ` · ${p.hora}`}{p.lugar && ` · ${p.lugar}`}</p>
                  </div>
                  <div className="text-right">
                    {p.resultado_propio !== null
                      ? <p className={`font-bold ${p.resultado_propio > p.resultado_rival ? 'text-green-400' : p.resultado_propio < p.resultado_rival ? 'text-red-400' : 'text-yellow-400'}`}>{p.resultado_propio} - {p.resultado_rival}</p>
                      : isPast ? <span className="text-xs text-slate-500">Sin resultado</span> : <Badge variant="blue">Próximo</Badge>
                    }
                    {isPast && <ChevronRight size={14} className="text-slate-500 ml-auto mt-1" />}
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      <Modal open={newModal} onClose={() => setNewModal(false)} title="Nuevo partido" size="lg">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2"><Input label="Rival *" value={form.rival} onChange={e => setForm(f => ({...f, rival: e.target.value}))} /></div>
          <Input label="Fecha *" type="date" value={form.fecha} onChange={e => setForm(f => ({...f, fecha: e.target.value}))} />
          <Input label="Hora" type="time" value={form.hora} onChange={e => setForm(f => ({...f, hora: e.target.value}))} />
          <div className="col-span-2"><Input label="Lugar" value={form.lugar} onChange={e => setForm(f => ({...f, lugar: e.target.value}))} /></div>
          <Select label="Tipo" value={form.tipo} onChange={e => setForm(f => ({...f, tipo: e.target.value}))}>
            <option value="liga">Liga</option><option value="copa">Copa</option><option value="torneo">Torneo</option><option value="amistoso">Amistoso</option>
          </Select>
          <Select label="Condición" value={form.es_local} onChange={e => setForm(f => ({...f, es_local: e.target.value === 'true'}))}>
            <option value="true">Local</option><option value="false">Visitante</option>
          </Select>
          <Input label="Goles propios" type="number" min="0" value={form.resultado_propio} onChange={e => setForm(f => ({...f, resultado_propio: e.target.value}))} />
          <Input label="Goles rival" type="number" min="0" value={form.resultado_rival} onChange={e => setForm(f => ({...f, resultado_rival: e.target.value}))} />
          <div className="col-span-2"><Textarea label="Notas" rows={2} value={form.notas} onChange={e => setForm(f => ({...f, notas: e.target.value}))} /></div>
        </div>
        <div className="flex gap-3 pt-4"><Button variant="secondary" className="flex-1" onClick={() => setNewModal(false)}>Cancelar</Button><Button className="flex-1" loading={saving} onClick={createPartido}>Crear</Button></div>
      </Modal>

      <Modal open={!!planilla} onClose={() => setPlanilla(null)} title={planilla ? `Planilla — vs ${planilla.rival}` : ''} size="xl">
        {planilla && (
          <div className="space-y-4">
            <div className="flex gap-4 items-end">
              <Input label="Goles propios" type="number" min="0" value={planilla.resultado_propio ?? ''} onChange={e => setPlanilla(p => ({...p, resultado_propio: e.target.value}))} className="w-32" />
              <span className="text-2xl font-bold text-slate-400 pb-2">-</span>
              <Input label="Goles rival" type="number" min="0" value={planilla.resultado_rival ?? ''} onChange={e => setPlanilla(p => ({...p, resultado_rival: e.target.value}))} className="w-32" />
            </div>
            <div className="space-y-3 max-h-[60vh] overflow-y-auto">
              {jugadores.map(j => {
                const p = participaciones[j.id] || {}
                return (
                  <div key={j.id} className="bg-slate-700/30 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div><p className="font-medium text-white">{j.nombre} {j.apellido}</p><p className="text-xs text-slate-500">{j.posicion || ''}{j.numero_camiseta ? ` · #${j.numero_camiseta}` : ''}</p></div>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <span className="text-sm text-slate-400">Jugó</span>
                        <input type="checkbox" checked={!!p.jugo} onChange={e => setParticipaciones(prev => ({...prev, [j.id]: {...prev[j.id], jugo: e.target.checked}}))} className="w-4 h-4 accent-green-500" />
                      </label>
                    </div>
                    {p.jugo && (
                      <div className="space-y-3">
                        {/* Tiempo jugado y tarifa */}
                        <div className="grid grid-cols-3 gap-2">
                          {[
                            { value: 'completo', label: '2 tiempos', sub: 'Tarifa completa' },
                            { value: 'medio',    label: '1 tiempo',  sub: 'Tarifa media' },
                            { value: 'libre',    label: 'Menos',     sub: 'Sin cobro' },
                          ].map(opt => (
                            <button
                              key={opt.value}
                              type="button"
                              onClick={() => setParticipaciones(prev => ({...prev, [j.id]: {...prev[j.id], categoria_pago: opt.value}}))}
                              className={`rounded-lg px-2 py-2 text-center text-xs transition-colors border ${
                                (p.categoria_pago || 'completo') === opt.value
                                  ? 'bg-blue-500/20 border-blue-500/60 text-blue-300'
                                  : 'bg-slate-700/40 border-slate-600 text-slate-400 hover:border-slate-500'
                              }`}
                            >
                              <p className="font-semibold">{opt.label}</p>
                              <p className="text-slate-500 mt-0.5">{opt.sub}</p>
                            </button>
                          ))}
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="flex flex-col gap-1">
                            <label className="text-xs text-slate-400 flex items-center gap-1"><Clock size={10} />Minutos</label>
                            <input type="number" min="0" max="120" value={p.minutos_jugados || ''} onChange={e => setParticipaciones(prev => ({...prev, [j.id]: {...prev[j.id], minutos_jugados: e.target.value}}))} className="bg-slate-900 border border-slate-600 rounded-lg px-2 py-1.5 text-white text-sm focus:outline-none focus:border-blue-500" />
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className="text-xs text-slate-400 flex items-center gap-1"><Star size={10} />Puntuación (1-10)</label>
                            <input type="number" min="1" max="10" step="0.5" value={p.puntuacion || ''} onChange={e => setParticipaciones(prev => ({...prev, [j.id]: {...prev[j.id], puntuacion: e.target.value}}))} className="bg-slate-900 border border-slate-600 rounded-lg px-2 py-1.5 text-white text-sm focus:outline-none focus:border-blue-500" />
                          </div>
                          <div className="col-span-2 flex flex-col gap-1">
                            <label className="text-xs text-slate-400">Puntos fuertes</label>
                            <input type="text" value={p.puntos_fuertes || ''} onChange={e => setParticipaciones(prev => ({...prev, [j.id]: {...prev[j.id], puntos_fuertes: e.target.value}}))} className="bg-slate-900 border border-slate-600 rounded-lg px-2 py-1.5 text-white text-sm focus:outline-none focus:border-blue-500" />
                          </div>
                          <div className="col-span-2 flex flex-col gap-1">
                            <label className="text-xs text-slate-400">A mejorar</label>
                            <input type="text" value={p.puntos_debiles || ''} onChange={e => setParticipaciones(prev => ({...prev, [j.id]: {...prev[j.id], puntos_debiles: e.target.value}}))} className="bg-slate-900 border border-slate-600 rounded-lg px-2 py-1.5 text-white text-sm focus:outline-none focus:border-blue-500" />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
            <Textarea label="Notas del partido" rows={2} value={planilla.notas || ''} onChange={e => setPlanilla(p => ({...p, notas: e.target.value}))} />
            <div className="flex gap-3"><Button variant="secondary" className="flex-1" onClick={() => setPlanilla(null)}>Cancelar</Button><Button className="flex-1" loading={saving} onClick={savePlanilla}>Guardar planilla</Button></div>
          </div>
        )}
      </Modal>
    </div>
  )
}
