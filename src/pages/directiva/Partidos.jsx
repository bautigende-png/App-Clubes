import { useEffect, useState } from 'react'
import { api } from '../../lib/api'
import { useClub } from '../../context/ClubContext'
import { Card } from '../../components/Card'
import { Badge } from '../../components/Badge'
import { Modal } from '../../components/Modal'
import { Input, Select, Textarea } from '../../components/Input'
import { Button } from '../../components/Button'
import { EmptyState } from '../../components/EmptyState'
import { Skeleton } from '../../components/Skeleton'
import { formatCurrency, formatDate } from '../../lib/utils'
import { Trophy, ChevronRight, Pencil, DollarSign, CheckCircle2, Clock, AlertTriangle, Zap } from 'lucide-react'
import { toast } from 'sonner'

const tipoBadge   = { amistoso: 'slate', liga: 'blue', copa: 'purple', torneo: 'yellow' }
const categLabel  = { completo: '2 tiempos', medio: '1 tiempo', libre: 'Sin cobro' }
const categBadge  = { completo: 'green', medio: 'yellow', libre: 'slate' }

export default function PartidosDirectiva() {
  const { settings } = useClub()
  const [partidos, setPartidos]       = useState([])
  const [loading, setLoading]         = useState(true)
  const [selected, setSelected]       = useState(null) // partido con detalle de cobros
  const [cobros, setCobros]           = useState([])
  const [loadingCobros, setLoadingCobros] = useState(false)

  const [editModal, setEditModal]     = useState(null)
  const [cobrosModal, setCobrosModal] = useState(null) // partido para generar cobros
  const [saving, setSaving]           = useState(false)
  const [form, setForm]               = useState({})
  const [costoInput, setCostoInput]   = useState('')
  const [usarTarifas, setUsarTarifas] = useState(true) // true=tarifas fijas, false=dividir total

  useEffect(() => {
    api.get('/api/directiva/partidos').then(setPartidos).finally(() => setLoading(false))
  }, [])

  function openEdit(p, e) {
    e.stopPropagation()
    setForm({
      rival: p.rival || '', fecha: p.fecha || '', hora: p.hora || '',
      lugar: p.lugar || '', tipo: p.tipo || 'liga',
      es_local: p.es_local ?? true,
      resultado_propio: p.resultado_propio ?? '',
      resultado_rival: p.resultado_rival ?? '',
      costo_total: p.costo_total || '',
      notas: p.notas || '',
    })
    setEditModal(p)
  }

  async function saveEdit() {
    setSaving(true)
    try {
      const updated = await api.put(`/api/directiva/partidos/${editModal.id}`, {
        ...form,
        es_local: form.es_local === 'true' || form.es_local === true,
        resultado_propio: form.resultado_propio !== '' ? parseInt(form.resultado_propio) : null,
        resultado_rival: form.resultado_rival !== '' ? parseInt(form.resultado_rival) : null,
        costo_total: form.costo_total !== '' ? parseFloat(form.costo_total) : null,
      })
      setPartidos(prev => prev.map(p => p.id === updated.id ? updated : p))
      if (selected?.id === updated.id) setSelected(updated)
      toast.success('Partido actualizado')
      setEditModal(null)
    } catch { toast.error('Error al guardar') }
    setSaving(false)
  }

  async function openDetalle(partido) {
    setSelected(partido)
    setLoadingCobros(true)
    const data = await api.get(`/api/directiva/partidos/${partido.id}/cobros`)
    setCobros(data)
    setLoadingCobros(false)
  }

  async function generarCobros() {
    setSaving(true)
    try {
      const payload = usarTarifas ? {} : { costo_total: parseFloat(costoInput) }
      if (!usarTarifas && !costoInput) { toast.error('Ingresá el costo total'); setSaving(false); return }
      const result = await api.post(`/api/directiva/partidos/${cobrosModal.id}/cobros/generar`, payload)
      toast.success(`${result.cobros.length} cobros generados`)
      setCobrosModal(null)
      setCostoInput('')
      // Refrescar cobros si el partido está abierto
      if (selected?.id === cobrosModal.id) {
        const updated = await api.get(`/api/directiva/partidos/${cobrosModal.id}/cobros`)
        setCobros(updated)
      }
      // Actualizar costo en lista
      if (!usarTarifas) {
        setPartidos(prev => prev.map(p => p.id === cobrosModal.id ? { ...p, costo_total: parseFloat(costoInput) } : p))
      }
    } catch (e) { toast.error(e.message || 'Error') }
    setSaving(false)
  }

  async function toggleCobro(cobro) {
    const nuevoEstado = cobro.estado === 'pagado' ? 'pendiente' : 'pagado'
    try {
      const updated = await api.put(`/api/directiva/cobros-partido/${cobro.id}`, { estado: nuevoEstado })
      setCobros(prev => prev.map(c => c.id === updated.id ? { ...c, ...updated } : c))
      toast.success(nuevoEstado === 'pagado' ? `${cobro.nombre} marcado como pagado` : 'Marcado como pendiente')
    } catch { toast.error('Error') }
  }

  const today = new Date().toISOString().split('T')[0]

  // ── DETALLE ─────────────────────────────────────────────────
  if (selected) {
    const cobradoTotal = cobros.filter(c => c.estado === 'pagado').reduce((s, c) => s + Number(c.monto || 0), 0)
    const pendienteTotal = cobros.filter(c => c.estado === 'pendiente').reduce((s, c) => s + Number(c.monto || 0), 0)

    return (
      <div className="p-4 lg:p-6 space-y-5 max-w-3xl">
        <button onClick={() => setSelected(null)} className="text-sm text-green-400 hover:underline">← Volver</button>

        {/* Header partido */}
        <Card>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-xl font-bold text-white">vs {selected.rival}</h1>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <Badge variant={tipoBadge[selected.tipo] || 'slate'}>{selected.tipo}</Badge>
                <Badge variant={selected.es_local ? 'green' : 'slate'}>{selected.es_local ? 'Local' : 'Visitante'}</Badge>
                <span className="text-sm text-slate-400">{formatDate(selected.fecha)}</span>
                {selected.hora && <span className="text-sm text-slate-400">· {selected.hora}</span>}
              </div>
              {selected.lugar && <p className="text-xs text-slate-500 mt-1">{selected.lugar}</p>}
            </div>
            <div className="text-right">
              {selected.resultado_propio !== null && (
                <p className={`text-2xl font-bold ${selected.resultado_propio > selected.resultado_rival ? 'text-green-400' : selected.resultado_propio < selected.resultado_rival ? 'text-red-400' : 'text-yellow-400'}`}>
                  {selected.resultado_propio} - {selected.resultado_rival}
                </p>
              )}
              <button onClick={e => openEdit(selected, e)} className="mt-1 flex items-center gap-1 text-xs text-slate-400 hover:text-white ml-auto">
                <Pencil size={11} /> Editar
              </button>
            </div>
          </div>

          {selected.costo_total && (
            <div className="mt-3 pt-3 border-t border-slate-700 flex items-center justify-between">
              <span className="text-sm text-slate-400">Costo total del partido</span>
              <span className="font-semibold text-white">{formatCurrency(selected.costo_total)}</span>
            </div>
          )}
        </Card>

        {/* Cobros */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <DollarSign size={16} className="text-slate-400" />
              Cobros por partido
            </h2>
            <Button size="sm" onClick={() => { setCobrosModal(selected); setCostoInput(selected.costo_total || '') }}>
              <Zap size={14} /> Generar cobros
            </Button>
          </div>

          {loadingCobros ? (
            <p className="text-slate-400 text-sm py-4 text-center">Cargando cobros...</p>
          ) : cobros.length === 0 ? (
            <div className="text-center py-8 space-y-3">
              <p className="text-slate-500 text-sm">Sin cobros generados</p>
              <p className="text-xs text-slate-600">El técnico debe cargar la planilla primero, luego generás los cobros.</p>
            </div>
          ) : (
            <>
              {/* Resumen */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 text-center">
                  <p className="text-lg font-bold text-green-400">{formatCurrency(cobradoTotal)}</p>
                  <p className="text-xs text-slate-400">Cobrado ({cobros.filter(c => c.estado === 'pagado').length})</p>
                </div>
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 text-center">
                  <p className="text-lg font-bold text-yellow-400">{formatCurrency(pendienteTotal)}</p>
                  <p className="text-xs text-slate-400">Pendiente ({cobros.filter(c => c.estado === 'pendiente').length})</p>
                </div>
              </div>

              {/* Lista */}
              <div className="space-y-2">
                {cobros.map(c => (
                  <div key={c.id} className="flex items-center justify-between py-2 px-1 border-b border-slate-700/50 last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-white shrink-0">
                        {c.nombre?.[0]?.toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{c.nombre} {c.apellido}</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <Badge variant={categBadge[c.categoria] || 'slate'} className="text-xs">
                            {categLabel[c.categoria] || c.categoria}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-white text-sm">{formatCurrency(c.monto)}</span>
                      <button
                        onClick={() => toggleCobro(c)}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                          c.estado === 'pagado'
                            ? 'bg-green-500/15 text-green-400 hover:bg-green-500/25'
                            : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                        }`}
                      >
                        {c.estado === 'pagado'
                          ? <><CheckCircle2 size={12} /> Pagado</>
                          : <><Clock size={12} /> Pendiente</>
                        }
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </Card>

        {/* Modal generar cobros */}
        <Modal open={!!cobrosModal} onClose={() => setCobrosModal(null)} title="Generar cobros del partido" size="sm">
          <div className="space-y-4">
            <p className="text-sm text-slate-400">
              Los cobros se calculan según la categoría que asignó el técnico en la planilla.
            </p>

            {/* Modo */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setUsarTarifas(true)}
                className={`p-3 rounded-lg border text-sm transition-colors text-left ${usarTarifas ? 'bg-green-500/15 border-green-500/50 text-green-300' : 'bg-slate-700/30 border-slate-600 text-slate-400'}`}
              >
                <p className="font-semibold">Tarifas fijas</p>
                <p className="text-xs mt-0.5 opacity-70">
                  Completo: {formatCurrency(settings.tarifa_completa || 5000)}<br/>
                  Medio: {formatCurrency(settings.tarifa_media || 2500)}
                </p>
              </button>
              <button
                onClick={() => setUsarTarifas(false)}
                className={`p-3 rounded-lg border text-sm transition-colors text-left ${!usarTarifas ? 'bg-blue-500/15 border-blue-500/50 text-blue-300' : 'bg-slate-700/30 border-slate-600 text-slate-400'}`}
              >
                <p className="font-semibold">Dividir total</p>
                <p className="text-xs mt-0.5 opacity-70">Ingresás el costo total y se divide proporcionalmente</p>
              </button>
            </div>

            {!usarTarifas && (
              <div className="flex items-center gap-2 bg-slate-900 border border-slate-600 rounded-lg px-3 py-2">
                <span className="text-slate-500 text-sm">$</span>
                <input
                  type="number" min="0" step="100"
                  placeholder="Costo total del partido"
                  value={costoInput}
                  onChange={e => setCostoInput(e.target.value)}
                  className="flex-1 bg-transparent text-white outline-none text-sm"
                  autoFocus
                />
              </div>
            )}

            <div className="bg-slate-700/30 rounded-lg px-3 py-2 text-xs text-slate-400">
              Si ya hay cobros pagados, no se sobrescriben.
            </div>

            <div className="flex gap-3">
              <Button variant="secondary" className="flex-1" onClick={() => setCobrosModal(null)}>Cancelar</Button>
              <Button className="flex-1" loading={saving} onClick={generarCobros}>
                <Zap size={14} /> Generar
              </Button>
            </div>
          </div>
        </Modal>

        {/* Modal editar */}
        {editModal && (
          <Modal open={!!editModal} onClose={() => setEditModal(null)} title={`Editar — vs ${editModal.rival}`} size="lg">
            <EditForm form={form} setForm={setForm} saving={saving} onSave={saveEdit} onClose={() => setEditModal(null)} />
          </Modal>
        )}
      </div>
    )
  }

  // ── LISTADO ─────────────────────────────────────────────────
  if (loading) return (
    <div className="p-6 space-y-3">
      <Skeleton className="h-8 w-40" />
      {[1,2,3].map(i => <Skeleton key={i} className="h-20 rounded-xl" />)}
    </div>
  )

  return (
    <div className="p-4 lg:p-6 space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-white">Partidos</h1>
        <p className="text-sm text-slate-400 mt-0.5">Resultados y cobros por partido</p>
      </div>

      {partidos.length === 0 ? (
        <EmptyState icon={Trophy} title="Sin partidos registrados" description="El cuerpo técnico crea los partidos desde su sección." />
      ) : (
        <div className="space-y-3">
          {partidos.map(p => {
            const isPast = p.fecha <= today
            const ganado = p.resultado_propio > p.resultado_rival
            const perdido = p.resultado_propio < p.resultado_rival

            return (
              <Card
                key={p.id}
                className={`transition-colors ${isPast ? 'cursor-pointer hover:border-slate-500' : ''}`}
                onClick={() => isPast ? openDetalle(p) : null}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 ${
                    !isPast || p.resultado_propio === null ? 'bg-slate-700 text-slate-400' :
                    ganado ? 'bg-green-500/20 text-green-400' :
                    perdido ? 'bg-red-500/20 text-red-400' :
                    'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {p.resultado_propio !== null ? `${p.resultado_propio}-${p.resultado_rival}` : isPast ? '?' : '—'}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-white">vs {p.rival}</p>
                      <Badge variant={tipoBadge[p.tipo] || 'slate'}>{p.tipo}</Badge>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-400 flex-wrap">
                      <span>{formatDate(p.fecha)}</span>
                      {p.lugar && <span>· {p.lugar}</span>}
                      {p.costo_total && <span className="text-green-400">· {formatCurrency(p.costo_total)}</span>}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button onClick={e => openEdit(p, e)} className="p-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300">
                      <Pencil size={13} />
                    </button>
                    {isPast && <ChevronRight size={16} className="text-slate-500" />}
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {editModal && (
        <Modal open={!!editModal} onClose={() => setEditModal(null)} title={`Editar — vs ${editModal.rival}`} size="lg">
          <EditForm form={form} setForm={setForm} saving={saving} onSave={saveEdit} onClose={() => setEditModal(null)} />
        </Modal>
      )}
    </div>
  )
}

function EditForm({ form, setForm, saving, onSave, onClose }) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="col-span-2"><Input label="Rival" value={form.rival} onChange={e => setForm(f => ({...f, rival: e.target.value}))} /></div>
      <Input label="Fecha" type="date" value={form.fecha} onChange={e => setForm(f => ({...f, fecha: e.target.value}))} />
      <Input label="Hora" type="time" value={form.hora} onChange={e => setForm(f => ({...f, hora: e.target.value}))} />
      <div className="col-span-2"><Input label="Lugar" value={form.lugar} onChange={e => setForm(f => ({...f, lugar: e.target.value}))} /></div>
      <Select label="Tipo" value={form.tipo} onChange={e => setForm(f => ({...f, tipo: e.target.value}))}>
        <option value="liga">Liga</option><option value="copa">Copa</option>
        <option value="torneo">Torneo</option><option value="amistoso">Amistoso</option>
      </Select>
      <Select label="Condición" value={String(form.es_local)} onChange={e => setForm(f => ({...f, es_local: e.target.value}))}>
        <option value="true">Local</option><option value="false">Visitante</option>
      </Select>
      <div className="col-span-2">
        <p className="text-sm text-slate-300 mb-2">Resultado</p>
        <div className="flex items-center gap-3">
          <input type="number" min="0" max="99" value={form.resultado_propio} onChange={e => setForm(f => ({...f, resultado_propio: e.target.value}))} placeholder="Nuestros" className="w-24 bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white text-center focus:outline-none focus:border-green-500" />
          <span className="text-slate-400 font-bold text-xl">—</span>
          <input type="number" min="0" max="99" value={form.resultado_rival} onChange={e => setForm(f => ({...f, resultado_rival: e.target.value}))} placeholder="Rival" className="w-24 bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white text-center focus:outline-none focus:border-green-500" />
        </div>
      </div>
      <div className="col-span-2">
        <label className="text-sm text-slate-300 block mb-1">Costo total del partido (ARS)</label>
        <div className="flex items-center gap-2 bg-slate-900 border border-slate-600 rounded-lg px-3 py-2">
          <span className="text-slate-500 text-sm">$</span>
          <input type="number" min="0" step="100" value={form.costo_total} onChange={e => setForm(f => ({...f, costo_total: e.target.value}))} placeholder="Ej: 12000" className="flex-1 bg-transparent text-white outline-none text-sm" />
        </div>
      </div>
      <div className="col-span-2"><Textarea label="Notas" rows={2} value={form.notas} onChange={e => setForm(f => ({...f, notas: e.target.value}))} /></div>
      <div className="col-span-2 flex gap-3">
        <Button variant="secondary" className="flex-1" onClick={onClose}>Cancelar</Button>
        <Button className="flex-1" loading={saving} onClick={onSave}>Guardar</Button>
      </div>
    </div>
  )
}
