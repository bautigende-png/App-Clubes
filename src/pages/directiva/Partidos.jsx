import { useEffect, useState } from 'react'
import { api } from '../../lib/api'
import { Card } from '../../components/Card'
import { Badge } from '../../components/Badge'
import { Modal } from '../../components/Modal'
import { Input, Select, Textarea } from '../../components/Input'
import { Button } from '../../components/Button'
import { EmptyState } from '../../components/EmptyState'
import { Skeleton } from '../../components/Skeleton'
import { formatDate } from '../../lib/utils'
import { Trophy, ChevronRight, Pencil } from 'lucide-react'
import { toast } from 'sonner'

const tipoBadge = { amistoso: 'slate', liga: 'blue', copa: 'purple', torneo: 'yellow' }

export default function PartidosDirectiva() {
  const [partidos, setPartidos] = useState([])
  const [loading, setLoading] = useState(true)
  const [editModal, setEditModal] = useState(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({})

  useEffect(() => {
    api.get('/api/directiva/partidos').then(setPartidos).finally(() => setLoading(false))
  }, [])

  function openEdit(p) {
    setForm({
      rival: p.rival || '',
      fecha: p.fecha || '',
      hora: p.hora || '',
      lugar: p.lugar || '',
      tipo: p.tipo || 'liga',
      es_local: p.es_local ?? true,
      resultado_propio: p.resultado_propio ?? '',
      resultado_rival: p.resultado_rival ?? '',
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
      })
      setPartidos(prev => prev.map(p => p.id === updated.id ? updated : p))
      toast.success('Partido actualizado')
      setEditModal(null)
    } catch { toast.error('Error al guardar') }
    setSaving(false)
  }

  const today = new Date().toISOString().split('T')[0]

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
        <p className="text-sm text-slate-400 mt-0.5">Vista y edición de resultados</p>
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
              <Card key={p.id}>
                <div className="flex items-center gap-3">
                  {/* Resultado visual */}
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 ${
                    !isPast || p.resultado_propio === null ? 'bg-slate-700 text-slate-400' :
                    ganado ? 'bg-green-500/20 text-green-400' :
                    perdido ? 'bg-red-500/20 text-red-400' :
                    'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {p.resultado_propio !== null
                      ? `${p.resultado_propio}-${p.resultado_rival}`
                      : isPast ? '?' : '—'
                    }
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-white">vs {p.rival}</p>
                      <Badge variant={tipoBadge[p.tipo] || 'slate'}>{p.tipo}</Badge>
                      <Badge variant={p.es_local ? 'green' : 'slate'}>{p.es_local ? 'Local' : 'Visitante'}</Badge>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {formatDate(p.fecha)}
                      {p.hora && ` · ${p.hora}`}
                      {p.lugar && ` · ${p.lugar}`}
                    </p>
                  </div>

                  <button
                    onClick={() => openEdit(p)}
                    className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 transition-colors shrink-0"
                  >
                    <Pencil size={15} />
                  </button>
                </div>
                {p.notas && <p className="text-xs text-slate-500 mt-2 pl-15 truncate">{p.notas}</p>}
              </Card>
            )
          })}
        </div>
      )}

      {/* Modal editar */}
      <Modal open={!!editModal} onClose={() => setEditModal(null)} title={editModal ? `Editar — vs ${editModal.rival}` : ''} size="lg">
        {editModal && (
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Input label="Rival" value={form.rival} onChange={e => setForm(f => ({...f, rival: e.target.value}))} />
            </div>
            <Input label="Fecha" type="date" value={form.fecha} onChange={e => setForm(f => ({...f, fecha: e.target.value}))} />
            <Input label="Hora" type="time" value={form.hora} onChange={e => setForm(f => ({...f, hora: e.target.value}))} />
            <div className="col-span-2">
              <Input label="Lugar" value={form.lugar} onChange={e => setForm(f => ({...f, lugar: e.target.value}))} />
            </div>
            <Select label="Tipo" value={form.tipo} onChange={e => setForm(f => ({...f, tipo: e.target.value}))}>
              <option value="liga">Liga</option>
              <option value="copa">Copa</option>
              <option value="torneo">Torneo</option>
              <option value="amistoso">Amistoso</option>
            </Select>
            <Select label="Condición" value={String(form.es_local)} onChange={e => setForm(f => ({...f, es_local: e.target.value}))}>
              <option value="true">Local</option>
              <option value="false">Visitante</option>
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
              <Textarea label="Notas" rows={2} value={form.notas} onChange={e => setForm(f => ({...f, notas: e.target.value}))} />
            </div>
            <div className="col-span-2 flex gap-3">
              <Button variant="secondary" className="flex-1" onClick={() => setEditModal(null)}>Cancelar</Button>
              <Button className="flex-1" loading={saving} onClick={saveEdit}>Guardar</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
