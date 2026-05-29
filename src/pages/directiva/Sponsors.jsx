import { useEffect, useState } from 'react'
import { api } from '../../lib/api'
import { Button } from '../../components/Button'
import { Card } from '../../components/Card'
import { Modal } from '../../components/Modal'
import { Input, Select, Textarea } from '../../components/Input'
import { Badge } from '../../components/Badge'
import { EmptyState } from '../../components/EmptyState'
import { formatCurrency, formatDate } from '../../lib/utils'
import { Plus, Handshake, CheckCircle2, Clock, AlertCircle, ChevronRight, Phone, Mail } from 'lucide-react'
import { toast } from 'sonner'

const estadoBadge = { activo: 'green', inactivo: 'slate', 'negociación': 'yellow', vigente: 'green', vencido: 'slate', cancelado: 'red', pendiente: 'yellow', cobrado: 'green' }
const cobrosIcon = { cobrado: CheckCircle2, pendiente: Clock, vencido: AlertCircle }

export default function Sponsors() {
  const [sponsors, setSponsors] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [detalle, setDetalle] = useState(null)
  const [newSponsorModal, setNewSponsorModal] = useState(false)
  const [newAcuerdoModal, setNewAcuerdoModal] = useState(false)
  const [cobrarModal, setCobrarModal] = useState(null)
  const [saving, setSaving] = useState(false)

  const [sForm, setSForm] = useState({ nombre: '', contacto_nombre: '', contacto_tel: '', contacto_email: '', estado: 'activo', notas: '' })
  const [aForm, setAForm] = useState({ descripcion: '', monto_total: '', monto_por_cuota: '', frecuencia: 'mensual', fecha_inicio: '', fecha_fin: '', estado: 'vigente' })
  const [cobrarForm, setCobrarForm] = useState({ fecha_cobro: new Date().toISOString().split('T')[0], notas: '' })

  useEffect(() => { loadSponsors() }, [])

  function loadSponsors() { api.get('/api/directiva/sponsors').then(setSponsors).finally(() => setLoading(false)) }

  async function openSponsor(s) {
    setSelected(s)
    const data = await api.get(`/api/directiva/sponsors/${s.id}/detalle`)
    setDetalle(data)
  }

  async function createSponsor() {
    if (!sForm.nombre) { toast.error('Nombre requerido'); return }
    setSaving(true)
    try { await api.post('/api/directiva/sponsors', sForm); toast.success('Sponsor creado'); setNewSponsorModal(false); setSForm({ nombre: '', contacto_nombre: '', contacto_tel: '', contacto_email: '', estado: 'activo', notas: '' }); loadSponsors() }
    catch { toast.error('Error') }
    setSaving(false)
  }

  async function createAcuerdo() {
    if (!aForm.descripcion || !aForm.fecha_inicio) { toast.error('Datos incompletos'); return }
    setSaving(true)
    try { await api.post('/api/directiva/acuerdos', { ...aForm, sponsor_id: selected.id, monto_total: parseFloat(aForm.monto_total)||null, monto_por_cuota: parseFloat(aForm.monto_por_cuota)||null }); toast.success('Acuerdo creado'); setNewAcuerdoModal(false); openSponsor(selected) }
    catch { toast.error('Error') }
    setSaving(false)
  }

  async function registrarCobro() {
    setSaving(true)
    try { await api.put(`/api/directiva/cobros/${cobrarModal.id}`, { estado: 'cobrado', ...cobrarForm }); toast.success('Cobro registrado'); setCobrarModal(null); openSponsor(selected) }
    catch { toast.error('Error') }
    setSaving(false)
  }

  if (selected) {
    const s = selected
    const acuerdos = detalle?.acuerdos || []
    const cobros = detalle?.cobros || []

    return (
      <div className="p-4 lg:p-6 space-y-5 max-w-3xl">
        <button onClick={() => { setSelected(null); setDetalle(null) }} className="text-sm text-green-400 hover:underline">← Volver</button>
        <div className="flex items-start justify-between">
          <div><h1 className="text-2xl font-bold text-white">{s.nombre}</h1><Badge variant={estadoBadge[s.estado] || 'slate'} className="mt-1">{s.estado}</Badge></div>
          <Button size="sm" onClick={() => setNewAcuerdoModal(true)}><Plus size={14} /> Acuerdo</Button>
        </div>

        <Card>
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Contacto</h2>
          <div className="space-y-2">
            {s.contacto_nombre && <p className="text-sm text-white">{s.contacto_nombre}</p>}
            {s.contacto_tel && <p className="text-sm text-slate-300 flex items-center gap-2"><Phone size={12} />{s.contacto_tel}</p>}
            {s.contacto_email && <p className="text-sm text-slate-300 flex items-center gap-2"><Mail size={12} />{s.contacto_email}</p>}
            {s.notas && <p className="text-xs text-slate-500 mt-2">{s.notas}</p>}
          </div>
        </Card>

        <Card>
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Acuerdos</h2>
          {acuerdos.length === 0 ? <p className="text-slate-500 text-sm py-4 text-center">Sin acuerdos</p> : (
            <div className="space-y-3">
              {acuerdos.map(a => (
                <div key={a.id} className="bg-slate-700/30 rounded-lg p-3">
                  <div className="flex items-start justify-between"><p className="text-sm font-medium text-white">{a.descripcion}</p><Badge variant={estadoBadge[a.estado] || 'slate'}>{a.estado}</Badge></div>
                  <div className="flex gap-4 mt-2 text-xs text-slate-400">
                    {a.monto_total && <span>Total: {formatCurrency(a.monto_total)}</span>}
                    {a.monto_por_cuota && <span>Cuota: {formatCurrency(a.monto_por_cuota)}</span>}
                    <span className="capitalize">{a.frecuencia}</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">{formatDate(a.fecha_inicio)} — {formatDate(a.fecha_fin)}</p>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Cobros</h2>
          {cobros.length === 0 ? <p className="text-slate-500 text-sm py-4 text-center">Sin cobros</p> : (
            <div className="space-y-2">
              {cobros.map(c => {
                const Icon = cobrosIcon[c.estado] || Clock
                return (
                  <div key={c.id} className="flex items-center justify-between py-2 border-b border-slate-700/50 last:border-0">
                    <div className="flex items-center gap-3">
                      <Icon size={16} className={c.estado === 'cobrado' ? 'text-green-400' : c.estado === 'vencido' ? 'text-red-400' : 'text-yellow-400'} />
                      <div>
                        <p className="text-sm text-white">{formatCurrency(c.monto)}</p>
                        <p className="text-xs text-slate-500">{c.estado === 'cobrado' ? `Cobrado ${formatDate(c.fecha_cobro)}` : `Vence ${formatDate(c.fecha_esperada)}`}</p>
                      </div>
                    </div>
                    {c.estado === 'pendiente' && <Button size="sm" variant="outline" onClick={() => setCobrarModal(c)}>Cobrar</Button>}
                  </div>
                )
              })}
            </div>
          )}
        </Card>

        <Modal open={newAcuerdoModal} onClose={() => setNewAcuerdoModal(false)} title="Nuevo acuerdo">
          <div className="space-y-4">
            <Input label="Descripción *" value={aForm.descripcion} onChange={e => setAForm(f => ({...f, descripcion: e.target.value}))} />
            <div className="grid grid-cols-2 gap-4">
              <Input label="Monto total" type="number" value={aForm.monto_total} onChange={e => setAForm(f => ({...f, monto_total: e.target.value}))} />
              <Input label="Monto por cuota" type="number" value={aForm.monto_por_cuota} onChange={e => setAForm(f => ({...f, monto_por_cuota: e.target.value}))} />
            </div>
            <Select label="Frecuencia" value={aForm.frecuencia} onChange={e => setAForm(f => ({...f, frecuencia: e.target.value}))}>
              <option value="mensual">Mensual</option><option value="trimestral">Trimestral</option><option value="anual">Anual</option><option value="único">Único</option>
            </Select>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Inicio *" type="date" value={aForm.fecha_inicio} onChange={e => setAForm(f => ({...f, fecha_inicio: e.target.value}))} />
              <Input label="Vencimiento" type="date" value={aForm.fecha_fin} onChange={e => setAForm(f => ({...f, fecha_fin: e.target.value}))} />
            </div>
            <div className="flex gap-3 pt-2"><Button variant="secondary" className="flex-1" onClick={() => setNewAcuerdoModal(false)}>Cancelar</Button><Button className="flex-1" loading={saving} onClick={createAcuerdo}>Crear</Button></div>
          </div>
        </Modal>

        <Modal open={!!cobrarModal} onClose={() => setCobrarModal(null)} title="Registrar cobro" size="sm">
          <div className="space-y-4">
            <div className="bg-slate-700/30 rounded-lg p-3 text-sm text-slate-300">Monto: <span className="text-white font-semibold">{formatCurrency(cobrarModal?.monto)}</span></div>
            <Input label="Fecha de cobro" type="date" value={cobrarForm.fecha_cobro} onChange={e => setCobrarForm(f => ({...f, fecha_cobro: e.target.value}))} />
            <Textarea label="Notas" rows={2} value={cobrarForm.notas} onChange={e => setCobrarForm(f => ({...f, notas: e.target.value}))} />
            <div className="flex gap-3"><Button variant="secondary" className="flex-1" onClick={() => setCobrarModal(null)}>Cancelar</Button><Button className="flex-1" loading={saving} onClick={registrarCobro}>Confirmar</Button></div>
          </div>
        </Modal>
      </div>
    )
  }

  return (
    <div className="p-4 lg:p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Sponsors</h1>
        <Button onClick={() => setNewSponsorModal(true)}><Plus size={16} /> Nuevo</Button>
      </div>
      {loading ? <p className="text-slate-400">Cargando...</p> :
       sponsors.length === 0 ? <EmptyState icon={Handshake} title="Sin sponsors" action={<Button onClick={() => setNewSponsorModal(true)}>Agregar sponsor</Button>} /> : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sponsors.map(s => (
            <Card key={s.id} className="cursor-pointer hover:border-green-500/40 transition-colors" onClick={() => openSponsor(s)}>
              <div className="flex items-start justify-between">
                <div><p className="font-semibold text-white">{s.nombre}</p>{s.contacto_nombre && <p className="text-xs text-slate-500 mt-0.5">{s.contacto_nombre}</p>}</div>
                <Badge variant={estadoBadge[s.estado] || 'slate'}>{s.estado}</Badge>
              </div>
              <div className="flex items-center justify-between mt-3">
                {s.contacto_email && <p className="text-xs text-slate-500 truncate">{s.contacto_email}</p>}
                <ChevronRight size={14} className="text-slate-500 shrink-0 ml-auto" />
              </div>
            </Card>
          ))}
        </div>
      )}
      <Modal open={newSponsorModal} onClose={() => setNewSponsorModal(false)} title="Nuevo sponsor">
        <div className="space-y-4">
          <Input label="Nombre *" value={sForm.nombre} onChange={e => setSForm(f => ({...f, nombre: e.target.value}))} />
          <Select label="Estado" value={sForm.estado} onChange={e => setSForm(f => ({...f, estado: e.target.value}))}>
            <option value="activo">Activo</option><option value="negociación">En negociación</option><option value="inactivo">Inactivo</option>
          </Select>
          <Input label="Contacto" value={sForm.contacto_nombre} onChange={e => setSForm(f => ({...f, contacto_nombre: e.target.value}))} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Teléfono" value={sForm.contacto_tel} onChange={e => setSForm(f => ({...f, contacto_tel: e.target.value}))} />
            <Input label="Email" type="email" value={sForm.contacto_email} onChange={e => setSForm(f => ({...f, contacto_email: e.target.value}))} />
          </div>
          <Textarea label="Notas" rows={2} value={sForm.notas} onChange={e => setSForm(f => ({...f, notas: e.target.value}))} />
          <div className="flex gap-3 pt-2"><Button variant="secondary" className="flex-1" onClick={() => setNewSponsorModal(false)}>Cancelar</Button><Button className="flex-1" loading={saving} onClick={createSponsor}>Crear</Button></div>
        </div>
      </Modal>
    </div>
  )
}
