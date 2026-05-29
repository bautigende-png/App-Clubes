import { useEffect, useState } from 'react'
import { api } from '../../lib/api'
import { Button } from '../../components/Button'
import { Card } from '../../components/Card'
import { Modal } from '../../components/Modal'
import { Input, Select, Textarea } from '../../components/Input'
import { Badge } from '../../components/Badge'
import { EmptyState } from '../../components/EmptyState'
import { formatDate } from '../../lib/utils'
import { Plus, Package, ArrowUp, ArrowDown, History } from 'lucide-react'
import { toast } from 'sonner'

const categorias = ['camiseta', 'pelota', 'pechera', 'botiquín', 'otro']

export default function Inventario() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [newItemModal, setNewItemModal] = useState(false)
  const [movModal, setMovModal] = useState(null)
  const [histModal, setHistModal] = useState(null)
  const [histData, setHistData] = useState([])
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ nombre: '', categoria: 'otro', cantidad_actual: 0, cantidad_minima: 0, descripcion: '' })
  const [movForm, setMovForm] = useState({ tipo: 'entrada', cantidad: 1, motivo: '', fecha: new Date().toISOString().split('T')[0] })

  useEffect(() => { load() }, [])

  function load() { api.get('/api/directiva/inventario').then(setItems).finally(() => setLoading(false)) }

  async function createItem() {
    if (!form.nombre) { toast.error('Nombre requerido'); return }
    setSaving(true)
    try { await api.post('/api/directiva/inventario', form); toast.success('Ítem creado'); setNewItemModal(false); setForm({ nombre: '', categoria: 'otro', cantidad_actual: 0, cantidad_minima: 0, descripcion: '' }); load() }
    catch { toast.error('Error al crear') }
    setSaving(false)
  }

  async function registrarMovimiento() {
    setSaving(true)
    try {
      await api.post('/api/directiva/movimientos', { item_id: movModal.id, ...movForm, cantidad: parseInt(movForm.cantidad) })
      toast.success('Movimiento registrado')
      setMovModal(null)
      load()
    } catch (e) { toast.error(e.message || 'Error') }
    setSaving(false)
  }

  async function openHistorial(item) {
    const data = await api.get(`/api/directiva/inventario/${item.id}/movimientos`)
    setHistData(data)
    setHistModal(item)
  }

  function stockStatus(item) {
    if (item.cantidad_actual === 0) return { label: 'Sin stock', variant: 'red' }
    if (item.cantidad_actual < item.cantidad_minima) return { label: 'Bajo stock', variant: 'yellow' }
    return { label: 'OK', variant: 'green' }
  }

  if (loading) return <div className="p-6 text-slate-400">Cargando...</div>

  return (
    <div className="p-4 lg:p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Inventario</h1>
        <Button onClick={() => setNewItemModal(true)}><Plus size={16} /> Nuevo ítem</Button>
      </div>

      {items.length === 0 ? <EmptyState icon={Package} title="Inventario vacío" action={<Button onClick={() => setNewItemModal(true)}>Agregar ítem</Button>} /> : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map(item => {
            const status = stockStatus(item)
            return (
              <Card key={item.id} className={status.variant === 'red' ? 'border-red-500/30' : status.variant === 'yellow' ? 'border-yellow-500/30' : ''}>
                <div className="flex items-start justify-between mb-3">
                  <div><p className="font-semibold text-white">{item.nombre}</p><p className="text-xs text-slate-500 capitalize mt-0.5">{item.categoria}</p></div>
                  <Badge variant={status.variant}>{status.label}</Badge>
                </div>
                <div className="flex items-center justify-between mb-4">
                  <div className="text-center"><p className="text-3xl font-bold text-white">{item.cantidad_actual}</p><p className="text-xs text-slate-500">actual</p></div>
                  <div className="text-slate-600">/</div>
                  <div className="text-center"><p className="text-xl font-bold text-slate-400">{item.cantidad_minima}</p><p className="text-xs text-slate-500">mínimo</p></div>
                </div>
                <div className="flex gap-2">
                  <Button variant="secondary" size="sm" className="flex-1" onClick={() => { setMovModal(item); setMovForm(f => ({...f, tipo: 'entrada'})) }}><ArrowUp size={14} className="text-green-400" /> Entrada</Button>
                  <Button variant="secondary" size="sm" className="flex-1" onClick={() => { setMovModal(item); setMovForm(f => ({...f, tipo: 'salida'})) }}><ArrowDown size={14} className="text-red-400" /> Salida</Button>
                  <Button variant="ghost" size="sm" onClick={() => openHistorial(item)}><History size={14} /></Button>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      <Modal open={newItemModal} onClose={() => setNewItemModal(false)} title="Nuevo ítem">
        <div className="space-y-4">
          <Input label="Nombre *" value={form.nombre} onChange={e => setForm(f => ({...f, nombre: e.target.value}))} />
          <Select label="Categoría" value={form.categoria} onChange={e => setForm(f => ({...f, categoria: e.target.value}))}>
            {categorias.map(c => <option key={c} value={c}>{c}</option>)}
          </Select>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Cantidad actual" type="number" min="0" value={form.cantidad_actual} onChange={e => setForm(f => ({...f, cantidad_actual: parseInt(e.target.value) || 0}))} />
            <Input label="Cantidad mínima" type="number" min="0" value={form.cantidad_minima} onChange={e => setForm(f => ({...f, cantidad_minima: parseInt(e.target.value) || 0}))} />
          </div>
          <Textarea label="Descripción" rows={2} value={form.descripcion} onChange={e => setForm(f => ({...f, descripcion: e.target.value}))} />
          <div className="flex gap-3 pt-2"><Button variant="secondary" className="flex-1" onClick={() => setNewItemModal(false)}>Cancelar</Button><Button className="flex-1" loading={saving} onClick={createItem}>Crear</Button></div>
        </div>
      </Modal>

      <Modal open={!!movModal} onClose={() => setMovModal(null)} title={`Movimiento — ${movModal?.nombre}`} size="sm">
        <div className="space-y-4">
          <Select label="Tipo" value={movForm.tipo} onChange={e => setMovForm(f => ({...f, tipo: e.target.value}))}>
            <option value="entrada">Entrada</option><option value="salida">Salida</option>
          </Select>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Cantidad" type="number" min="1" value={movForm.cantidad} onChange={e => setMovForm(f => ({...f, cantidad: e.target.value}))} />
            <Input label="Fecha" type="date" value={movForm.fecha} onChange={e => setMovForm(f => ({...f, fecha: e.target.value}))} />
          </div>
          <Input label="Motivo" value={movForm.motivo} onChange={e => setMovForm(f => ({...f, motivo: e.target.value}))} />
          <div className="text-xs text-slate-500 bg-slate-700/30 rounded-lg p-3">
            Stock actual: <span className="text-white font-semibold">{movModal?.cantidad_actual}</span>{' → '}
            <span className={`font-semibold ${movForm.tipo === 'entrada' ? 'text-green-400' : 'text-red-400'}`}>
              {movModal ? movModal.cantidad_actual + (movForm.tipo === 'entrada' ? +(movForm.cantidad||0) : -(movForm.cantidad||0)) : 0}
            </span>
          </div>
          <div className="flex gap-3"><Button variant="secondary" className="flex-1" onClick={() => setMovModal(null)}>Cancelar</Button><Button className="flex-1" loading={saving} onClick={registrarMovimiento}>Registrar</Button></div>
        </div>
      </Modal>

      <Modal open={!!histModal} onClose={() => setHistModal(null)} title={`Historial — ${histModal?.nombre}`}>
        {histData.length === 0 ? <p className="text-center text-slate-500 py-8">Sin movimientos</p> : (
          <div className="space-y-2">
            {histData.map(m => (
              <div key={m.id} className="flex items-center justify-between py-2 border-b border-slate-700/50">
                <div><p className="text-sm text-white capitalize">{m.tipo} · {m.motivo || '-'}</p><p className="text-xs text-slate-500">{formatDate(m.fecha)}</p></div>
                <span className={`font-semibold ${m.tipo === 'entrada' ? 'text-green-400' : 'text-red-400'}`}>{m.tipo === 'entrada' ? '+' : '-'}{m.cantidad}</span>
              </div>
            ))}
          </div>
        )}
      </Modal>
    </div>
  )
}
