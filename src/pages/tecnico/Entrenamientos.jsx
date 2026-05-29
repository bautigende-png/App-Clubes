import { useEffect, useState } from 'react'
import { api } from '../../lib/api'
import { Button } from '../../components/Button'
import { Card } from '../../components/Card'
import { Modal } from '../../components/Modal'
import { Input, Textarea } from '../../components/Input'
import { Badge } from '../../components/Badge'
import { EmptyState } from '../../components/EmptyState'
import { formatDate } from '../../lib/utils'
import { Plus, Dumbbell, CheckCircle, XCircle, ChevronRight } from 'lucide-react'
import { toast } from 'sonner'

export default function Entrenamientos() {
  const [entrenamientos, setEntrenamientos] = useState([])
  const [jugadores, setJugadores] = useState([])
  const [loading, setLoading] = useState(true)
  const [newModal, setNewModal] = useState(false)
  const [asistModal, setAsistModal] = useState(null)
  const [asistencias, setAsistencias] = useState({})
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ fecha: '', horario: '', lugar: '', notas: '' })

  useEffect(() => { loadAll() }, [])

  async function loadAll() {
    const [ent, jug] = await Promise.all([api.get('/api/tecnico/entrenamientos'), api.get('/api/tecnico/jugadores')])
    setEntrenamientos(ent)
    setJugadores(jug)
    setLoading(false)
  }

  async function openAsistencia(e) {
    const data = await api.get(`/api/tecnico/entrenamientos/${e.id}/asistencia`)
    const map = {}
    for (const j of jugadores) map[j.id] = false
    for (const a of data) map[a.jugador_id] = a.asistio
    setAsistencias(map)
    setAsistModal(e)
  }

  async function saveAsistencia() {
    setSaving(true)
    try {
      await api.put(`/api/tecnico/entrenamientos/${asistModal.id}/asistencia`, { asistencias: Object.entries(asistencias).map(([jugador_id, asistio]) => ({ jugador_id, asistio })) })
      toast.success('Asistencia guardada')
      setAsistModal(null)
    } catch { toast.error('Error al guardar') }
    setSaving(false)
  }

  async function createEntrenamiento() {
    if (!form.fecha) { toast.error('La fecha es requerida'); return }
    setSaving(true)
    try { await api.post('/api/tecnico/entrenamientos', form); toast.success('Entrenamiento creado'); setNewModal(false); setForm({ fecha: '', horario: '', lugar: '', notas: '' }); loadAll() }
    catch { toast.error('Error al crear') }
    setSaving(false)
  }

  const today = new Date().toISOString().split('T')[0]

  if (loading) return <div className="p-6 text-slate-400">Cargando...</div>

  return (
    <div className="p-4 lg:p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Entrenamientos</h1>
        <Button onClick={() => setNewModal(true)}><Plus size={16} /> Nuevo</Button>
      </div>

      {entrenamientos.length === 0 ? (
        <EmptyState icon={Dumbbell} title="Sin entrenamientos" action={<Button onClick={() => setNewModal(true)}>Crear entrenamiento</Button>} />
      ) : (
        <div className="space-y-3">
          {entrenamientos.map(e => (
            <Card key={e.id} className="cursor-pointer hover:border-slate-500 transition-colors" onClick={() => openAsistencia(e)}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-white">{formatDate(e.fecha)}</p>
                    <Badge variant={e.fecha < today ? 'slate' : 'blue'}>{e.fecha < today ? 'Pasado' : 'Próximo'}</Badge>
                  </div>
                  <p className="text-sm text-slate-400">{e.horario && <span>{e.horario}</span>}{e.lugar && <span> · {e.lugar}</span>}</p>
                </div>
                <ChevronRight size={16} className="text-slate-500" />
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal open={newModal} onClose={() => setNewModal(false)} title="Nuevo entrenamiento">
        <div className="space-y-4">
          <Input label="Fecha *" type="date" value={form.fecha} onChange={e => setForm(f => ({...f, fecha: e.target.value}))} />
          <Input label="Horario" placeholder="Ej: 20:00 hs" value={form.horario} onChange={e => setForm(f => ({...f, horario: e.target.value}))} />
          <Input label="Lugar" value={form.lugar} onChange={e => setForm(f => ({...f, lugar: e.target.value}))} />
          <Textarea label="Notas" rows={3} value={form.notas} onChange={e => setForm(f => ({...f, notas: e.target.value}))} />
          <div className="flex gap-3 pt-2"><Button variant="secondary" className="flex-1" onClick={() => setNewModal(false)}>Cancelar</Button><Button className="flex-1" loading={saving} onClick={createEntrenamiento}>Crear</Button></div>
        </div>
      </Modal>

      <Modal open={!!asistModal} onClose={() => setAsistModal(null)} title={`Asistencia — ${asistModal ? formatDate(asistModal.fecha) : ''}`} size="lg">
        {asistModal && (
          <div className="space-y-4">
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {jugadores.map(j => (
                <div key={j.id} className="flex items-center justify-between py-2.5 px-3 rounded-lg bg-slate-700/30 cursor-pointer hover:bg-slate-700/60" onClick={() => setAsistencias(a => ({...a, [j.id]: !a[j.id]}))}>
                  <span className="text-sm text-white">{j.nombre} {j.apellido}</span>
                  {asistencias[j.id] ? <CheckCircle size={20} className="text-green-400" /> : <XCircle size={20} className="text-slate-500" />}
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-slate-700">
              <p className="text-sm text-slate-400">{Object.values(asistencias).filter(Boolean).length} / {jugadores.length} presentes</p>
              <Button loading={saving} onClick={saveAsistencia}>Guardar asistencia</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
